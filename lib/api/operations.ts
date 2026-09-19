import { apiRequest } from './client';
export interface OperationsOverview {
  projectCount: number;
  queue: { waiting: number; running: number };
  generationTime: { averageSeconds: number | null; sampleSize: number };
  abstention: { count: number; ratePercent: number | null };
}
export interface OperationsEvent {
  occurredAt: string; category: string; event: string; status: string; statusLabel: string;
  detail: string | null; projectId: number; projectName: string; referenceId: number;
}
export const operationsApi = {
  overview: () => apiRequest<OperationsOverview>('/ops/overview'),
  events: () => apiRequest<OperationsEvent[]>('/ops/events?limit=20'),
};
