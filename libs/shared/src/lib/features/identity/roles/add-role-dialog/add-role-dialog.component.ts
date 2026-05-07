import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpContext } from '@angular/common/http';
import { RoleService, TranslatePipe, TranslationService } from '@ihsan/core';
import {
  extractErrorMessage,
  SKIP_ERROR_TOAST,
} from '../../../../../../interceptors/error.interceptor';
import {
  ZardDialogRef,
  ZardFormImports,
  ZardInputDirective,
  ZardAlertComponent,
  ZardButtonComponent,
} from '@ihsan/ui';
import { ICreateRoleRequest } from '@ihsan/core';
import { toast } from 'ngx-sonner';

interface IRoleForm {
  name: FormControl<string>;
  description: FormControl<string>;
}

@Component({
  selector: 'shared-add-role-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardButtonComponent,
  ],
  templateUrl: './add-role-dialog.component.html',
  styleUrls: ['./add-role-dialog.component.scss'],
})
export class AddRoleDialogComponent {
  private readonly _roleService = inject(RoleService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly roleForm = new FormGroup<IRoleForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    description: new FormControl<string>('', {
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

    const formValue = this.roleForm.getRawValue();
    const request: ICreateRoleRequest = {
      name: formValue.name,
      description: formValue.description || undefined,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._roleService.createRole(request, context).subscribe({
      next: () => {
        this.isLoading.set(false);
        toast.success(
          this._translationService.getCachedTranslation(
            'roles.success.created',
          ),
        );
        this._dialogRef.close({ success: true });
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
