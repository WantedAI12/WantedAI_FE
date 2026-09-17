import type {
  ApiSuccessResponse,
  ErrorResponse,
  TokenResponse,
} from '@/types/domain';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'development'
    ? '/api/v1'
    : 'https://api.perfumery.studio/api/v1')
).replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'perfumery.access-token';
const REFRESH_TOKEN_KEY = 'perfumery.refresh-token';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: ErrorResponse['error']['details'],
  ) {
    super(message);
  }
}

function getStoredToken(key: string) {
  return typeof window === 'undefined'
    ? null
    : window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
}

export const tokenStorage = {
  getAccessToken: () => getStoredToken(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getStoredToken(REFRESH_TOKEN_KEY),
  isPersistent: () =>
    typeof window !== 'undefined' &&
    window.localStorage.getItem(REFRESH_TOKEN_KEY) !== null,
  set(tokens: TokenResponse, remember = false) {
    const storage = remember ? window.localStorage : window.sessionStorage;
    const otherStorage = remember ? window.sessionStorage : window.localStorage;
    otherStorage.removeItem(ACCESS_TOKEN_KEY);
    otherStorage.removeItem(REFRESH_TOKEN_KEY);
    storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clear() {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) throw new Error('Token refresh failed');
      const payload = (await response.json()) as ApiSuccessResponse<TokenResponse>;
      if (!payload.success || !payload.data?.accessToken) throw new Error('Invalid token response');
      tokenStorage.set(payload.data, tokenStorage.isPersistent());
      return payload.data.accessToken;
    } catch {
      tokenStorage.clear();
      return null;
    }
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json');
  const accessToken = authenticated ? tokenStorage.getAccessToken() : null;
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    if (response.status === 401 && authenticated) {
      const renewedToken = await refreshAccessToken();
      if (renewedToken) {
        headers.set('Authorization', `Bearer ${renewedToken}`);
        response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
      }
    }
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      '백엔드 서버에 연결할 수 없습니다. 서버 주소와 실행 상태를 확인해주세요.',
    );
  }

  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => null)) as
    | ApiSuccessResponse<T>
    | ErrorResponse
    | null;
  if (!response.ok) {
    const error =
      payload && typeof payload === 'object' && 'error' in payload
        ? payload.error
        : null;
    throw new ApiError(
      response.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? `API 요청에 실패했습니다. (${response.status})`,
      error?.details,
    );
  }
  if (response.status === 202 && payload === null) return undefined as T;
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    payload.success === true
  ) {
    return payload.data;
  }

  throw new ApiError(
    response.status,
    'INVALID_RESPONSE',
    '백엔드 응답 형식이 올바르지 않습니다.',
  );
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}
