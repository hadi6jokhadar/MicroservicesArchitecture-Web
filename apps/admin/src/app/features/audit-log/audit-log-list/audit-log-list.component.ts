import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AuditLogService,
  AuditLogSource,
  IAuditLog,
  IAuditLogSourceOption,
  IPaginatedResponse,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import {
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardDatePickerComponent,
  ZardDividerComponent,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardSelectImports,
  ZardTableImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';

interface IAuditLogFilterForm {
  userId: FormControl<string>;
  action: FormControl<string>;
  entityType: FormControl<string>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  sortBy: FormControl<string>;
  sortDescending: FormControl<string>;
}

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    TranslatePipe,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    ZardDatePickerComponent,
    ZardDividerComponent,
    ...ZardFormImports,
    ...ZardPaginationImports,
    ...ZardSelectImports,
    ...ZardTableImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrls: ['./audit-log-list.component.scss'],
})
export class AuditLogListComponent {
  private readonly _auditLogService = inject(AuditLogService);
  private readonly _translationService = inject(TranslationService);

  readonly isLoading = signal(false);
  readonly logs = signal<IAuditLog[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 20;

  readonly selectedSource = signal<AuditLogSource>('identity');

  readonly sources: IAuditLogSourceOption[] = [
    { value: 'identity', labelKey: 'auditLog.sources.identity' },
    { value: 'tenant', labelKey: 'auditLog.sources.tenant' },
    { value: 'notification', labelKey: 'auditLog.sources.notification' },
    { value: 'fileManager', labelKey: 'auditLog.sources.fileManager' },
    { value: 'translation', labelKey: 'auditLog.sources.translation' },
    { value: 'category', labelKey: 'auditLog.sources.category' },
    { value: 'nasheed', labelKey: 'auditLog.sources.nasheed' },
  ];

  readonly sortByOptions = [
    { value: 'timestamp', labelKey: 'auditLog.table.timestamp' },
    { value: 'action', labelKey: 'auditLog.table.action' },
    { value: 'entityType', labelKey: 'auditLog.table.entityType' },
    { value: 'userId', labelKey: 'common.userId' },
  ];

  readonly filterForm = new FormGroup<IAuditLogFilterForm>({
    userId: new FormControl<string>('', { nonNullable: true }),
    action: new FormControl<string>('', { nonNullable: true }),
    entityType: new FormControl<string>('', { nonNullable: true }),
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
    sortBy: new FormControl<string>('timestamp', { nonNullable: true }),
    sortDescending: new FormControl<string>('true', { nonNullable: true }),
  });

  readonly sourceForm = new FormGroup({
    source: new FormControl<AuditLogSource>('identity', { nonNullable: true }),
  });

  constructor() {
    this.sourceForm.controls.source.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((src) => {
        this.selectedSource.set(src);
        this.currentPage.set(1);
        this.loadData();
      });

    this.loadData();
  }

  loadData(): void {
    const raw = this.filterForm.getRawValue();
    this.isLoading.set(true);

    this._auditLogService
      .getAuditLogs(this.selectedSource(), {
        page: this.currentPage(),
        pageSize: this.pageSize,
        userId: raw.userId || undefined,
        action: raw.action || undefined,
        entityType: raw.entityType || undefined,
        fromDate: raw.startDate ? raw.startDate.toISOString() : undefined,
        toDate: raw.endDate ? raw.endDate.toISOString() : undefined,
        sortBy: raw.sortBy || undefined,
        sortDesc: raw.sortDescending === 'true',
      })
      .subscribe({
        next: (res: IPaginatedResponse<IAuditLog>) => {
          this.logs.set(res.items);
          this.totalPages.set(res.totalPages);
          this.totalCount.set(res.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          toast.error(
            this._translationService.getCachedTranslation(
              'auditLog.messages.loadFailed',
            ),
          );
        },
      });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      userId: '',
      action: '',
      entityType: '',
      startDate: null,
      endDate: null,
      sortBy: 'timestamp',
      sortDescending: 'true',
    });
    this.currentPage.set(1);
    this.loadData();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadData();
  }

  readonly expandedLogId = signal<string | null>(null);

  toggleDetails(id: string): void {
    this.expandedLogId.set(this.expandedLogId() === id ? null : id);
  }

  formatJson(jsonString: string | null): string {
    if (!jsonString) return '-';
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  }

  getActionBadgeType(
    action: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    const lower = action.toLowerCase();
    if (lower === 'delete' || lower === 'remove') return 'destructive';
    if (lower === 'create' || lower === 'insert') return 'default';
    if (lower === 'update' || lower === 'modify') return 'secondary';
    return 'outline';
  }
}
