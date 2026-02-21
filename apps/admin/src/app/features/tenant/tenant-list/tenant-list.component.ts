import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ENVIRONMENT,
  ITenant,
  ITenantFilterRequest,
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
  ZardSheetService,
  ZardTableBodyComponent,
  ZardTableCellComponent,
  ZardTableComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent,
  ZardSwitchComponent,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { debounceTime } from 'rxjs/operators';
import { TenantConfigurationSheetComponent } from '../tenant-configuration-sheet/tenant-configuration-sheet.component';
import { TenantDialogComponent } from '../tenant-dialog/tenant-dialog.component';
import { TenantEventsService } from '../tenant-events.service';

interface ITenantFilterForm {
  searchTerm: FormControl<string>;
  isActive: FormControl<string>;
  isArchived: FormControl<boolean>;
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
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
    ZardSwitchComponent,
  ],
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss'],
})
export class TenantListComponent {
  private readonly _tenantService = inject(TenantService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _translationService = inject(TranslationService);
  private readonly _eventsService = inject(TenantEventsService);
  private readonly _sheetService = inject(ZardSheetService);
  protected readonly _env = inject(ENVIRONMENT);

  // Signals
  readonly tenants = this._tenantService.tenants;
  readonly isLoading = this._tenantService.isLoading;
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  // Computed signals
  readonly totalCount = this._tenantService.totalCount;
  readonly totalPages = computed(
    () => Math.ceil(this.totalCount() / this.pageSize) || 1
  );

  // Filter Form
  readonly filterForm = new FormGroup<ITenantFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    isActive: new FormControl<string>('__all__', { nonNullable: true }),
    isArchived: new FormControl<boolean>(false, { nonNullable: true }),
  });

  private previousIsArchived = '__all__';

  constructor() {
    // Watch for page changes
    effect(() => {
      this.loadData();
    });

    // Watch for filter changes
    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(), debounceTime(300))
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadData();
      });

    // Listen for events
    this._eventsService.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadData());
  }

  loadData(): void {
    const { searchTerm, isActive, isArchived } = this.filterForm.getRawValue();

    const request: ITenantFilterRequest = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      searchTerm: searchTerm || undefined,
      isActive: isActive === '__all__' ? undefined : isActive === 'true',
      isArchived: isArchived,
    };

    this._tenantService.getAllActiveTenants(request).subscribe();
  }

  onConfigureTenant(tenant: ITenant): void {
    this._sheetService.create({
      // zTitle: this._translationService.getCachedTranslation(
      //   'tenants.configuration.title'
      // ),
      // zDescription: this._translationService.getCachedTranslation(
      //   'tenants.configuration.description'
      // ),
      zContent: TenantConfigurationSheetComponent,
      zData: { tenantId: tenant.tenantId },
      zSide: 'bottom',
      zClosable: false,
      zHideFooter: true,
      zHeight: '62vh',
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      isActive: '__all__',
      isArchived: false,
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

  onToggleArchive(tenant: ITenant): void {
    const action = tenant.isArchived
      ? this._translationService.getCachedTranslation(
          'tenants.actions.unarchive'
        )
      : this._translationService.getCachedTranslation(
          'tenants.actions.archive'
        );

    const title = tenant.isArchived
      ? this._translationService.getCachedTranslation(
          'tenants.dialog.unarchiveTitle'
        )
      : this._translationService.getCachedTranslation(
          'tenants.dialog.archiveTitle'
        );

    const description = tenant.isArchived
      ? this._translationService.getCachedTranslation(
          'tenants.dialog.unarchiveDescription'
        )
      : this._translationService.getCachedTranslation(
          'tenants.dialog.archiveDescription'
        );

    this._alertDialogService.confirm({
      zTitle: title,
      zDescription: description,
      zOkText: action,
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: !tenant.isArchived,
      zOnOk: () => {
        this._tenantService.toggleArchive(tenant.tenantId).subscribe({
          next: () => {
            const successMsg = tenant.isArchived
              ? this._translationService.getCachedTranslation(
                  'tenants.success.tenantUnarchived'
                )
              : this._translationService.getCachedTranslation(
                  'tenants.success.tenantArchived'
                );
            toast.success(successMsg);
            this._eventsService.notifyDataChanged();
          },
          error: (error) => {
            console.error('Error toggling tenant archive status:', error);
            toast.error(
              this._translationService.getCachedTranslation(
                'tenants.error.toggleArchiveFailed'
              )
            );
          },
        });
      },
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
            this._eventsService.notifyDataChanged();
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
