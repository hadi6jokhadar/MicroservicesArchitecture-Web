import { IngestionJobType } from '../enums/ingestion-job-type.enum';
import { IngestionJobStatus } from '../enums/ingestion-job-status.enum';

export interface IngestionJobModel {
  id: number;
  songId: number;
  songTitle?: string;
  fileId: number;
  type: IngestionJobType;
  status: IngestionJobStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface IngestionJobApiModel {
  id: number;
  songId: number;
  songTitle?: string | null;
  fileId: number;
  jobType: IngestionJobType;
  jobStatus: IngestionJobStatus;
  retryCount: number;
  maxRetries: number;
  lastError?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  created: string;
}

export interface RetryAllFailedIngestionJobsResult {
  retriedCount: number;
  skippedCount: number;
}

export interface RemoveAllFailedIngestionJobsResult {
  removedCount: number;
}

export function mapIngestionJobFromApi(
  job: IngestionJobApiModel,
): IngestionJobModel {
  return {
    id: job.id,
    songId: job.songId,
    songTitle: job.songTitle ?? undefined,
    fileId: job.fileId,
    type: job.jobType,
    status: job.jobStatus,
    retryCount: job.retryCount,
    maxRetries: job.maxRetries,
    errorMessage: job.lastError ?? undefined,
    startedAt: job.startedAt ?? undefined,
    completedAt: job.completedAt ?? undefined,
    createdAt: job.created,
  };
}
