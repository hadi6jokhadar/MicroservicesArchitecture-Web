import {
  Component,
  signal,
  computed,
  effect,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ZardIcon } from '@ihsan/ui/lib/zard/components/icon';
import { ZardDialogService } from '@ihsan/ui';
import { AuthService } from '@ihsan/core';
import {
  ISidebarPage,
  ISidebarUser,
  SidebarComponent,
  SidebarPageClass,
  SidebarUserClass,
  FileManagerComponent,
  SidebarPageType,
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
  private _dialogService = inject(ZardDialogService);
  private readonly DARK_MODE_KEY = 'theme-preference';

  isDarkMode = signal<boolean>(false);

  sidebarPages = signal<ISidebarPage[]>([
    new SidebarPageClass({
      translationKey: 'sidebar.pages.dashboard',
      icon: 'layout-dashboard' as ZardIcon,
      route: '/dashboard',
      type: SidebarPageType.Both,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.testComponents',
      icon: 'lightbulb' as ZardIcon,
      route: '/test-components',
      type: SidebarPageType.Both,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.identity',
      icon: 'shield' as ZardIcon,
      group: 'sidebar.groups.user',
      roles: ['Admin', 'SuperAdmin'],
      type: SidebarPageType.Both,
      children: [
        new SidebarPageClass({
          translationKey: 'sidebar.pages.users',
          icon: 'users' as ZardIcon,
          route: '/identity/users',
          roles: ['Admin', 'SuperAdmin'],
          type: SidebarPageType.Both,
        }),
        new SidebarPageClass({
          translationKey: 'sidebar.pages.roles',
          icon: 'badge-check' as ZardIcon,
          route: '/identity/roles',
          roles: ['Admin', 'SuperAdmin'],
          type: SidebarPageType.Both,
        }),
        new SidebarPageClass({
          translationKey: 'sidebar.pages.claims',
          icon: 'shield' as ZardIcon,
          route: '/identity/claims',
          roles: ['Admin', 'SuperAdmin'],
          type: SidebarPageType.Both,
        }),
      ],
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.tenant',
      icon: 'house' as ZardIcon,
      group: 'sidebar.groups.system',
      roles: ['SuperAdmin'],
      route: '/tenant',
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.translation',
      icon: 'book-open-text' as ZardIcon,
      group: 'sidebar.groups.system',
      roles: ['Admin', 'SuperAdmin'],
      route: '/translation',
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.aiSettings',
      icon: 'settings' as ZardIcon,
      group: 'sidebar.groups.system',
      roles: ['Admin', 'SuperAdmin'],
      route: '/ai-settings',
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.fileManager',
      icon: 'folder' as ZardIcon,
      group: 'sidebar.groups.system',
      action: () => this.openFileManagerDialog(),
      roles: ['Admin', 'SuperAdmin'],
      type: SidebarPageType.Both,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.notification',
      icon: 'bell' as ZardIcon,
      group: 'sidebar.groups.system',
      roles: ['SuperAdmin'],
      route: '/notification',
      type: SidebarPageType.Both,
    }),
  ]);

  currentUser = computed<ISidebarUser>(() => {
    const user = this._authService.currentUser() as
      | {
          firstName?: string;
          lastName?: string;
          email?: string;
          roles?: { name: string }[];
        }
      | null
      | undefined;

    const name = user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user?.email || 'User';

    return new SidebarUserClass({
      name: name,
      username: user?.email || '',
      imageUrl: undefined,
      roles: user?.roles?.map((r) => r.name) || [],
    });
  });

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

  openFileManagerDialog(): void {
    this._dialogService.create({
      zContent: FileManagerComponent,
      zData: {
        allowedTypes: ['image/*', 'video/*'], // Example settings
        maxFiles: 5,
        selectionMode: 'multiple',
        viewMode: 'grid',
      },
      zWidth: '80vw', // Detailed view needs width.
      zCustomClasses: 'z-dialog-max-width-100',
      zHideFooter: true,
      zOnOk: (files) => {
        console.log('Selected files:', files);
      },
    });
  }
}
