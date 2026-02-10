import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ENVIRONMENT,
  AuthService,
  IdentityAdminService,
  IPaginatedResponse,
  IRole,
  IUser,
  IUserFilterRequest,
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
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardSelectComponent,
  ZardSelectItemComponent,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';

interface IUserFilterForm {
  searchTerm: FormControl<string>;
  roleName: FormControl<string>;
  status: FormControl<string>;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    ZardAvatarComponent,
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
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private readonly _adminService = inject(IdentityAdminService);
  private readonly _roleService = inject(RoleService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _translationService = inject(TranslationService);
  protected readonly _authService = inject(AuthService);
  protected readonly _env = inject(ENVIRONMENT);

  // Signals
  readonly users = signal<IUser[]>([]);
  readonly roles = signal<IRole[]>([]);
  readonly rolesLoaded = signal(false);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  // Filter Form
  readonly filterForm = new FormGroup<IUserFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    roleName: new FormControl<string>('__all__', { nonNullable: true }),
    status: new FormControl<string>('__all__', { nonNullable: true }),
  });

  constructor() {
    // Watch for page changes and reload users
    effect(() => {
      const page = this.currentPage();
      if (page > 1) {
        this.loadUsers();
      }
    });

    // Watch for filter changes (except searchTerm which uses manual search)
    this.filterForm
      .get('roleName')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadUsers();
      });

    this.filterForm
      .get('status')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadUsers();
      });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.rolesLoaded.set(false);
    this._roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles.filter((r) => r.status));
        this.rolesLoaded.set(true);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        toast.error(
          this._translationService.getCachedTranslation(
            'users.error.loadRolesFailed'
          )
        );
        this.rolesLoaded.set(true);
      },
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);

    const formValue = this.filterForm.getRawValue();

    const request: IUserFilterRequest = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      searchTerm: formValue.searchTerm || undefined,
      roleName:
        formValue.roleName === '__all__' ||
        formValue.roleName === null ||
        formValue.roleName === undefined
          ? undefined
          : formValue.roleName,
      status:
        formValue.status === null ||
        formValue.status === undefined ||
        formValue.status === '__all__'
          ? undefined
          : formValue.status === 'true'
          ? true
          : false,
    };

    this._adminService.getUsers(request).subscribe({
      next: (response: IPaginatedResponse<IUser>) => {
        this.users.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        toast.error(
          this._translationService.getCachedTranslation(
            'users.error.loadUsersFailed'
          )
        );
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      roleName: '__all__',
      status: '__all__',
    });
    this.currentPage.set(1);
    this.loadUsers();
  }

  onAddUser(): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'users.dialog.addTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        'users.dialog.addDescription'
      ),
      zContent: AddUserDialogComponent,
      zData: { roles: this.roles() },
      zWidth: '550px',
      zHideFooter: true,
      zClosable: false,
      zOnOk: (result: unknown) => {
        if (
          result &&
          typeof result === 'object' &&
          'success' in result &&
          result.success
        ) {
          this.loadUsers();
        }
      },
    });
  }

  onEditUser(user: IUser): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'users.dialog.editTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        'users.dialog.editDescription'
      ),
      zContent: EditUserDialogComponent,
      zData: { user, roles: this.roles() },
      zWidth: '550px',
      zHideFooter: true,
      zClosable: false,
      zOnOk: (result: unknown) => {
        if (
          result &&
          typeof result === 'object' &&
          'success' in result &&
          result.success
        ) {
          this.loadUsers();
        }
      },
    });
  }

  onToggleStatus(user: IUser): void {
    const action = user.status
      ? this._translationService.getCachedTranslation(
          'users.actions.deactivate'
        )
      : this._translationService.getCachedTranslation('users.actions.activate');

    const title = user.status
      ? this._translationService.getCachedTranslation(
          'users.dialog.deactivateTitle'
        )
      : this._translationService.getCachedTranslation(
          'users.dialog.activateTitle'
        );

    const description = user.status
      ? this._translationService.getCachedTranslation(
          'users.dialog.deactivateDescription'
        )
      : this._translationService.getCachedTranslation(
          'users.dialog.activateDescription'
        );

    this._alertDialogService.confirm({
      zTitle: title.replace('{name}', `${user.firstName} ${user.lastName}`),
      zDescription: description.replace(
        '{name}',
        `${user.firstName} ${user.lastName}`
      ),
      zOkText: action,
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: user.status,
      zOnOk: () => {
        this._adminService.toggleUserStatus(user.id).subscribe({
          next: () => {
            const successMsg = user.status
              ? this._translationService.getCachedTranslation(
                  'users.success.userDeactivated'
                )
              : this._translationService.getCachedTranslation(
                  'users.success.userActivated'
                );
            toast.success(successMsg);
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error toggling user status:', error);
            toast.error(
              this._translationService.getCachedTranslation(
                'users.error.toggleStatusFailed'
              )
            );
          },
        });
      },
    });
  }

  onDeleteUser(user: IUser): void {
    const title = this._translationService.getCachedTranslation(
      'users.dialog.deleteTitle'
    );
    const description = this._translationService.getCachedTranslation(
      'users.dialog.deleteDescription'
    );

    this._alertDialogService.confirm({
      zTitle: title,
      zDescription: description.replace(
        '{name}',
        `${user.firstName} ${user.lastName}`
      ),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._adminService.deleteUser(user.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                'users.success.userDeleted'
              )
            );
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            toast.error(
              this._translationService.getCachedTranslation(
                'users.error.deleteFailed'
              )
            );
          },
        });
      },
    });
  }

  getProfilePictureUrl(user: IUser): string | undefined {
    if (user.profilePicture?.path) {
      return `${this._env.apiUrls.fileManager}${user.profilePicture.path}`;
    }
    return undefined;
  }

  getUserInitials(user: IUser): string {
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  getRoleBadgeType(
    role: IRole
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    const roleName = role.name.toLowerCase();
    if (roleName.includes('superadmin')) return 'default';
    if (roleName.includes('admin')) return 'secondary';
    if (roleName.includes('service')) return 'outline';
    return 'secondary';
  }

  getStatusBadgeType(status: boolean): 'default' | 'destructive' {
    return status ? 'default' : 'destructive';
  }
}
