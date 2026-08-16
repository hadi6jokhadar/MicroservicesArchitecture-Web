import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  ClaimService,
  IClaim,
  TranslatePipe,
  TranslationService,
  updateQueryParams,
} from '@ihsan/core';
import {
  ZardAlertDialogService,
  ZardAvatarComponent,
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardDialogService,
  ZardDropdownImports,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardTableBodyComponent,
  ZardTableCellComponent,
  ZardTableComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { AddClaimDialogComponent } from './add-claim-dialog/add-claim-dialog.component';
import { EditClaimDialogComponent } from './edit-claim-dialog/edit-claim-dialog.component';

interface IClaimFilterForm {
  searchTerm: FormControl<string>;
}

@Component({
  selector: 'shared-claims',
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ...ZardFormImports,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardIconComponent,
    ...ZardDropdownImports,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardAvatarComponent,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
  ],
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.scss'],
})
export class ClaimsComponent {
  private readonly _claimService = inject(ClaimService);
  private readonly _translationService = inject(TranslationService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  readonly isLoading = signal(false);
  readonly claims = signal<IClaim[]>([]);
  readonly filteredClaims = signal<IClaim[]>([]);

  readonly filterForm = new FormGroup<IClaimFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
  });

  constructor() {
    // Watch for search term changes using takeUntilDestroyed for proper cleanup
    this.filterForm.controls.searchTerm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.writeStateToUrl();
      });

    // Sole source of truth for fetching: restores state from the URL (initial
    // load, in-app changes, and browser back/forward alike) then loads data.
    this._route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((map) => {
        this.restoreFromQueryParams(map);
        this.loadClaims();
      });
  }

  private restoreFromQueryParams(map: ParamMap): void {
    this.filterForm.patchValue(
      {
        searchTerm: map.get('searchTerm') ?? '',
      },
      { emitEvent: false },
    );
  }

  private writeStateToUrl(): void {
    const { searchTerm } = this.filterForm.getRawValue();
    updateQueryParams(this._router, this._route, {
      searchTerm: searchTerm || undefined,
    });
  }

  private applyFilter(): void {
    const searchTerm = this.filterForm.controls.searchTerm.value.toLowerCase();
    const allClaims = this.claims();

    if (!searchTerm) {
      this.filteredClaims.set(allClaims);
    } else {
      const filtered = allClaims.filter(
        (claim) =>
          claim.name.toLowerCase().includes(searchTerm) ||
          claim.claimType.toLowerCase().includes(searchTerm) ||
          claim.claimValue.toLowerCase().includes(searchTerm) ||
          claim.description?.toLowerCase().includes(searchTerm),
      );
      this.filteredClaims.set(filtered);
    }
  }

  loadClaims(): void {
    this.isLoading.set(true);
    this._claimService.getAllClaims().subscribe({
      next: (claims) => {
        this.claims.set(claims);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onAddClaim(): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          'claims.dialog.addTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          'claims.dialog.addDescription',
        ),
        zContent: AddClaimDialogComponent,
        zWidth: '550px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) {
          this.loadClaims();
        }
      });
  }

  onEditClaim(claim: IClaim): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          'claims.dialog.editTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          'claims.dialog.editDescription',
        ),
        zContent: EditClaimDialogComponent,
        zData: { claim },
        zWidth: '550px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) {
          this.loadClaims();
        }
      });
  }

  onDeleteClaim(claim: IClaim): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        'claims.dialog.deleteTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        'claims.dialog.deleteDescription',
        `Are you sure you want to delete the claim "${claim.name}"?`,
      ),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._claimService.deleteClaim(claim.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                'claims.success.deleted',
              ),
            );
            this.loadClaims();
          },
        });
      },
    });
  }

  onClearSearch(): void {
    this.filterForm.controls.searchTerm.setValue('');
  }
}
