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
  AuthService,
  FileGroup,
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
import { IFileManagerResponse, FileType } from '@ihsan/core';
import { FileSelectorComponent } from '@ihsan/shared';
import { toast } from 'ngx-sonner';

interface IEditUserForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phoneNumber: FormControl<string | null>;
  roleIds: FormControl<string[]>;
  emailConfirmed: FormControl<string>;
  status: FormControl<string>;
  profilePictureId: FormControl<number | null>;
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
    FileSelectorComponent,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss'],
})
export class EditUserDialogComponent {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _adminService = inject(IdentityAdminService);
  private readonly _translationService = inject(TranslationService);
  private readonly _authService = inject(AuthService);
  protected readonly data = inject<IEditUserData>(Z_MODAL_DATA);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);
  protected readonly FileType = FileType;
  protected readonly FileGroup = FileGroup;

  existingFiles: IFileManagerResponse[] = [];

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
    profilePictureId: new FormControl<number | null>(
      this.data.user.profilePictureId || null
    ),
  });

  constructor() {
    // Prevent user from changing their own roles or status
    if (this.data.user.id === this._authService.currentUser()?.id) {
      this.form.controls.roleIds.disable();
      this.form.controls.status.disable();
      this.form.controls.emailConfirmed.disable();
    }

    if (this.data.user.profilePicture) {
      this.existingFiles = [this.data.user.profilePicture];
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();
    console.log(formValue);

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
      profilePictureId: formValue.profilePictureId,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._adminService
      .updateUser(this.data.user.id, request, context)
      .subscribe({
        next: (user) => {
          this.isLoading.set(false);
          toast.success(
            this._translationService.getCachedTranslation(
              'users.success.userUpdated'
            )
          );
          this._dialogRef.close({ success: true, user });
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

  onFileSelected(files: IFileManagerResponse[]) {
    if (files.length > 0) {
      this.form.controls.profilePictureId.setValue(files[0].id);
    } else {
      this.form.controls.profilePictureId.setValue(null);
    }
  }
}
