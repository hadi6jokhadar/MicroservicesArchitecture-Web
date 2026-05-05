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
import { IngestionJobModel, IngestionJobStatus } from '@web-app/nasheed-shared';

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

  onClose(): void {
    this._sheetRef.close();
  }
}
