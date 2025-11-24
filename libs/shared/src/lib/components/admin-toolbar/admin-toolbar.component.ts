import { Component, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ModeToggleComponent } from '../mode-toggle/mode-toggle.component';
import { PageTitleService } from '@ihsan/core';

@Component({
  selector: 'shared-admin-toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    ModeToggleComponent,
  ],
  templateUrl: './admin-toolbar.component.html',
  styleUrl: './admin-toolbar.component.scss',
})
export class AdminToolbarComponent {
  private _pageTitleService = inject(PageTitleService);
  title = this._pageTitleService.title;

  menuToggle = output<void>();

  onMenuToggle(): void {
    this.menuToggle.emit();
  }
}
