import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardBadgeComponent,
  ZardIconComponent,
  ZardSheetRef,
  Z_SHEET_DATA,
} from '@ihsan/ui';
import {
  IngestionJobModel,
  IngestionJobStatus,
  IngestionJobType,
} from '@web-app/nasheed-shared';

@Component({
  selector: 'app-view-job-sheet',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardIconComponent,
  ],
  templateUrl: './view-job-sheet.component.html',
  styleUrl: './view-job-sheet.component.scss',
})
export class ViewJobSheetComponent {
  private readonly _sheetRef = inject(ZardSheetRef);
  readonly data = inject<{ job: IngestionJobModel }>(Z_SHEET_DATA);

  get job(): IngestionJobModel {
    return this.data.job;
  }

  readonly IngestionJobStatus = IngestionJobStatus;
  readonly IngestionJobType = IngestionJobType;

  getStatusBadgeType(
    status: IngestionJobStatus,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case IngestionJobStatus.Completed:
        return 'default';
      case IngestionJobStatus.Failed:
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  getStatusKey(status: IngestionJobStatus): string {
    switch (status) {
      case IngestionJobStatus.Pending:
        return '#anashid#.ingestion.statuses.pending';
      case IngestionJobStatus.Running:
        return '#anashid#.ingestion.statuses.running';
      case IngestionJobStatus.Completed:
        return '#anashid#.ingestion.statuses.completed';
      case IngestionJobStatus.Failed:
        return '#anashid#.ingestion.statuses.failed';
      case IngestionJobStatus.Removed:
        return '#anashid#.ingestion.statuses.removed';
      case IngestionJobStatus.Cancelled:
        return '#anashid#.ingestion.statuses.cancelled';
      default:
        return '#anashid#.ingestion.statuses.pending';
    }
  }

  getTypeKey(type: IngestionJobType): string {
    switch (type) {
      case IngestionJobType.FullPipeline:
        return '#anashid#.ingestion.types.fullPipeline';
      case IngestionJobType.Transcription:
        return '#anashid#.ingestion.types.transcription';
      case IngestionJobType.LyricsAlignment:
        return '#anashid#.ingestion.types.lyricsAlignment';
      case IngestionJobType.Embedding:
        return '#anashid#.ingestion.types.embedding';
      default:
        return '#anashid#.ingestion.types.fullPipeline';
    }
  }

  onClose(): void {
    this._sheetRef.close();
  }
}
