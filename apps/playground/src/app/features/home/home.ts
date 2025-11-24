import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from '@ihsan/shared/lib/components/error/error.component';
import { ErrorDialogData } from '@ihsan/shared/lib/components/error/error.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>rocket_launch</mat-icon>
            Welcome to Playground
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>
            This is your playground Angular app following the established design
            patterns.
          </p>
          <ul>
            <li>✅ Signal-based components</li>
            <li>✅ Standalone architecture</li>
            <li>✅ Angular Material UI</li>
            <li>✅ Reactive forms ready</li>
            <li>✅ Theme support (dark/light)</li>
            <li>✅ RTL/LTR support</li>
          </ul>
        </mat-card-content>
        <mat-card-actions class="actions-container">
          <button mat-raised-button color="primary">
            <mat-icon>build</mat-icon>
            Start Building
          </button>
          <button mat-raised-button color="accent" routerLink="/theme-tester">
            <mat-icon>palette</mat-icon>
            Theme Tester
          </button>
          <button mat-raised-button color="accent" routerLink="/admin">
            <mat-icon>dashboard</mat-icon>
            Admin Dashboard
          </button>
          <button mat-raised-button color="accent" routerLink="/login">
            <mat-icon>login</mat-icon>
            Admin Login
          </button>
        </mat-card-actions>
        <mat-card-actions class="actions-container">
          <button
            mat-stroked-button
            color="warn"
            (click)="openErrorDialog('simple')"
          >
            <mat-icon>error_outline</mat-icon>
            Test Simple Error
          </button>
          <button
            mat-stroked-button
            color="warn"
            (click)="openErrorDialog('validation')"
          >
            <mat-icon>gpp_bad</mat-icon>
            Test Validation Error
          </button>
          <button
            mat-stroked-button
            color="warn"
            (click)="openErrorDialog('trace')"
          >
            <mat-icon>bug_report</mat-icon>
            Test Trace Error
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrl: './home.scss',
})
export class HomeComponent {
  private _dialog = inject(MatDialog);

  openErrorDialog(type: 'simple' | 'validation' | 'trace'): void {
    let data: ErrorDialogData;

    switch (type) {
      case 'simple':
        data = {
          title: 'Operation Failed',
          message: 'Something went wrong while processing your request.',
          status: 500,
        };
        break;
      case 'validation':
        data = {
          title: 'Validation Error',
          message: 'Please correct the following errors:',
          status: 400,
          errors: {
            email: ['Invalid email format', 'Email is required'],
            password: ['Password must be at least 8 characters'],
          },
        };
        break;
      case 'trace':
        data = {
          title: 'System Error',
          message: 'A critical system error occurred.',
          status: 503,
          traceId: '00-1234567890abcdef-12345678-01',
        };
        break;
    }

    this._dialog.open(ErrorComponent, {
      data,
      width: '400px',
    });
  }
}
