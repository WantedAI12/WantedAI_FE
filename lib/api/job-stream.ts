import { tokenStorage } from '@/lib/api/client';
import { jobApi } from '@/lib/api/resources';
import type { JobResponse } from '@/types/domain';

const terminalStatuses = new Set<JobResponse['status']>(['SUCCEEDED', 'FAILED', 'CANCELLED']);

/** Subscribe to a job after an authenticated GET has refreshed the access token if needed. */
export function subscribeJobUpdates(
  jobId: number,
  onUpdate: (job: JobResponse) => void,
  onDisconnect: () => void,
): () => void {
  const accessToken = tokenStorage.getAccessToken();
  if (!accessToken || typeof EventSource === 'undefined') {
    queueMicrotask(onDisconnect);
    return () => {};
  }

  const source = new EventSource(jobApi.streamUrl(jobId, accessToken));
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    source.close();
  };
  const disconnect = () => {
    if (closed) return;
    close();
    onDisconnect();
  };

  source.addEventListener('job-update', (event) => {
    try {
      const job = JSON.parse((event as MessageEvent<string>).data) as JobResponse;
      if (job.jobId !== jobId || (!terminalStatuses.has(job.status) && job.status !== 'PENDING' && job.status !== 'RUNNING')) {
        throw new Error('Invalid job update');
      }
      // EventSource otherwise reconnects after the server closes a terminal stream.
      if (terminalStatuses.has(job.status)) close();
      onUpdate(job);
    } catch {
      disconnect();
    }
  });
  source.onerror = disconnect;
  return close;
}
