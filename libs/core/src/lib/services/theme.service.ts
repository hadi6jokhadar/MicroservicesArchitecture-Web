import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _colorScheme = signal<string>('default');
  private _mode = signal<ThemeMode>('light');
  private _direction = signal<Direction>('ltr');

  colorScheme = this._colorScheme.asReadonly();
  mode = this._mode.asReadonly();
  direction = this._direction.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  /**
   * Set the color scheme (e.g., 'default', 'blue', 'green', or any custom name)
   */
  setColorScheme(scheme: string): void {
    this._colorScheme.set(scheme);
    this.applyTheme();
    localStorage.setItem('colorScheme', scheme);
  }

  /**
   * Set the theme mode (light or dark)
   */
  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    this.applyTheme();
    localStorage.setItem('mode', mode);
  }

  /**
   * Toggle between light and dark mode
   */
  toggleMode(): void {
    const newMode = this._mode() === 'light' ? 'dark' : 'light';
    this.setMode(newMode);
  }

  /**
   * Set both color scheme and mode at once
   */
  setTheme(scheme: string, mode: ThemeMode): void {
    this._colorScheme.set(scheme);
    this._mode.set(mode);
    this.applyTheme();
    localStorage.setItem('colorScheme', scheme);
    localStorage.setItem('mode', mode);
  }

  /**
   * Get the current theme as a combined string (e.g., 'blue-dark', 'default-light')
   */
  getCurrentTheme(): string {
    const scheme = this._colorScheme();
    const mode = this._mode();
    return scheme === 'default' ? mode : `${scheme}-${mode}`;
  }

  setDirection(dir: Direction): void {
    this._direction.set(dir);
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('direction', dir);
  }

  toggleDirection(): void {
    const newDir = this._direction() === 'ltr' ? 'rtl' : 'ltr';
    this.setDirection(newDir);
  }

  private applyTheme(): void {
    const scheme = this._colorScheme();
    const mode = this._mode();

    // Build theme attribute value
    const themeValue = scheme === 'default' ? mode : `${scheme}-${mode}`;

    // Set data-theme attribute
    document.documentElement.setAttribute('data-theme', themeValue);

    // Also set data-color-scheme and data-mode for more flexible CSS targeting
    document.documentElement.setAttribute('data-color-scheme', scheme);
    document.documentElement.setAttribute('data-mode', mode);
  }

  private initializeTheme(): void {
    const savedScheme = localStorage.getItem('colorScheme') || 'default';
    const savedMode = (localStorage.getItem('mode') as ThemeMode) || 'light';
    const savedDir = localStorage.getItem('direction') as Direction;

    this._colorScheme.set(savedScheme);
    this._mode.set(savedMode);
    this.applyTheme();

    if (savedDir) {
      this.setDirection(savedDir);
    }
  }
}
