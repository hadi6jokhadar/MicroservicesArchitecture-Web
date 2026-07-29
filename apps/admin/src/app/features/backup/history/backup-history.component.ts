import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import {
  BackupService,
  IBackupRun,
  IBackupRunFilterRequest,
  IRestoreRun,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardCardComponent,
  ZardBadgeComponent,
  ZardDialogService,
  ZardDropdownImports,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardSheetService,
  ZardTableBodyComponent,
  ZardTableCellComponent,
  ZardTableComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent,
  ZardTooltipImports,
} from '@ihsan/ui';
import { BackupEventsService } from '../backup-events.service';
import { RestoreBackupDialogComponent } from '../restore-backup-dialog/restore-backup-dialog.component';
import { ViewBackupRunSheetComponent } from '../view-backup-run-sheet/view-backup-run-sheet.component';

interface IBackupHistoryFilterForm {
  scope: FormControl<string>;
  status: FormControl<string>;
  serviceName: FormControl<string>;
  tenantId: FormControl<string>;
}

@Component({
  selector: 'app-backup-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    ...ZardDropdownImports,
    ...ZardFormImports,
    ...ZardPaginationImports,
    ZardIconComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
    ...ZardTooltipImports,
  ],
  templateUrl: './backup-history.component.html',
  styleUrls: ['./backup-history.component.scss'],
})
export class BackupHistoryComponent {
  private readonly _backupService = inject(BackupService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _backupEvents = inject(BackupEventsService);
  private readonly _translationService = inject(TranslationService);

  // Tab state
  readonly activeTab = signal<'backups' | 'restores'>('backups');

  // Backup runs signals
  readonly runs = this._backupService.runs;
  readonly isLoading = this._backupService.isLoading;
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly totalCount = this._backupService.totalCount;
  readonly totalPages = computed(
    () => Math.ceil(this.totalCount() / this.pageSize) || 1
  );

  // Restore runs signals
  readonly restoreRuns = this._backupService.restoreRuns;
  readonly isRestoreRunsLoading = this._backupService.isRestoreRunsLoading;
  readonly restoreCurrentPage = signal(1);

  readonly restoreTotalCount = this._backupService.restoreRunsTotalCount;
  readonly restoreTotalPages = computed(
    () => Math.ceil(this.restoreTotalCount() / this.pageSize) || 1
  );

  // Filter Form
  readonly filterForm = new FormGroup<IBackupHistoryFilterForm>({
    scope: new FormControl<string>('all', { nonNullable: true }),
    status: new FormControl<string>('all', { nonNullable: true }),
    serviceName: new FormControl<string>('', { nonNullable: true }),
    tenantId: new FormControl<string>('', { nonNullable: true }),
  });

  constructor() {
    // Watch for page changes (backups)
    effect(() => {
      this.loadData();
    });

    // Watch for page changes (restores)
    effect(() => {
      this.loadRestoreData();
    });

    // Watch for filter changes
    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(300))
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadData();
      });

    // Listen for events triggered elsewhere (overview page, sheet, dialog)
    this._backupEvents.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.loadData();
        this.loadRestoreData();
      });
  }

  loadData(): void {
    const { scope, status, serviceName, tenantId } = this.filterForm.getRawValue();

    const request: IBackupRunFilterRequest = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      scope: scope === 'all' ? undefined : scope,
      status: status === 'all' ? undefined : status,
      serviceName: serviceName || undefined,
      tenantId: tenantId || undefined,
    };

    this._backupService.getBackupRuns(request).subscribe();
  }

  loadRestoreData(): void {
    this._backupService
      .getRestoreRuns({
        pageNumber: this.restoreCurrentPage(),
        pageSize: this.pageSize,
      })
      .subscribe();
  }

  onTabChange(tab: 'backups' | 'restores'): void {
    this.activeTab.set(tab);
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      scope: 'all',
      status: 'all',
      serviceName: '',
      tenantId: '',
    });
  }

  getTargetLabel(run: IBackupRun): string {
    return run.scope === 'GlobalService' ? run.serviceName || '-' : run.tenantId || '-';
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

  onViewRun(run: IBackupRun): void {
    this._sheetService.create({
      zContent: ViewBackupRunSheetComponent,
      zData: { runId: run.id },
      zSide: 'right',
      zClosable: false,
      zHideFooter: true,
    });
  }

  onRestore(run: IBackupRun): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation('backup.restoreDialog.title'),
      zContent: RestoreBackupDialogComponent,
      zData: { backupRunId: run.id },
      zWidth: '500px',
      zHideFooter: true,
      zClosable: false,
    });
  }

  getRestoreStatusBadgeType(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    return this.getStatusBadgeType(status);
  }

  onViewBackupForRestore(restoreRun: IRestoreRun): void {
    this._sheetService.create({
      zContent: ViewBackupRunSheetComponent,
      zData: { runId: restoreRun.backupRunId },
      zSide: 'right',
      zClosable: false,
      zHideFooter: true,
    });
  }
}
