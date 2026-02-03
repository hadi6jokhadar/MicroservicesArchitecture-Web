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
      translationKey: 'sidebar.pages.dashboard',
      icon: 'layout-dashboard' as ZardIcon,
      route: '/dashboard',
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.testComponents',
      icon: 'lightbulb' as ZardIcon,
      route: '/test-components',
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.identity',
      icon: 'shield' as ZardIcon,
      group: 'sidebar.groups.user',
      children: [
        new SidebarPageClass({
          translationKey: 'sidebar.pages.users',
          icon: 'users' as ZardIcon,
          route: '/identity/users',
        }),
        new SidebarPageClass({
          translationKey: 'sidebar.pages.roles',
          icon: 'badge-check' as ZardIcon,
          route: '/identity/roles',
        }),
        new SidebarPageClass({
          translationKey: 'sidebar.pages.claims',
          icon: 'shield' as ZardIcon,
          route: '/identity/claims',
        }),
      ],
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.tenant',
      icon: 'house' as ZardIcon,
      group: 'sidebar.groups.system',
      route: '/tenant',
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.translation',
      icon: 'book-open-text' as ZardIcon,
      group: 'sidebar.groups.system',
      route: '/translation',
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.fileManager',
      icon: 'folder' as ZardIcon,
      group: 'sidebar.groups.system',
      route: '/file-manager',
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.notification',
      icon: 'bell' as ZardIcon,
      group: 'sidebar.groups.system',
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

  appTitleTranslationKey = signal<string>('app.title');

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
    // Page navigation handled by routerLink
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
