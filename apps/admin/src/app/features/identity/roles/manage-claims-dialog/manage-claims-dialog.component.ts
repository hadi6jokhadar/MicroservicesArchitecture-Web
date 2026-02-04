import { Component, inject, signal, OnInit } from '@angular/core';
import { TranslatePipe, ClaimService } from '@ihsan/core';
import {
  ZardLoaderComponent,
  ZardEmptyComponent,
  ZardBadgeComponent,
  Z_MODAL_DATA,
} from '@ihsan/ui';
import { IRole, IClaim } from '@ihsan/core';

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
  ],
  templateUrl: './manage-claims-dialog.component.html',
  styleUrls: ['./manage-claims-dialog.component.scss'],
})
export class ManageClaimsDialogComponent implements OnInit {
  protected readonly data = inject<IClaimsDialogData>(Z_MODAL_DATA);
  private readonly _claimService = inject(ClaimService);

  readonly isLoading = signal(false);
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
}
