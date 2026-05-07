import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ClaimService,
  IRole,
  RoleService,
  TranslatePipe,
  TranslationService,
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
import { AddRoleDialogComponent } from './add-role-dialog/add-role-dialog.component';
import { EditRoleDialogComponent } from './edit-role-dialog/edit-role-dialog.component';
import { ManageClaimsDialogComponent } from './manage-claims-dialog/manage-claims-dialog.component';

interface IRoleFilterForm {
  searchTerm: FormControl<string>;
}

@Component({
  selector: 'shared-roles',
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
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
    ZardEmptyComponent,
    ZardAvatarComponent,
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent {
  private readonly _roleService = inject(RoleService);
  private readonly _claimService = inject(ClaimService);
  private readonly _translationService = inject(TranslationService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);

  readonly isLoading = signal(false);
  readonly roles = signal<IRole[]>([]);
  readonly filteredRoles = signal<IRole[]>([]);

  readonly filterForm = new FormGroup<IRoleFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
  });

  constructor() {
    this.loadRoles();

    // Watch for search term changes using takeUntilDestroyed for proper cleanup
    this.filterForm.controls.searchTerm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.applyFilter();
      });
  }

  private applyFilter(): void {
    const searchTerm = this.filterForm.controls.searchTerm.value.toLowerCase();
    const allRoles = this.roles();

    if (!searchTerm) {
      this.filteredRoles.set(allRoles);
    } else {
      const filtered = allRoles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchTerm) ||
          role.description?.toLowerCase().includes(searchTerm),
      );
      this.filteredRoles.set(filtered);
    }
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this._roleService.getAllRoles(true).subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onAddRole(): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          'roles.dialog.addTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          'roles.dialog.addDescription',
        ),
        zContent: AddRoleDialogComponent,
        zWidth: '550px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) {
          this.loadRoles();
        }
      });
  }

  onEditRole(role: IRole): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          'roles.dialog.editTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          'roles.dialog.editDescription',
        ),
        zContent: EditRoleDialogComponent,
        zData: { role },
        zWidth: '550px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) {
          this.loadRoles();
        }
      });
  }

  onManageClaims(role: IRole): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          'roles.dialog.manageClaimsTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          'roles.dialog.manageClaimsDescription',
        ),
        zContent: ManageClaimsDialogComponent,
        zData: { role },
        zWidth: '600px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) {
          toast.success(
            this._translationService.getCachedTranslation(
              'roles.success.claimsUpdated',
            ),
          );
          this.loadRoles();
        }
      });
  }

  onDeleteRole(role: IRole): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        'roles.dialog.deleteTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        'roles.dialog.deleteDescription',
        `Are you sure you want to delete the role "${role.name}"?`,
      ),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._roleService.deleteRole(role.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                'roles.success.deleted',
              ),
            );
            this.loadRoles();
          },
        });
      },
    });
  }

  onClearSearch(): void {
    this.filterForm.controls.searchTerm.setValue('');
  }
}
