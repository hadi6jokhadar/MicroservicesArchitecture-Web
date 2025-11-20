import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
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
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>build</mat-icon>
            Start Building
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrl: './home.scss',
})
export class HomeComponent {}
