import type { SignalRNotification } from '@ihsan/shared';

/** Marker set on the `data` payload of a SignalR notification pushed by
 * NasheedIngestionWorker.BroadcastProgressAsync whenever a song's ingestion job status changes. */
export const NASHEED_INGESTION_PROGRESS_EVENT = 'nasheed-ingestion-progress';

export function isNasheedIngestionProgressNotification(
  notification: SignalRNotification,
): boolean {
  if (typeof notification?.data !== 'string') return false;
  try {
    return JSON.parse(notification.data)?.event === NASHEED_INGESTION_PROGRESS_EVENT;
  } catch {
    return false;
  }
}
