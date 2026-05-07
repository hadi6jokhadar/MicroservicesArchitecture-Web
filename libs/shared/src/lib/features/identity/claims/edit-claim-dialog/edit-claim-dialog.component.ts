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
  Z_MODAL_DATA,
} from '@ihsan/ui';
import { IClaim, IUpdateClaimRequest } from '@ihsan/core';
import { toast } from 'ngx-sonner';

interface IClaimDialogData {
  claim: IClaim;
}

interface IClaimForm {
  name: FormControl<string>;
  claimType: FormControl<string>;
  claimValue: FormControl<string>;
  description: FormControl<string>;
  isSuperAdminOnly: FormControl<boolean>;
}

@Component({
  selector: 'shared-edit-claim-dialog',
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
  templateUrl: './edit-claim-dialog.component.html',
  styleUrls: ['./edit-claim-dialog.component.scss'],
})
export class EditClaimDialogComponent {
  private readonly _claimService = inject(ClaimService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);
  protected readonly data = inject<IClaimDialogData>(Z_MODAL_DATA);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly claimForm = new FormGroup<IClaimForm>({
    name: new FormControl<string>(this.data.claim.name, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    claimType: new FormControl<string>(this.data.claim.claimType, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    claimValue: new FormControl<string>(this.data.claim.claimValue, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>(this.data.claim.description || '', {
      nonNullable: true,
    }),
    isSuperAdminOnly: new FormControl<boolean>(
      this.data.claim.isSuperAdminOnly,
      {
        nonNullable: true,
      },
    ),
  });

  onSubmit(): void {
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.claimForm.getRawValue();
    const request: IUpdateClaimRequest = {
      name: formValue.name,
      claimType: formValue.claimType,
      claimValue: formValue.claimValue,
      description: formValue.description || undefined,
      isSuperAdminOnly: formValue.isSuperAdminOnly,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._claimService
      .updateClaim(this.data.claim.id, request, context)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          toast.success(
            this._translationService.getCachedTranslation(
              'claims.success.updated',
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
