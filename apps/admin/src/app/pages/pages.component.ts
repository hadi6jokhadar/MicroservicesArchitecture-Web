import { Component, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
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
  private readonly DARK_MODE_KEY = 'theme-preference';

  isDarkMode = signal<boolean>(false);

  sidebarPages = signal<ISidebarPage[]>([
    new SidebarPageClass({
      label: 'Dashboard',
      icon: 'layout-dashboard',
      route: '/dashboard',
    }),
    new SidebarPageClass({
      label: 'Identity',
      icon: 'users',
      group: 'User Group',
      route: '/identity',
    }),
    new SidebarPageClass({
      label: 'Tenant',
      icon: 'house',
      group: 'System Group',
      route: '/tenant',
    }),
    new SidebarPageClass({
      label: 'FileManager',
      icon: 'folder',
      group: 'System Group',
      route: '/file-manager',
    }),
    new SidebarPageClass({
      label: 'Notification',
      icon: 'bell',
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
}
