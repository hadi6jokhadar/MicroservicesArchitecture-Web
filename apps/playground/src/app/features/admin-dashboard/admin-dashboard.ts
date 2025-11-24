import { Component, inject } from '@angular/core';
import { AdminToolbarComponent, AdminSidebarComponent } from '@ihsan/shared';
import { AdminContentComponent } from '../../admin-content/admin-content.component';
import { ThemeService } from '@ihsan/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    AdminToolbarComponent,
    AdminSidebarComponent,
    AdminContentComponent,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent {
  private _themeService = inject(ThemeService);

  constructor() {
    // Set Ihsan theme on component initialization
    this._themeService.setColorScheme('ihsan');
  }

  onMenuToggle(): void {
    console.log('Menu toggled');
  }
}
