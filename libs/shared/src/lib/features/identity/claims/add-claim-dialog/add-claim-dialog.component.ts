import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpContext } from '@angular/common/http';
import { ClaimService, TranslatePipe, TranslationService } from '@ihsan/core';
import {
  extractErrorMessage,
  SKIP_ERROR_TOAST,
} from '../../../../../../interceptors/error.interceptor';
import {
  ZardDialogRef,
  ZardFormImports,
  ZardInputDirective,
  ZardAlertComponent,
  ZardCheckboxComponent,
  ZardButtonComponent,
} from '@ihsan/ui';
import { ICreateClaimRequest } from '@ihsan/core';
import { toast } from 'ngx-sonner';

interface IClaimForm {
  name: FormControl<string>;
  claimType: FormControl<string>;
  claimValue: FormControl<string>;
  description: FormControl<string>;
  isSuperAdminOnly: FormControl<boolean>;
}

@Component({
  selector: 'shared-add-claim-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardCheckboxComponent,
    ZardButtonComponent,
  ],
  templateUrl: './add-claim-dialog.component.html',
  styleUrls: ['./add-claim-dialog.component.scss'],
})
export class AddClaimDialogComponent {
  private readonly _claimService = inject(ClaimService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly claimForm = new FormGroup<IClaimForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    claimType: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    claimValue: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
    }),
    isSuperAdminOnly: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
  });

  onSubmit(): void {
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.claimForm.getRawValue();
    const request: ICreateClaimRequest = {
      name: formValue.name,
      claimType: formValue.claimType,
      claimValue: formValue.claimValue,
      description: formValue.description || undefined,
      isSuperAdminOnly: formValue.isSuperAdminOnly,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._claimService.createClaim(request, context).subscribe({
      next: () => {
        this.isLoading.set(false);
        toast.success(
          this._translationService.getCachedTranslation(
            'claims.success.created',
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
