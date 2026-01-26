import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
  ZardSegmentedComponent,
  ZardSegmentedItemComponent,
} from '@ihsan/ui';
import { AuthService, ILoginRequest } from '@ihsan/core';
import {
  SKIP_ERROR_TOAST,
  extractErrorMessage,
} from '../../interceptors/error.interceptor';
import { toast } from 'ngx-sonner';

type LoginMode = 'email-password' | 'email-code' | 'phone-code';
type LoginStep = 'credentials' | 'verification-code';

interface ILoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
  phoneNumber: FormControl<string>;
  verificationCode: FormControl<string>;
}

@Component({
  selector: 'shared-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ZardButtonComponent,
    ZardCardComponent,
    ZardFormImports,
    ZardInputDirective,
    ZardIconComponent,
    ZardAlertComponent,
    ZardSegmentedComponent,
    ZardSegmentedItemComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  // Input signals for configuration
  readonly showForgotPassword = input<boolean>(true);
  readonly showCreateAccount = input<boolean>(true);
  readonly redirectAfterLogin = input<string>('/dashboard');
  readonly defaultLoginMode = input<LoginMode>('email-password');
  readonly showModes = input<boolean>(false);

  // Internal state signals
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly loginMode = signal<LoginMode>(this.defaultLoginMode());
  readonly currentStep = signal<LoginStep>('credentials');

  readonly loginForm = new FormGroup<ILoginForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    phoneNumber: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    verificationCode: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ],
    }),
  });

  onSubmit(): void {
    const mode = this.loginMode();
    const step = this.currentStep();

    if (step === 'credentials') {
      this.handleCredentialsStep();
    } else if (step === 'verification-code') {
      this.handleVerificationCodeStep();
    }
  }

  private handleCredentialsStep(): void {
    const mode = this.loginMode();

    if (mode === 'email-password') {
      this.handleEmailPasswordLogin();
    } else if (mode === 'email-code') {
      this.handleGetEmailVerificationCode();
    } else if (mode === 'phone-code') {
      this.handleGetPhoneVerificationCode();
    }
  }

  private handleEmailPasswordLogin(): void {
    if (this.emailControl?.invalid || this.passwordControl?.invalid) {
      this.emailControl?.markAsTouched();
      this.passwordControl?.markAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.loginForm.getRawValue();
    const request: ILoginRequest = {
      email: formValue.email,
      password: formValue.password,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.login(request, context).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._router.navigate([this.redirectAfterLogin()]);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  private handleGetEmailVerificationCode(): void {
    if (this.emailControl?.invalid) {
      this.emailControl?.markAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.loginForm.getRawValue();

    this._authService.getVerificationCodeByEmail(formValue.email).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.code) {
          toast.success('Verification Code (Development)', {
            description: `Your code is: ${response.code}`,
          });
        } else {
          toast.success('Code Sent', {
            description: 'Verification code has been sent to your email',
          });
        }
        this.currentStep.set('verification-code');
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  private handleGetPhoneVerificationCode(): void {
    if (this.phoneNumberControl?.invalid) {
      this.phoneNumberControl?.markAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.loginForm.getRawValue();

    this._authService
      .getVerificationCodeByPhone(formValue.phoneNumber)
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.code) {
            toast.success('Verification Code (Development)', {
              description: `Your code is: ${response.code}`,
            });
          } else {
            toast.success('Code Sent', {
              description: 'Verification code has been sent to your phone',
            });
          }
          this.currentStep.set('verification-code');
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  private handleVerificationCodeStep(): void {
    if (this.verificationCodeControl?.invalid) {
      this.verificationCodeControl?.markAsTouched();
      return;
    }

    const mode = this.loginMode();

    if (mode === 'email-code') {
      this.handleLoginWithEmailCode();
    } else if (mode === 'phone-code') {
      this.handleLoginWithPhoneCode();
    }
  }

  private handleLoginWithEmailCode(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.loginForm.getRawValue();

    this._authService
      .loginWithCodeByEmail(formValue.email, formValue.verificationCode)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this._router.navigate([this.redirectAfterLogin()]);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  private handleLoginWithPhoneCode(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.loginForm.getRawValue();

    this._authService
      .loginWithCodeByPhone(formValue.phoneNumber, formValue.verificationCode)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this._router.navigate([this.redirectAfterLogin()]);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  onLoginModeChange(mode: LoginMode): void {
    this.loginMode.set(mode);
    this.currentStep.set('credentials');
    this.errorMessage.set(null);
    this.loginForm.reset();
  }

  onBackToCredentials(): void {
    this.currentStep.set('credentials');
    this.errorMessage.set(null);
    this.verificationCodeControl?.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  get phoneNumberControl() {
    return this.loginForm.get('phoneNumber');
  }

  get verificationCodeControl() {
    return this.loginForm.get('verificationCode');
  }

  get submitButtonText(): string {
    const mode = this.loginMode();
    const step = this.currentStep();

    if (this.isLoading()) {
      if (step === 'credentials' && mode !== 'email-password') {
        return 'Sending code...';
      } else if (step === 'verification-code') {
        return 'Verifying...';
      }
      return 'Signing in...';
    }

    if (step === 'credentials') {
      if (mode === 'email-password') {
        return 'Sign In';
      }
      return 'Send Code';
    } else {
      return 'Verify & Sign In';
    }
  }
}
