import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';
import { toast } from 'ngx-sonner';
import {
  TranslatePipe,
  ClaimService,
  IRole,
  IClaim,
  RoleService,
  TranslationService,
} from '@ihsan/core';
import {
  ZardLoaderComponent,
  ZardEmptyComponent,
  ZardBadgeComponent,
  Z_MODAL_DATA,
  ZardDialogRef,
  ZardButtonComponent,
  ZardAlertComponent,
} from '@ihsan/ui';

interface IClaimsDialogData {
  role: IRole;
}

@Component({
  selector: 'app-manage-claims-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardAlertComponent,
  ],
  templateUrl: './manage-claims-dialog.component.html',
  styleUrls: ['./manage-claims-dialog.component.scss'],
})
export class ManageClaimsDialogComponent implements OnInit {
  protected readonly data = inject<IClaimsDialogData>(Z_MODAL_DATA);
  private readonly _claimService = inject(ClaimService);
  private readonly _roleService = inject(RoleService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly availableClaims = signal<IClaim[]>([]);
  readonly selectedClaimIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.isLoading.set(true);
    this._claimService.getAllClaims().subscribe({
      next: (claims) => {
        this.availableClaims.set(claims);

        // Pre-select claims that are already assigned to this role
        const currentClaimIds = new Set(
          this.data.role.claims?.map((c) => c.id) || []
        );
        this.selectedClaimIds.set(currentClaimIds);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleClaim(claimId: number): void {
    const selected = this.selectedClaimIds();
    if (selected.has(claimId)) {
      selected.delete(claimId);
    } else {
      selected.add(claimId);
    }
    // Create a new Set to trigger signal update
    this.selectedClaimIds.set(new Set(selected));
  }

  isClaimSelected(claimId: number): boolean {
    return this.selectedClaimIds().has(claimId);
  }

  getSelectedClaimIds(): number[] {
    return Array.from(this.selectedClaimIds());
  }

  onSave(): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    const claimIds = this.getSelectedClaimIds();

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._roleService
      .assignClaimsToRole(this.data.role.id, { claimIds }, context)
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          toast.success(
            this._translationService.getCachedTranslation(
              'roles.success.claimsUpdated'
            ) || 'Claims updated successfully'
          );
          this._dialogRef.close({ success: true });
        },
        error: (error) => {
          this.isSaving.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
