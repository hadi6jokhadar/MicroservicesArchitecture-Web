import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import {
  ZardButtonComponent,
  ZardInputDirective,
  ZardCardComponent,
  ZardBadgeComponent,
  ZardAvatarComponent,
  ZardDropdownImports,
  ZardDropdownMenuComponent,
  ZardFormImports,
  ZardPaginationImports,
  ZardIconComponent,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardLoaderComponent,
  ZardEmptyComponent,
  ZardAlertDialogService,
  ZardIdDirective,
} from '@ihsan/ui';
import { IdentityAdminService, IUserFilterRequest } from '@ihsan/core';
import { IUser, IPaginatedResponse, IRole } from '@ihsan/core';
import { RoleService } from '@ihsan/core';
import { ENVIRONMENT } from '@ihsan/core';

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
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    ZardAvatarComponent,
    ...ZardDropdownImports,
    ZardDropdownMenuComponent,
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
        toast.error('Failed to load roles');
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
        toast.error('Failed to load users');
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
    // TODO: Open add user dialog
    toast.info('Add User dialog will be implemented');
  }

  onEditUser(user: IUser): void {
    // TODO: Open edit user dialog
    toast.info(`Edit user: ${user.firstName} ${user.lastName}`);
  }

  onToggleStatus(user: IUser): void {
    this._alertDialogService.confirm({
      zTitle: `${user.status ? 'Deactivate' : 'Activate'} User`,
      zDescription: `Are you sure you want to ${
        user.status ? 'deactivate' : 'activate'
      } ${user.firstName} ${user.lastName}?`,
      zOkText: user.status ? 'Deactivate' : 'Activate',
      zCancelText: 'Cancel',
      zOkDestructive: user.status,
    });

    // TODO: Implement actual status toggle after confirmation
    // this._adminService.toggleUserStatus(user.id).subscribe({
    //   next: () => {
    //     toast.success('User status updated successfully');
    //     this.loadUsers();
    //   },
    //   error: (error) => {
    //     console.error('Error toggling user status:', error);
    //     toast.error('Failed to update user status');
    //   },
    // });
  }

  onDeleteUser(user: IUser): void {
    this._alertDialogService.confirm({
      zTitle: 'Delete User',
      zDescription: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
    });

    // TODO: Implement actual delete after confirmation
    // this._adminService.deleteUser(user.id).subscribe({
    //   next: () => {
    //     toast.success('User deleted successfully');
    //     this.loadUsers();
    //   },
    //   error: (error) => {
    //     console.error('Error deleting user:', error);
    //     toast.error('Failed to delete user');
    //   },
    // });
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
