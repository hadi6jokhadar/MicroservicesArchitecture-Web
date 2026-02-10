import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ENVIRONMENT,
  ITenant,
  TenantService,
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
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardSelectComponent,
  ZardSelectItemComponent,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { TenantDialogComponent } from '../tenant-dialog/tenant-dialog.component';

interface ITenantFilterForm {
  searchTerm: FormControl<string>;
  isActive: FormControl<string>;
}

@Component({
  selector: 'app-tenant-list',
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
    ZardIconComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
  ],
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss'],
})
export class TenantListComponent implements OnInit {
  private readonly _tenantService = inject(TenantService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _translationService = inject(TranslationService);
  protected readonly _env = inject(ENVIRONMENT);

  // Signals
  readonly tenants = this._tenantService.tenants;
  readonly isLoading = this._tenantService.isLoading;
  readonly filteredTenants = signal<ITenant[]>([]);
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  // Computed signals
  readonly totalCount = signal(0);
  readonly totalPages = signal(1);

  // Filter Form
  readonly filterForm = new FormGroup<ITenantFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    isActive: new FormControl<string>('__all__', { nonNullable: true }),
  });

  constructor() {
    // Watch for tenants signal changes to update filtered list
    effect(
      () => {
        // Trigger filter update when tenants list changes (e.g. after add/edit/delete)
        // or when the component initializes with data from the resolver
        if (this.tenants().length >= 0) {
          this.applyFilters();
        }
      },
      { allowSignalWrites: true }
    );

    // Watch for filter changes
    this.filterForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.currentPage.set(1);
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    // Initial filter application is handled by the effect
    this.applyFilters();
  }

  applyFilters(): void {
    const { searchTerm, isActive } = this.filterForm.getRawValue();
    let filtered = this.tenants();

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.tenantName.toLowerCase().includes(term) ||
          t.tenantId.toLowerCase().includes(term)
      );
    }

    if (isActive !== '__all__') {
      // The select value is a string, convert to boolean or use string comparison if values are consistent
      const active = isActive === 'true';
      filtered = filtered.filter((t) => t.isActive === active);
    }

    this.totalCount.set(filtered.length);
    this.totalPages.set(Math.ceil(filtered.length / this.pageSize) || 1);
    this.filteredTenants.set(filtered);
  }

  get paginatedTenants(): ITenant[] {
    const tenants = this.filteredTenants();
    if (!tenants) return [];

    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return tenants.slice(start, end);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      isActive: '__all__',
    });
  }

  onAddTenant(): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'tenants.dialog.addTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        'tenants.dialog.addDescription'
      ),
      zContent: TenantDialogComponent,
      zWidth: '550px',
      zHideFooter: true,
      zClosable: false,
    });
  }

  onEditTenant(tenant: ITenant): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'tenants.dialog.editTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        'tenants.dialog.editDescription'
      ),
      zContent: TenantDialogComponent,
      zData: { tenant },
      zHideFooter: true,
      zClosable: true,
      zWidth: '550px',
    });
  }

  onDeleteTenant(tenant: ITenant): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        'tenants.dialog.deleteTitle'
      ),
      zDescription: this._translationService
        .getCachedTranslation('tenants.dialog.deleteDescription')
        .replace('{name}', tenant.tenantName),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._tenantService.deleteTenant(tenant.tenantId).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                'tenants.success.tenantDeleted'
              )
            );
            // Service handles refresh via tap()
          },
          error: (error) => {
            console.error('Error deleting tenant:', error);
            toast.error(
              this._translationService.getCachedTranslation(
                'tenants.error.deleteFailed'
              )
            );
          },
        });
      },
    });
  }
}
