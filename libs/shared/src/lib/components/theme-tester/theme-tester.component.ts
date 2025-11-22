import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService, ThemeMode } from '@ihsan/core';

@Component({
  selector: 'lib-theme-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-tester.component.html',
  styleUrls: ['./theme-tester.component.scss'],
})
export class ThemeTesterComponent {
  private themeService = inject(ThemeService);
  private router = inject(Router);

  colorScheme = this.themeService.colorScheme;
  mode = this.themeService.mode;
  currentDirection = this.themeService.direction;

  // Color customization
  primaryColor = '#3f51b5';
  accentColor = '#ff4081';

  colorSchemes = [
    { value: 'default', label: 'Default', color: '#3f51b5' },
    { value: 'blue', label: 'Blue', color: '#2196f3' },
    { value: 'green', label: 'Green', color: '#4caf50' },
  ];

  setColorScheme(scheme: string): void {
    this.themeService.setColorScheme(scheme);
  }

  setMode(mode: ThemeMode): void {
    this.themeService.setMode(mode);
  }

  toggleMode(): void {
    this.themeService.toggleMode();
  }

  toggleDirection(): void {
    this.themeService.toggleDirection();
  }

  applyCustomColors(): void {
    document.documentElement.style.setProperty(
      '--primary-color',
      this.primaryColor
    );
    document.documentElement.style.setProperty(
      '--accent-color',
      this.accentColor
    );
  }

  resetColors(): void {
    this.primaryColor = '#3f51b5';
    this.accentColor = '#ff4081';
    document.documentElement.style.removeProperty('--primary-color');
    document.documentElement.style.removeProperty('--accent-color');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
