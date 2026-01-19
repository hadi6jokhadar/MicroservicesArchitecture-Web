import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import {
  ZardTableComponent,
  ZardButtonComponent,
  ZardInputDirective,
  ZardBadgeComponent,
  ZardAvatarComponent,
  ZardIconComponent,
  ZardDialogService,
} from '@ihsan/ui';
import { IdentityAdminService, IUserFilterRequest, IUser } from '@ihsan/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';
import { DeleteUserDialogComponent } from './delete-user-dialog/delete-user-dialog.component';

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
    ZardTableComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardAvatarComponent,
    ZardIconComponent,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private _adminService = inject(IdentityAdminService);
  private _fb = inject(FormBuilder);
  private _dialogService = inject(ZardDialogService);

  // Make Math available in template
  Math = Math;

  users = signal<IUser[]>([]);
  loading = signal(false);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(10);
  totalPages = signal(0);

  filterForm = this._fb.group<IUserFilterForm>({
    searchTerm: this._fb.control('', { nonNullable: true }),
    roleName: this._fb.control('', { nonNullable: true }),
    status: this._fb.control('', { nonNullable: true }),
  });

  roleOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'All Roles' },
    { value: 'User', label: 'User' },
    { value: 'Admin', label: 'Admin' },
    { value: 'SuperAdmin', label: 'Super Admin' },
  ];

  statusOptions: Array<{ value: string; label: string }> = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilterListeners();
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageNumber.set(1);
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.loading.set(true);

    const request: IUserFilterRequest = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      searchTerm: this.filterForm.value.searchTerm || undefined,
      roleName: this.filterForm.value.roleName || undefined,
      status:
        this.filterForm.value.status === ''
          ? undefined
          : this.filterForm.value.status === 'true',
    };

    this._adminService.getUsers(request).subscribe({
      next: (response) => {
        this.users.set(response.items);
        this.totalCount.set(response.totalCount);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageNumber.set(1);
    this.loadUsers();
  }

  openAddUserDialog(): void {
    this._dialogService.create({
      zTitle: 'Add New User',
      zDescription: 'Create a new user account',
      zContent: AddUserDialogComponent,
      zData: {},
      zHideFooter: true,
      zWidth: '500px',
      zOnOk: () => {
        toast.success('User created successfully');
        this.loadUsers();
      },
    });
  }

  openEditUserDialog(user: IUser): void {
    this._dialogService.create({
      zTitle: 'Edit User',
      zDescription: 'Update user information',
      zContent: EditUserDialogComponent,
      zData: { user },
      zHideFooter: true,
      zWidth: '500px',
      zOnOk: () => {
        toast.success('User updated successfully');
        this.loadUsers();
      },
    });
  }

  openDeleteUserDialog(user: IUser): void {
    this._dialogService.create({
      zTitle: 'Delete User',
      zDescription: 'Are you sure you want to delete this user?',
      zContent: DeleteUserDialogComponent,
      zData: { user },
      zHideFooter: true,
      zWidth: '400px',
      zOnOk: () => {
        toast.success('User deleted successfully');
        this.loadUsers();
      },
    });
  }

  toggleUserStatus(user: IUser): void {
    this._adminService.toggleUserStatus(user.id).subscribe({
      next: () => {
        toast.success(
          `User ${user.status ? 'deactivated' : 'activated'} successfully`
        );
        this.loadUsers();
      },
      error: (error: unknown) => {
        console.error('Error toggling user status:', error);
        toast.error('Failed to toggle user status');
      },
    });
  }

  getRoleBadgeType(
    roleName: string
  ): 'default' | 'destructive' | 'outline' | 'secondary' {
    switch (roleName) {
      case 'SuperAdmin':
        return 'destructive';
      case 'Admin':
        return 'secondary';
      default:
        return 'default';
    }
  }

  getStatusBadgeType(status: boolean): 'default' | 'destructive' {
    return status ? 'default' : 'destructive';
  }

  getProfilePictureUrl(user: IUser): string {
    if (user.profilePicture?.url) {
      return user.profilePicture.url;
    }
    return `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;
  }
}
