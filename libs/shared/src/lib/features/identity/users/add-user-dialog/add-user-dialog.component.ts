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
  ICreateUserRequest,
  TranslatePipe,
  IdentityAdminService,
  TranslationService,
  FileGroup,
} from '@ihsan/core';
import {
  extractErrorMessage,
  SKIP_ERROR_TOAST,
} from '../../../../../../interceptors/error.interceptor';
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
import { FileSelectorComponent } from '../../../file-manager/file-selector/file-selector.component';
import { IFileManagerResponse, FileType } from '@ihsan/core';
import { toast } from 'ngx-sonner';

interface IAddUserDialogData {
  roles: IRole[];
}

interface IAddUserForm {
  email: FormControl<string>;
  password: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  phoneNumber: FormControl<string | null>;
  profilePictureId: FormControl<number | null>;
  roleIds: FormControl<string[]>;
}

@Component({
  selector: 'shared-add-user-dialog',
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
  templateUrl: './add-user-dialog.component.html',
  styleUrl: './add-user-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserDialogComponent {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _adminService = inject(IdentityAdminService);
  private readonly _translationService = inject(TranslationService);
  protected readonly data = inject<IAddUserDialogData>(Z_MODAL_DATA);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);
  protected readonly FileType = FileType;
  protected readonly FileGroup = FileGroup;

  readonly form = new FormGroup<IAddUserForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    firstName: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s'-]+$/),
      ],
    }),
    lastName: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s'-]+$/),
      ],
    }),
    phoneNumber: new FormControl<string | null>(null),
    profilePictureId: new FormControl<number | null>(null),
    roleIds: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();
    console.log(formValue);

    const request: ICreateUserRequest = {
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phoneNumber: formValue.phoneNumber,
      profilePictureId: formValue.profilePictureId,
      roleIds: Array.isArray(formValue.roleIds)
        ? formValue.roleIds.map((id) => parseInt(id, 10))
        : [],
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._adminService.createUser(request, context).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        toast.success(
          this._translationService.getCachedTranslation(
            'users.success.userCreated',
          ),
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
