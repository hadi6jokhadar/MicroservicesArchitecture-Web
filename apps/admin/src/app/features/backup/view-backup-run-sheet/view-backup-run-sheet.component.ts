import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Z_SHEET_DATA,
  ZardSheetRef,
  ZardDialogService,
  ZardButtonComponent,
  ZardIconComponent,
  ZardBadgeComponent,
  ZardLoaderComponent,
  ZardAlertComponent,
} from '@ihsan/ui';
import { BackupService, IBackupRun, TranslatePipe } from '@ihsan/core';
import { RestoreBackupDialogComponent } from '../restore-backup-dialog/restore-backup-dialog.component';

export interface ViewBackupRunSheetData {
  runId: number;
}

@Component({
  selector: 'app-view-backup-run-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardLoaderComponent,
    ZardAlertComponent,
  ],
  templateUrl: './view-backup-run-sheet.component.html',
  styleUrl: './view-backup-run-sheet.component.scss',
})
export class ViewBackupRunSheetComponent implements OnInit {
  private readonly _data = inject<ViewBackupRunSheetData>(Z_SHEET_DATA);
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _backupService = inject(BackupService);
  private readonly _dialogService = inject(ZardDialogService);

  readonly run = signal<IBackupRun | null>(null);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    if (this._data?.runId) {
      this.isLoading.set(true);
      this._backupService.getBackupRunById(this._data.runId).subscribe({
        next: (run) => {
          this.run.set(run);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    }
  }

  getTargetLabel(run: IBackupRun): string {
    return run.scope === 'GlobalService'
      ? run.serviceName || '-'
      : run.tenantId || '-';
  }

  getStatusBadgeType(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Running':
        return 'secondary';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  getLocalStatusBadgeType(status: string): 'default' | 'destructive' | 'outline' {
    switch (status) {
      case 'Saved':
        return 'default';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  getCloudStatusBadgeType(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'Uploaded':
        return 'default';
      case 'Uploading':
        return 'secondary';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  formatBytes(bytes?: number): string {
    if (bytes === undefined || bytes === null) return '-';
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  onRestore(): void {
    const run = this.run();
    if (!run) return;

    this._sheetRef.close();

    this._dialogService.create({
      zContent: RestoreBackupDialogComponent,
      zData: { backupRunId: run.id },
      zWidth: '500px',
      zHideFooter: true,
      zClosable: false,
    });
  }

  onClose(): void {
    this._sheetRef.close();
  }
}
