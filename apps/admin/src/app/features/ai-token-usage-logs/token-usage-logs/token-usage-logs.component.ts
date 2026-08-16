import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  AiChatService,
  IAiTokenUsageLog,
  IAiTokenUsageStatsFilter,
  queryParamNumber,
  TranslatePipe,
  TranslationService,
  updateQueryParams,
} from '@ihsan/core';
import {
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardTableImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { TokenUsageStatsComponent } from '../token-usage-stats/token-usage-stats.component';

interface ITokenLogsFilterForm {
  searchTerm: FormControl<string>;
  modelName: FormControl<string>;
  endpoint: FormControl<string>;
}

@Component({
  selector: 'app-token-usage-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    TranslatePipe,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    ...ZardFormImports,
    ...ZardPaginationImports,
    ...ZardTableImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
    TokenUsageStatsComponent,
  ],
  templateUrl: './token-usage-logs.component.html',
  styleUrls: ['./token-usage-logs.component.scss'],
})
export class TokenUsageLogsComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _aiChatService = inject(AiChatService);
  private readonly _translationService = inject(TranslationService);

  readonly activeView = signal<'table' | 'charts'>('table');
  readonly isLoading = signal(false);
  readonly logs = signal<IAiTokenUsageLog[]>(
    (this._route.snapshot.data['logs'] as IAiTokenUsageLog[] | undefined) || []
  );

  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly filterForm = new FormGroup<ITokenLogsFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    modelName: new FormControl<string>('', { nonNullable: true }),
    endpoint: new FormControl<string>('', { nonNullable: true }),
  });

  readonly filterValues = signal(this.filterForm.getRawValue());

  readonly statsFilter = computed<IAiTokenUsageStatsFilter>(() => {
    const { modelName, endpoint } = this.filterValues();
    return {
      model_name: modelName.trim() || undefined,
      endpoint: endpoint.trim() || undefined,
    };
  });

  readonly filteredLogs = computed(() => {
    const { searchTerm, modelName, endpoint } = this.filterValues();
    const search = searchTerm.trim().toLowerCase();
    const model = modelName.trim().toLowerCase();
    const ep = endpoint.trim().toLowerCase();

    return this.logs().filter((log) => {
      const matchesSearch =
        !search ||
        log.ModelName.toLowerCase().includes(search) ||
        log.Endpoint.toLowerCase().includes(search) ||
        (log.TenantId ?? '').toLowerCase().includes(search) ||
        (log.UserId ?? '').toLowerCase().includes(search);

      const matchesModel =
        !model || log.ModelName.toLowerCase().includes(model);
      const matchesEndpoint = !ep || log.Endpoint.toLowerCase().includes(ep);

      return matchesSearch && matchesModel && matchesEndpoint;
    });
  });

  readonly totalCount = computed(() => this.filteredLogs().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize))
  );
  readonly pagedLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredLogs().slice(start, start + this.pageSize);
  });

  constructor() {
    this.filterForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.filterValues.set(this.filterForm.getRawValue());
      this.currentPage.set(1);
      this.writeStateToUrl();
    });

    effect(() => {
      if (this.currentPage() > this.totalPages()) {
        this.currentPage.set(this.totalPages());
      }
    });

    // Client-side filtered/paginated over the resolver-preloaded `logs`
    // signal — restoring from the URL needs no HTTP call, the `computed()`s
    // below react to the restored form/page state automatically.
    this._route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((map) => this.restoreFromQueryParams(map));
  }

  private restoreFromQueryParams(map: ParamMap): void {
    this.currentPage.set(queryParamNumber(map, 'page', 1));
    const restored = {
      searchTerm: map.get('searchTerm') ?? '',
      modelName: map.get('modelName') ?? '',
      endpoint: map.get('endpoint') ?? '',
    };
    this.filterForm.patchValue(restored, { emitEvent: false });
    this.filterValues.set(this.filterForm.getRawValue());
  }

  private writeStateToUrl(replaceUrl = true): void {
    const { searchTerm, modelName, endpoint } = this.filterForm.getRawValue();
    updateQueryParams(
      this._router,
      this._route,
      {
        page: this.currentPage() > 1 ? this.currentPage() : undefined,
        searchTerm: searchTerm || undefined,
        modelName: modelName || undefined,
        endpoint: endpoint || undefined,
      },
      replaceUrl
    );
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.writeStateToUrl(false);
  }

  loadData(): void {
    const { modelName, endpoint } = this.filterForm.getRawValue();
    this.isLoading.set(true);
    this._aiChatService
      .getTokenUsageLogs({
        model_name: modelName || undefined,
        endpoint: endpoint || undefined,
      })
      .subscribe({
        next: (data) => {
          this.logs.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          toast.error(
            this._translationService.getCachedTranslation(
              'tokenUsageLogs.messages.loadFailed'
            )
          );
        },
      });
  }

  onSearch(): void {
    this.loadData();
    this.currentPage.set(1);
    this.writeStateToUrl();
  }

  onClearFilters(): void {
    this.filterForm.reset({ searchTerm: '', modelName: '', endpoint: '' });
    this.loadData();
    this.currentPage.set(1);
    this.writeStateToUrl();
  }

  setView(view: 'table' | 'charts'): void {
    this.activeView.set(view);
  }
}
