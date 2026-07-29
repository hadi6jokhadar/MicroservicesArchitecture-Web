import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BackupService,
  IBackupSummary,
  ITriggerBackupRequest,
  IUpdateBackupTargetRequest,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import {
  ZardAlertDialogService,
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardDialogService,
  ZardDropdownImports,
  ZardEmptyComponent,
  ZardIconComponent,
  ZardLoaderComponent,
  ZardSheetService,
  ZardTableBodyComponent,
  ZardTableCellComponent,
  ZardTableComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent,
  ZardTooltipImports,
} from '@ihsan/ui';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { BackupEventsService } from '../backup-events.service';
import { RestoreBackupDialogComponent } from '../restore-backup-dialog/restore-backup-dialog.component';
import { TriggerBackupDialogComponent } from '../trigger-backup-dialog/trigger-backup-dialog.component';
import { ViewBackupRunSheetComponent } from '../view-backup-run-sheet/view-backup-run-sheet.component';

@Component({
  selector: 'app-backup-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    ZardButtonComponent,
    ZardCardComponent,
    ZardBadgeComponent,
    ...ZardDropdownImports,
    ...ZardTooltipImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
  ],
  templateUrl: './backup-overview.component.html',
  styleUrls: ['./backup-overview.component.scss'],
})
export class BackupOverviewComponent {
  private readonly _backupService = inject(BackupService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _translationService = inject(TranslationService);
  private readonly _backupEvents = inject(BackupEventsService);

  readonly summary = this._backupService.summary;
  readonly targets = this._backupService.targets;
  readonly isLoading = this._backupService.isLoading;

  constructor() {
    // Load the raw targets list once so target ids are available for the enable/disable action
    this._backupService.getBackupTargets().subscribe();

    this._backupEvents.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadData());
  }

  loadData(): void {
    this._backupService.getBackupSummary().subscribe();
    this._backupService.getBackupTargets().subscribe();
  }

  trackByItem(_index: number, item: IBackupSummary): string {
    return `${item.scope}-${item.serviceName ?? ''}-${item.tenantId ?? ''}`;
  }

  findTargetId(item: IBackupSummary): number | undefined {
    return this.targets().find(
      (t) =>
        t.scope === item.scope &&
        t.serviceName === item.serviceName &&
        t.tenantId === item.tenantId
    )?.id;
  }

  isTargetEnabled(item: IBackupSummary): boolean {
    return (
      this.targets().find(
        (t) =>
          t.scope === item.scope &&
          t.serviceName === item.serviceName &&
          t.tenantId === item.tenantId
      )?.isEnabled ?? true
    );
  }

  getTargetLabelKey(scope: string): string {
    return scope === 'GlobalService' ? 'backup.scope.globalService' : 'backup.scope.tenant';
  }

  getStatusBadgeType(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
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

  getLocalStatusBadgeType(status?: string): 'default' | 'destructive' | 'outline' {
    switch (status) {
      case 'Saved':
        return 'default';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  getCloudStatusBadgeType(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
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

  onTriggerBackup(item: IBackupSummary): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        'backup.overview.dialog.triggerTitle'
      ),
      zDescription: this._translationService
        .getCachedTranslation('backup.overview.dialog.triggerDescription')
        .replace('{name}', item.displayName),
      zOkText: this._translationService.getCachedTranslation(
        'backup.overview.actions.triggerNow'
      ),
      zCancelText: this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: false,
      zOnOk: () => {
        const request: ITriggerBackupRequest = {
          scope: item.scope,
          serviceName: item.serviceName,
          tenantId: item.tenantId,
        };

        this._backupService.triggerBackup(request).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                'backup.overview.success.triggered'
              )
            );
            this._backupEvents.notifyDataChanged();
          },
          error: () => {
            toast.error(
              this._translationService.getCachedTranslation(
                'backup.overview.error.triggerFailed'
              )
            );
          },
        });
      },
    });
  }

  onToggleEnable(item: IBackupSummary): void {
    const targetId = this.findTargetId(item);
    if (!targetId) return;

    const enabled = this.isTargetEnabled(item);
    const action = enabled
      ? this._translationService.getCachedTranslation('backup.overview.actions.disable')
      : this._translationService.getCachedTranslation('backup.overview.actions.enable');

    const title = enabled
      ? this._translationService.getCachedTranslation('backup.overview.dialog.disableTitle')
      : this._translationService.getCachedTranslation('backup.overview.dialog.enableTitle');

    const description = enabled
      ? this._translationService.getCachedTranslation(
          'backup.overview.dialog.disableDescription'
        )
      : this._translationService.getCachedTranslation(
          'backup.overview.dialog.enableDescription'
        );

    this._alertDialogService.confirm({
      zTitle: title,
      zDescription: description.replace('{name}', item.displayName),
      zOkText: action,
      zCancelText: this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: enabled,
      zOnOk: () => {
        const request: IUpdateBackupTargetRequest = {
          id: targetId,
          isEnabled: !enabled,
        };

        this._backupService.updateBackupTarget(targetId, request).subscribe({
          next: () => {
            const successMsg = enabled
              ? this._translationService.getCachedTranslation(
                  'backup.overview.success.disabled'
                )
              : this._translationService.getCachedTranslation(
                  'backup.overview.success.enabled'
                );
            toast.success(successMsg);
            this._backupEvents.notifyDataChanged();
          },
          error: () => {
            toast.error(
              this._translationService.getCachedTranslation(
                'backup.overview.error.toggleFailed'
              )
            );
          },
        });
      },
    });
  }

  onViewLastRun(item: IBackupSummary): void {
    if (!item.lastBackupRunId) return;

    this._sheetService.create({
      zContent: ViewBackupRunSheetComponent,
      zData: { runId: item.lastBackupRunId },
      zSide: 'right',
      zClosable: false,
      zHideFooter: true,
    });
  }

  onNewBackup(): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation('backup.triggerDialog.title'),
      zContent: TriggerBackupDialogComponent,
      zWidth: '500px',
      zHideFooter: true,
      zClosable: false,
    });
  }

  onRestore(item: IBackupSummary): void {
    if (!item.lastBackupRunId) return;

    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation('backup.restoreDialog.title'),
      zContent: RestoreBackupDialogComponent,
      zData: { backupRunId: item.lastBackupRunId },
      zWidth: '500px',
      zHideFooter: true,
      zClosable: false,
    });
  }
}
