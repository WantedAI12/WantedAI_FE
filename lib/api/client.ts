import type {
  ApiSuccessResponse,
  ErrorResponse,
  TokenResponse,
} from '@/types/domain';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
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
    : window.sessionStorage.getItem(key);
}

export const tokenStorage = {
  getAccessToken: () => getStoredToken(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getStoredToken(REFRESH_TOKEN_KEY),
  set(tokens: TokenResponse) {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clear() {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

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
