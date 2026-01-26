import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpContext } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
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
import { AuthService, IRegisterRequest } from '@ihsan/core';
import {
  SKIP_ERROR_TOAST,
  extractErrorMessage,
} from '../../interceptors/error.interceptor';
import { toast } from 'ngx-sonner';

type RegisterMode = 'email-password' | 'email-code' | 'phone-code';
type RegisterStep = 'registration' | 'verification-code';

interface IRegisterForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  verificationCode: FormControl<string>;
}

@Component({
  selector: 'shared-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  // Input signals for configuration
  readonly showLoginLink = input<boolean>(true);
  readonly redirectAfterRegister = input<string>('/dashboard');
  readonly defaultRegisterMode = input<RegisterMode>('email-password');
  readonly showModes = input<boolean>(false);

  // Internal state signals
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly registerMode = signal<RegisterMode>(this.defaultRegisterMode());
  readonly currentStep = signal<RegisterStep>('registration');

  readonly registerForm = new FormGroup<IRegisterForm>(
    {
      firstName: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      lastName: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phoneNumber: new FormControl<string>('', {
        nonNullable: true,
      }),
      password: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      confirmPassword: new FormControl<string>('', {
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
    },
    { validators: this.passwordMatchValidator }
  );

  onSubmit(): void {
    const step = this.currentStep();

    if (step === 'registration') {
      this.handleRegistrationStep();
    } else if (step === 'verification-code') {
      this.handleVerificationCodeStep();
    }
  }

  private handleRegistrationStep(): void {
    const mode = this.registerMode();

    if (mode === 'email-password') {
      this.handleEmailPasswordRegistration();
    } else if (mode === 'email-code') {
      this.handleRegisterWithEmailCode();
    } else if (mode === 'phone-code') {
      this.handleRegisterWithPhoneCode();
    }
  }

  private handleEmailPasswordRegistration(): void {
    // Validate all required fields for email-password mode
    const requiredControls = [
      this.firstNameControl,
      this.lastNameControl,
      this.emailControl,
      this.passwordControl,
      this.confirmPasswordControl,
    ];

    const hasErrors = requiredControls.some((control) => control?.invalid);
    if (hasErrors || this.registerForm.hasError('passwordMismatch')) {
      requiredControls.forEach((control) => control?.markAsTouched());
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.registerForm.getRawValue();
    const request: IRegisterRequest = {
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phoneNumber: formValue.phoneNumber || undefined,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.register(request, context).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(
          'Registration successful! Redirecting to your dashboard...'
        );
        setTimeout(() => {
          this._router.navigate([this.redirectAfterRegister()]);
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  private handleRegisterWithEmailCode(): void {
    // Validate required fields for email-code mode
    const requiredControls = [
      this.firstNameControl,
      this.lastNameControl,
      this.emailControl,
    ];

    const hasErrors = requiredControls.some((control) => control?.invalid);
    if (hasErrors) {
      requiredControls.forEach((control) => control?.markAsTouched());
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.registerForm.getRawValue();

    this._authService
      .registerWithCodeByEmail(
        formValue.email,
        formValue.firstName,
        formValue.lastName
      )
      .subscribe({
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

  private handleRegisterWithPhoneCode(): void {
    // Validate required fields for phone-code mode
    const requiredControls = [
      this.firstNameControl,
      this.lastNameControl,
      this.phoneNumberControl,
    ];

    const hasErrors = requiredControls.some((control) => control?.invalid);
    if (hasErrors) {
      requiredControls.forEach((control) => control?.markAsTouched());
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.registerForm.getRawValue();

    this._authService
      .registerWithCodeByPhone(
        formValue.phoneNumber,
        formValue.firstName,
        formValue.lastName
      )
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

    const mode = this.registerMode();

    if (mode === 'email-code') {
      this.handleLoginWithEmailCode();
    } else if (mode === 'phone-code') {
      this.handleLoginWithPhoneCode();
    }
  }

  private handleLoginWithEmailCode(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.registerForm.getRawValue();

    this._authService
      .loginWithCodeByEmail(formValue.email, formValue.verificationCode)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(
            'Registration successful! Redirecting to your dashboard...'
          );
          setTimeout(() => {
            this._router.navigate([this.redirectAfterRegister()]);
          }, 1500);
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

    const formValue = this.registerForm.getRawValue();

    this._authService
      .loginWithCodeByPhone(formValue.phoneNumber, formValue.verificationCode)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(
            'Registration successful! Redirecting to your dashboard...'
          );
          setTimeout(() => {
            this._router.navigate([this.redirectAfterRegister()]);
          }, 1500);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  onRegisterModeChange(mode: RegisterMode): void {
    this.registerMode.set(mode);
    this.currentStep.set('registration');
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.registerForm.reset();
  }

  onBackToRegistration(): void {
    this.currentStep.set('registration');
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.verificationCodeControl?.reset();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get firstNameControl() {
    return this.registerForm.get('firstName');
  }

  get lastNameControl() {
    return this.registerForm.get('lastName');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get phoneNumberControl() {
    return this.registerForm.get('phoneNumber');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword');
  }

  get hasPasswordMismatch() {
    return (
      this.registerForm.hasError('passwordMismatch') &&
      this.confirmPasswordControl?.touched
    );
  }

  get verificationCodeControl() {
    return this.registerForm.get('verificationCode');
  }

  get submitButtonText(): string {
    const mode = this.registerMode();
    const step = this.currentStep();

    if (this.isLoading()) {
      if (step === 'registration') {
        if (mode === 'email-password') {
          return 'Creating account...';
        }
        return 'Sending code...';
      } else {
        return 'Verifying...';
      }
    }

    if (step === 'registration') {
      if (mode === 'email-password') {
        return 'Create Account';
      }
      return 'Send Code';
    } else {
      return 'Verify & Complete';
    }
  }

  get showPasswordFields(): boolean {
    return (
      this.registerMode() === 'email-password' &&
      this.currentStep() === 'registration'
    );
  }

  get showPhoneField(): boolean {
    const mode = this.registerMode();
    return (
      (mode === 'phone-code' || mode === 'email-password') &&
      this.currentStep() === 'registration'
    );
  }

  get showEmailField(): boolean {
    const mode = this.registerMode();
    return (
      (mode === 'email-code' || mode === 'email-password') &&
      this.currentStep() === 'registration'
    );
  }
}
