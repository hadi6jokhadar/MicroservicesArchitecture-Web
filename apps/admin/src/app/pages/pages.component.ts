import { Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ZardIcon } from '@ihsan/ui/lib/zard/components/icon';
import { AuthService } from '@ihsan/core';
import {
  ISidebarPage,
  ISidebarUser,
  SidebarComponent,
  SidebarPageClass,
  SidebarUserClass,
} from '@ihsan/shared';

@Component({
  selector: 'app-pages',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
})
export class PagesComponent {
  private _platformId = inject(PLATFORM_ID);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private readonly DARK_MODE_KEY = 'theme-preference';

  isDarkMode = signal<boolean>(false);

  sidebarPages = signal<ISidebarPage[]>([
    new SidebarPageClass({
      label: 'Dashboard',
      icon: 'layout-dashboard' as ZardIcon,
      route: '/dashboard',
    }),
    new SidebarPageClass({
      label: 'Test Components',
      icon: 'lightbulb' as ZardIcon,
      route: '/test-components',
    }),
    new SidebarPageClass({
      label: 'Identity',
      icon: 'shield' as ZardIcon,
      group: 'User Group',
      children: [
        new SidebarPageClass({
          label: 'Users',
          icon: 'users' as ZardIcon,
          route: '/identity/users',
        }),
        new SidebarPageClass({
          label: 'Roles',
          icon: 'badge-check' as ZardIcon,
          route: '/identity/roles',
        }),
        new SidebarPageClass({
          label: 'Claims',
          icon: 'shield' as ZardIcon,
          route: '/identity/claims',
        }),
      ],
    }),
    new SidebarPageClass({
      label: 'Tenant',
      icon: 'house' as ZardIcon,
      group: 'System Group',
      route: '/tenant',
    }),
    new SidebarPageClass({
      label: 'FileManager',
      icon: 'folder' as ZardIcon,
      group: 'System Group',
      route: '/file-manager',
    }),
    new SidebarPageClass({
      label: 'Notification',
      icon: 'bell' as ZardIcon,
      group: 'System Group',
      route: '/notification',
    }),
  ]);

  currentUser = signal<ISidebarUser>(
    new SidebarUserClass({
      name: 'John Doe',
      username: 'johndoe',
      imageUrl: undefined,
    })
  );

  appTitle = signal<string>('Admin Panel');

  constructor() {
    // Load theme preference on init
    if (isPlatformBrowser(this._platformId)) {
      const savedTheme = localStorage.getItem(this.DARK_MODE_KEY);
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const shouldBeDark =
        savedTheme === 'dark' || (!savedTheme && prefersDark);

      this.isDarkMode.set(shouldBeDark);
      this.applyTheme(shouldBeDark);

      // Watch for theme changes
      effect(() => {
        const isDark = this.isDarkMode();
        this.applyTheme(isDark);
        localStorage.setItem(this.DARK_MODE_KEY, isDark ? 'dark' : 'light');
      });
    }
  }

  private applyTheme(isDark: boolean): void {
    if (isPlatformBrowser(this._platformId)) {
      const html = document.documentElement;
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }

  onPageClick(page: ISidebarPage): void {
    console.log('Page clicked:', page);
  }

  toggleDarkMode(): void {
    this.isDarkMode.update((current) => !current);
  }

  onLogout(): void {
    this._authService.logout().subscribe({
      next: () => {
        this._router.navigate(['/login']);
      },
      error: () => {
        // Even if API call fails, clear local auth and redirect
        this._router.navigate(['/login']);
      },
    });
  }
}
