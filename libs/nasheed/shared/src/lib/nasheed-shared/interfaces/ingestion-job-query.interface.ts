import { IngestionJobStatus } from '../enums/ingestion-job-status.enum';
import { IngestionJobType } from '../enums/ingestion-job-type.enum';

export interface IIngestionJobQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: IngestionJobStatus;
  type?: IngestionJobType;
  songId?: number;
}
