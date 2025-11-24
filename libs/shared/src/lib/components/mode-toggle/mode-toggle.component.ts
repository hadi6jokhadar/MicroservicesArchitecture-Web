import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '@ihsan/core';

@Component({
  selector: 'shared-mode-toggle',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './mode-toggle.component.html',
  styleUrl: './mode-toggle.component.scss',
})
export class ModeToggleComponent {
  private _themeService = inject(ThemeService);
  isDarkMode = this._themeService.mode;

  toggleTheme(): void {
    this._themeService.toggleMode();
  }
}
