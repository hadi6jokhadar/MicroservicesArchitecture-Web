import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AiSettingsScopeFilter,
  AiSettingsService,
  IAiProviderSetting,
  MODEL_TYPE_OPTIONS,
  queryParamNumber,
  TranslatePipe,
  TranslationService,
  updateQueryParams,
} from '@ihsan/core';
import {
  ZardAlertDialogService,
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardDialogService,
  ZardDropdownImports,
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
import { AiSettingsEventsService } from '../ai-settings-events.service';
import { AddEditAiSettingDialogComponent } from './add-edit-ai-setting-dialog/add-edit-ai-setting-dialog.component';

interface IAiSettingsFilterForm {
  searchTerm: FormControl<string>;
  provider: FormControl<string>;
  modelType: FormControl<string>;
  scope: FormControl<AiSettingsScopeFilter>;
}

@Component({
  selector: 'app-ai-settings',
  standalone: true,
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
    ...ZardTableImports,
    ...ZardSelectImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
  ],
  templateUrl: './ai-settings.component.html',
  styleUrls: ['./ai-settings.component.scss'],
})
export class AiSettingsComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _aiSettingsService = inject(AiSettingsService);
  private readonly _translationService = inject(TranslationService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _eventsService = inject(AiSettingsEventsService);
  private readonly _router = inject(Router);

  readonly isLoading = signal(false);
  readonly settings = signal<IAiProviderSetting[]>(
    (this._route.snapshot.data['settings'] as
      | IAiProviderSetting[]
      | undefined) || []
  );

  readonly currentPage = signal(1);
  readonly pageSize = 10;
  readonly modelTypeOptions = MODEL_TYPE_OPTIONS;
  readonly scopeOptions: AiSettingsScopeFilter[] = ['all', 'tenant', 'global'];

  readonly filterForm = new FormGroup<IAiSettingsFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    provider: new FormControl<string>('', { nonNullable: true }),
    modelType: new FormControl<string>('__all__', { nonNullable: true }),
    scope: new FormControl<AiSettingsScopeFilter>('all', { nonNullable: true }),
  });

  readonly filterValues = signal(this.filterForm.getRawValue());

  readonly filteredSettings = computed(() => {
    const formValue = this.filterValues();
    const searchTerm = (formValue.searchTerm || '').trim().toLowerCase();
    const providerFilter = (formValue.provider || '').trim().toLowerCase();
    const modelTypeFilter = formValue.modelType;

    return this.settings().filter((setting) => {
      const matchesSearch =
        !searchTerm ||
        setting.Provider.toLowerCase().includes(searchTerm) ||
        setting.ModelName.toLowerCase().includes(searchTerm) ||
        setting.ModelType.toLowerCase().includes(searchTerm) ||
        (setting.TenantId || '').toLowerCase().includes(searchTerm) ||
        (setting.Description || '').toLowerCase().includes(searchTerm);

      const matchesProvider =
        !providerFilter ||
        setting.Provider.toLowerCase().includes(providerFilter);

      const matchesModelType =
        modelTypeFilter === '__all__' ||
        !modelTypeFilter ||
        setting.ModelType === modelTypeFilter;

      return matchesSearch && matchesProvider && matchesModelType;
    });
  });

  readonly totalCount = computed(() => this.filteredSettings().length);
  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.totalCount() / this.pageSize);
    return pages > 0 ? pages : 1;
  });

  readonly pagedSettings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredSettings().slice(start, end);
  });

  constructor() {
    this.filterForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.filterValues.set(this.filterForm.getRawValue());
      this.currentPage.set(1);
    });

    this._eventsService.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadData());

    effect(() => {
      const currentPage = this.currentPage();
      const totalPages = this.totalPages();
      if (currentPage > totalPages) {
        this.currentPage.set(totalPages);
      }
    });

    // `scope` is server-only (no client-side equivalent in `filteredSettings`),
    // so restoring it from a different value than currently loaded must
    // refetch; page-only navigation (scope unchanged) must not, since paging
    // is purely a client-side slice over the already-fetched `settings`.
    this._route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((map) => this.restoreFromQueryParams(map));
  }

  private restoreFromQueryParams(map: ParamMap): void {
    const previousScope = this.filterForm.controls.scope.value;
    this.currentPage.set(queryParamNumber(map, 'page', 1));
    const restoredScope = (map.get('scope') as AiSettingsScopeFilter) || 'all';
    this.filterForm.patchValue(
      {
        searchTerm: map.get('searchTerm') ?? '',
        provider: map.get('provider') ?? '',
        modelType: map.get('modelType') ?? '__all__',
        scope: restoredScope,
      },
      { emitEvent: false }
    );
    this.filterValues.set(this.filterForm.getRawValue());
    if (restoredScope !== previousScope) {
      this.loadData();
    }
  }

  private writeStateToUrl(replaceUrl = true): void {
    const { searchTerm, provider, modelType, scope } =
      this.filterForm.getRawValue();
    updateQueryParams(
      this._router,
      this._route,
      {
        page: this.currentPage() > 1 ? this.currentPage() : undefined,
        searchTerm: searchTerm || undefined,
        provider: provider || undefined,
        modelType: modelType !== '__all__' ? modelType : undefined,
        scope: scope !== 'all' ? scope : undefined,
      },
      replaceUrl
    );
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.writeStateToUrl(false);
  }

  loadData(): void {
    const selectedScope = this.filterForm.controls.scope.value;
    this.isLoading.set(true);
    this._aiSettingsService.getSettings(selectedScope).subscribe({
      next: (response) => {
        this.settings.set(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        toast.error(
          this._translationService.getCachedTranslation(
            'aiSettings.messages.loadFailed'
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
    this.filterForm.reset({
      searchTerm: '',
      provider: '',
      modelType: '__all__',
      scope: 'all',
    });
    this.loadData();
    this.currentPage.set(1);
    this.writeStateToUrl();
  }

  onAddSetting(): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'aiSettings.dialog.addTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        'aiSettings.dialog.addDescription'
      ),
      zContent: AddEditAiSettingDialogComponent,
      zHideFooter: true,
      zWidth: 'fit-content',
      zCustomClasses: 'z-dialog-max-width-100',
      zClosable: false,
    });
  }

  onEditSetting(setting: IAiProviderSetting): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'aiSettings.dialog.editTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        'aiSettings.dialog.editDescription'
      ),
      zContent: AddEditAiSettingDialogComponent,
      zData: { setting },
      zHideFooter: true,
      zWidth: 'fit-content',
      zCustomClasses: 'z-dialog-max-width-100',
      zClosable: true,
    });
  }

  onDuplicateSetting(setting: IAiProviderSetting): void {
    // Clone setting and remove ID to indicate it's a new entry
    const duplicateSetting = { ...setting, Id: undefined };
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'aiSettings.dialog.addTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        'aiSettings.dialog.addDescription'
      ),
      zContent: AddEditAiSettingDialogComponent,
      zData: { setting: duplicateSetting },
      zHideFooter: true,
      zWidth: 'fit-content',
      zCustomClasses: 'z-dialog-max-width-100',
      zClosable: true,
    });
  }

  onDeleteSetting(setting: IAiProviderSetting): void {
    const description = this._translationService
      .getCachedTranslation('aiSettings.dialog.deleteDescription')
      .replace('{provider}', setting.Provider)
      .replace('{modelName}', setting.ModelName);

    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        'aiSettings.dialog.deleteTitle'
      ),
      zDescription: description,
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._aiSettingsService.deleteSetting(setting.Id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                'aiSettings.messages.deleted'
              )
            );
            this._eventsService.notifyDataChanged();
          },
          error: () => {
            toast.error(
              this._translationService.getCachedTranslation(
                'aiSettings.messages.deleteFailed'
              )
            );
          },
        });
      },
    });
  }

  getMaskedApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) {
      return '********';
    }

    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
  }

  getTenantBadgeType(
    tenantId?: string | null
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    return tenantId ? 'outline' : 'default';
  }
}
