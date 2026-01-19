import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ZardDialogRef,
  Z_MODAL_DATA,
  ZardButtonComponent,
  ZardInputDirective,
  ZardSwitchComponent,
} from '@ihsan/ui';
import { IdentityAdminService, IUser, IUpdateUserRequest } from '@ihsan/core';
import { CommonModule } from '@angular/common';

interface IEditUserForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phoneNumber: FormControl<string>;
  role: FormControl<string>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardSwitchComponent,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss'],
})
export class EditUserDialogComponent implements OnInit {
  private _dialogRef = inject(ZardDialogRef);
  private _data = inject<{ user: IUser }>(Z_MODAL_DATA);
  private _fb = inject(FormBuilder);
  private _adminService = inject(IdentityAdminService);

  user = signal<IUser>(this._data.user);
  submitting = signal(false);
  errorMessage = signal('');

  editUserForm = this._fb.group<IEditUserForm>({
    firstName: this._fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    lastName: this._fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    phoneNumber: this._fb.control('', { nonNullable: true }),
    role: this._fb.control('User', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    isActive: this._fb.control(true, { nonNullable: true }),
  });

  roleOptions: Array<{ value: string; label: string }> = [
    { value: 'User', label: 'User' },
    { value: 'Admin', label: 'Admin' },
    { value: 'SuperAdmin', label: 'Super Admin' },
  ];

  ngOnInit(): void {
    const primaryRole = this.user().roles?.[0]?.name || 'User';
    this.editUserForm.patchValue({
      firstName: this.user().firstName,
      lastName: this.user().lastName,
      phoneNumber: this.user().phoneNumber || '',
      role: primaryRole,
      isActive: this.user().status,
    });
  }

  onSubmit(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const formValue = this.editUserForm.value;
    const request: IUpdateUserRequest = {
      id: this.user().id,
      firstName: formValue.firstName || '',
      lastName: formValue.lastName || '',
      phoneNumber: formValue.phoneNumber || null,
      roleIds: this.getRoleIdFromName(formValue.role || 'User'),
      profilePictureId: this.user().profilePictureId || null,
      emailConfirmed: this.user().emailConfirmed || null,
      status: formValue.isActive ?? true,
      data: this.user().data || null,
    };

    this._adminService.updateUser(this.user().id, request).subscribe({
      next: () => {
        this._dialogRef.close(true);
      },
      error: (error: unknown) => {
        console.error('Error updating user:', error);
        this.errorMessage.set('Failed to update user');
        this.submitting.set(false);
      },
    });
  }

  onCancel(): void {
    this._dialogRef.close(false);
  }

  private getRoleIdFromName(roleName: string): number[] {
    // Map role names to IDs (1=User, 2=Admin, 3=SuperAdmin)
    const roleMap: Record<string, number> = {
      User: 1,
      Admin: 2,
      SuperAdmin: 3,
    };
    return [roleMap[roleName] || 1];
  }
}
