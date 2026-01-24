import { Component, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
} from '@ihsan/ui';
import { AuthService, ILoginRequest } from '@ihsan/core';

interface ILoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'shared-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardFormImports,
    ZardInputDirective,
    ZardIconComponent,
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

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly loginForm = new FormGroup<ILoginForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request: ILoginRequest = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };

    this._authService.login(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._router.navigate([this.redirectAfterLogin()]);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'Login failed. Please try again.'
        );
      },
    });
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
}
