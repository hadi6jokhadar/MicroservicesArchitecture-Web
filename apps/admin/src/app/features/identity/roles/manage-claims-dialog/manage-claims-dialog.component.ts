import { Component, inject, signal, OnInit } from '@angular/core';
import {
  TranslatePipe,
  ClaimService,
  IRole,
  IClaim,
  RoleService,
} from '@ihsan/core';
import {
  ZardLoaderComponent,
  ZardEmptyComponent,
  ZardBadgeComponent,
  Z_MODAL_DATA,
  ZardDialogRef,
  ZardButtonComponent,
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
  ],
  templateUrl: './manage-claims-dialog.component.html',
  styleUrls: ['./manage-claims-dialog.component.scss'],
})
export class ManageClaimsDialogComponent implements OnInit {
  protected readonly data = inject<IClaimsDialogData>(Z_MODAL_DATA);
  private readonly _claimService = inject(ClaimService);
  private readonly _roleService = inject(RoleService);
  private readonly _dialogRef = inject(ZardDialogRef);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
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
    const claimIds = this.getSelectedClaimIds();

    this._roleService
      .assignClaimsToRole(this.data.role.id, { claimIds })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this._dialogRef.close({ success: true });
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
