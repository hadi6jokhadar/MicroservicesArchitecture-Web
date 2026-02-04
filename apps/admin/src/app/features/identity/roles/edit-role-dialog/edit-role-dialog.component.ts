import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpContext } from '@angular/common/http';
import { RoleService, TranslatePipe, TranslationService } from '@ihsan/core';
import { extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';
import {
  ZardDialogRef,
  ZardFormImports,
  ZardInputDirective,
  ZardAlertComponent,
  ZardButtonComponent,
  Z_MODAL_DATA,
} from '@ihsan/ui';
import { IRole, IUpdateRoleRequest } from '@ihsan/core';

interface IRoleDialogData {
  role: IRole;
}

interface IRoleForm {
  name: FormControl<string>;
  description: FormControl<string>;
}

@Component({
  selector: 'app-edit-role-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardButtonComponent,
  ],
  templateUrl: './edit-role-dialog.component.html',
  styleUrls: ['./edit-role-dialog.component.scss'],
})
export class EditRoleDialogComponent {
  private readonly _roleService = inject(RoleService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);
  protected readonly data = inject<IRoleDialogData>(Z_MODAL_DATA);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly roleForm = new FormGroup<IRoleForm>({
    name: new FormControl<string>(this.data.role.name, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    description: new FormControl<string>(this.data.role.description || '', {
      nonNullable: true,
    }),
  });

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.roleForm.getRawValue();
    const request: IUpdateRoleRequest = {
      name: formValue.name,
      description: formValue.description || undefined,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._roleService
      .updateRole(this.data.role.id, request, context)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(
            this._translationService.getCachedTranslation(
              'roles.success.updated'
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
