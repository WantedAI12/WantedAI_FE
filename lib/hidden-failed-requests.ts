const key = (projectId: string) => `perfumery:hidden-failed-requests:v2:${projectId}`;
const validIds = (value: unknown): number[] => Array.isArray(value)
  ? [...new Set(value.filter((id): id is number => Number.isSafeInteger(id) && id > 0))]
  : [];

export function readHiddenRequests(storage: Pick<Storage, 'getItem'>, projectId: string): number[] {
  if (!projectId) return [];
  try { return validIds(JSON.parse(storage.getItem(key(projectId)) ?? '[]')); }
  catch { return []; }
}

export function saveHiddenRequests(storage: Pick<Storage, 'setItem'>, projectId: string, ids: number[]): boolean {
  if (!projectId) return false;
  try { storage.setItem(key(projectId), JSON.stringify(validIds(ids))); return true; }
  catch { return false; }
}
