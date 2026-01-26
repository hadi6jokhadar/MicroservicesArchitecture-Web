import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpContext } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ZardButtonComponent,
  ZardCardComponent,
  ZardFormImports,
  ZardInputDirective,
  ZardIconComponent,
  ZardAlertComponent,
} from '@ihsan/ui';
import { AuthService, IForgotPasswordRequest } from '@ihsan/core';
import {
  SKIP_ERROR_TOAST,
  extractErrorMessage,
} from '../../interceptors/error.interceptor';

interface IForgotPasswordForm {
  email: FormControl<string>;
}

@Component({
  selector: 'shared-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardFormImports,
    ZardInputDirective,
    ZardIconComponent,
    ZardAlertComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  // Input signals for configuration
  readonly showBackToLogin = input<boolean>(true);
  readonly redirectAfterSuccess = input<string>('/login');

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly emailSent = signal(false);

  readonly forgotPasswordForm = new FormGroup<IForgotPasswordForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.forgotPasswordForm.getRawValue();
    const request: IForgotPasswordRequest = {
      email: formValue.email,
    };

    // Use SKIP_ERROR_TOAST context to handle errors manually
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.forgotPassword(request, context).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.emailSent.set(true);
        this.successMessage.set(
          'Password reset instructions have been sent to your email address.'
        );
      },
      error: (error) => {
        this.isLoading.set(false);
        // Extract error message from backend response
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  backToLogin(): void {
    this._router.navigate([this.redirectAfterSuccess()]);
  }

  get emailControl() {
    return this.forgotPasswordForm.get('email');
  }
}
