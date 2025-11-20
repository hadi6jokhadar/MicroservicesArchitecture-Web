import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'blue' | 'green';
export type Direction = 'ltr' | 'rtl';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _currentTheme = signal<Theme>('light');
  private _direction = signal<Direction>('ltr');

  currentTheme = this._currentTheme.asReadonly();
  direction = this._direction.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  setDirection(dir: Direction): void {
    this._direction.set(dir);
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('direction', dir);
  }

  toggleTheme(): void {
    const newTheme = this._currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  toggleDirection(): void {
    const newDir = this._direction() === 'ltr' ? 'rtl' : 'ltr';
    this.setDirection(newDir);
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedDir = localStorage.getItem('direction') as Direction;

    if (savedTheme) {
      this.setTheme(savedTheme);
    }

    if (savedDir) {
      this.setDirection(savedDir);
    }
  }
}
