import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  AuditLogService,
  AuditLogSource,
  IAuditLog,
  IAuditLogSourceOption,
  IPaginatedResponse,
  TranslatePipe,
  TranslationService,
  queryParamNumber,
  updateQueryParams,
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
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

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
        this.writeStateToUrl();
      });

    // Sole source of truth for fetching: restores state from the URL (initial
    // load, in-app changes, and browser back/forward alike) then loads data.
    this._route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((map) => {
        this.restoreFromQueryParams(map);
        this.loadData();
      });
  }

  private restoreFromQueryParams(map: ParamMap): void {
    this.currentPage.set(queryParamNumber(map, 'page', 1));

    const source = (map.get('source') as AuditLogSource | null) ?? 'identity';
    this.sourceForm.patchValue({ source }, { emitEvent: false });
    this.selectedSource.set(source);

    this.filterForm.patchValue(
      {
        userId: map.get('userId') ?? '',
        action: map.get('action') ?? '',
        entityType: map.get('entityType') ?? '',
        startDate: map.get('startDate')
          ? new Date(map.get('startDate') as string)
          : null,
        endDate: map.get('endDate')
          ? new Date(map.get('endDate') as string)
          : null,
        sortBy: map.get('sortBy') ?? 'timestamp',
        sortDescending: map.get('sortDescending') ?? 'true',
      },
      { emitEvent: false },
    );
  }

  private writeStateToUrl(replaceUrl = true): void {
    const {
      userId,
      action,
      entityType,
      startDate,
      endDate,
      sortBy,
      sortDescending,
    } = this.filterForm.getRawValue();
    const source = this.sourceForm.controls.source.value;

    updateQueryParams(
      this._router,
      this._route,
      {
        page: this.currentPage() > 1 ? this.currentPage() : undefined,
        source: source !== 'identity' ? source : undefined,
        userId: userId || undefined,
        action: action || undefined,
        entityType: entityType || undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        sortBy: sortBy !== 'timestamp' ? sortBy : undefined,
        sortDescending: sortDescending !== 'true' ? sortDescending : undefined,
      },
      replaceUrl,
    );
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
    this.writeStateToUrl();
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
    this.writeStateToUrl();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.writeStateToUrl(false);
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
