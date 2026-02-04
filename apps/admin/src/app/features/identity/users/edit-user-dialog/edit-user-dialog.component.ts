import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpContext } from '@angular/common/http';
import {
  IRole,
  IUser,
  IUpdateUserRequest,
  TranslatePipe,
  IdentityAdminService,
  TranslationService,
} from '@ihsan/core';
import { extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';
import {
  ZardDialogRef,
  Z_MODAL_DATA,
  ZardFormImports,
  ZardInputDirective,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardAlertComponent,
  ZardLoaderComponent,
  ZardIdDirective,
  ZardButtonComponent,
} from '@ihsan/ui';

interface IEditUserForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phoneNumber: FormControl<string | null>;
  roleIds: FormControl<string[]>;
  emailConfirmed: FormControl<string>;
  status: FormControl<string>;
}

interface IEditUserData {
  user: IUser;
  roles: IRole[];
}

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardAlertComponent,
    ZardLoaderComponent,
    ZardIdDirective,
    ZardButtonComponent,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss'],
})
export class EditUserDialogComponent {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _adminService = inject(IdentityAdminService);
  private readonly _translationService = inject(TranslationService);
  protected readonly data = inject<IEditUserData>(Z_MODAL_DATA);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly form = new FormGroup<IEditUserForm>({
    firstName: new FormControl<string>(this.data.user.firstName || '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s'-]+$/),
      ],
    }),
    lastName: new FormControl<string>(this.data.user.lastName || '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s'-]+$/),
      ],
    }),
    phoneNumber: new FormControl<string | null>(
      this.data.user.phoneNumber || null
    ),
    roleIds: new FormControl<string[]>(
      this.data.user.roles.map((r) => r.id.toString()),
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    emailConfirmed: new FormControl<string>(
      this.data.user.emailConfirmed ? 'true' : 'false',
      { nonNullable: true }
    ),
    status: new FormControl<string>(this.data.user.status ? 'true' : 'false', {
      nonNullable: true,
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.form.getRawValue();
    const request: IUpdateUserRequest = {
      id: this.data.user.id,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phoneNumber: formValue.phoneNumber,
      roleIds: Array.isArray(formValue.roleIds)
        ? formValue.roleIds.map((id) => parseInt(id, 10))
        : [],
      emailConfirmed: formValue.emailConfirmed === 'true',
      status: formValue.status === 'true',
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._adminService
      .updateUser(this.data.user.id, request, context)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(
            this._translationService.getCachedTranslation(
              'users.success.userUpdated'
            )
          );
          setTimeout(() => {
            this._dialogRef.close({ success: true });
          }, 1000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
