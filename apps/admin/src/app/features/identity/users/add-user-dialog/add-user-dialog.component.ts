import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ZardDialogRef,
  ZardButtonComponent,
  ZardInputDirective,
  ZardSwitchComponent,
} from '@ihsan/ui';
import { IdentityAdminService, ICreateUserRequest } from '@ihsan/core';
import { CommonModule } from '@angular/common';

interface IAddUserForm {
  email: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phoneNumber: FormControl<string>;
  password: FormControl<string>;
  role: FormControl<string>;
  isActive: FormControl<boolean>;
}

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardSwitchComponent,
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss'],
})
export class AddUserDialogComponent {
  private _dialogRef = inject(ZardDialogRef);
  private _fb = inject(FormBuilder);
  private _adminService = inject(IdentityAdminService);

  addUserForm = this._fb.group<IAddUserForm>({
    email: this._fb.control('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    firstName: this._fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    lastName: this._fb.control('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    phoneNumber: this._fb.control('', { nonNullable: true }),
    password: this._fb.control('', {
      validators: [Validators.required, Validators.minLength(6)],
      nonNullable: true,
    }),
    role: this._fb.control('User', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    isActive: this._fb.control(true, { nonNullable: true }),
  });

  submitting = false;
  errorMessage = '';

  roleOptions: Array<{ value: string; label: string }> = [
    { value: 'User', label: 'User' },
    { value: 'Admin', label: 'Admin' },
    { value: 'SuperAdmin', label: 'Super Admin' },
  ];

  onSubmit(): void {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const formValue = this.addUserForm.value;
    const request: ICreateUserRequest = {
      email: formValue.email || '',
      firstName: formValue.firstName || '',
      lastName: formValue.lastName || '',
      phoneNumber: formValue.phoneNumber || null,
      password: formValue.password || '',
      roleIds: this.getRoleIdFromName(formValue.role || 'User'),
      profilePictureId: null,
      data: null,
    };

    this._adminService.createUser(request).subscribe({
      next: () => {
        this._dialogRef.close(true);
        // Dialog will handle success notification
      },
      error: (error: unknown) => {
        console.error('Error creating user:', error);
        this.errorMessage = 'Failed to create user';
        this.submitting = false;
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
