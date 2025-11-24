import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, ILoginRequest } from '@ihsan/core';
import { Router } from '@angular/router';

interface ILoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'shared-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {
  private _fb = inject(FormBuilder);
  private _authService = inject(AuthService);
  private _snackBar = inject(MatSnackBar);
  private _router = inject(Router);

  isLoading = signal(false);
  hidePassword = signal(true);

  loginForm: FormGroup<ILoginForm> = this._fb.group({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  togglePasswordVisibility(event: Event) {
    event.preventDefault();
    this.hidePassword.update((value) => !value);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    const request: ILoginRequest = this.loginForm.getRawValue();

    this._authService.login(request).subscribe({
      next: () => {
        this._snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.isLoading.set(false);
        // Navigate to admin dashboard or home
        this._router.navigate(['/admin']);
      },
      error: (error: unknown) => {
        console.error('Login failed', error);
        this._snackBar.open(
          'Login failed. Please check your credentials.',
          'Close',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
        this.isLoading.set(false);
      },
    });
  }
}
