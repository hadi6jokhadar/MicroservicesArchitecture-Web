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
import { AuthService, BackgroundJobsService, FeatureFlagService, FeatureFlags } from '@ihsan/core';
import {
  ISidebarPage,
  ISidebarUser,
  SidebarComponent,
  SidebarPageClass,
  SidebarUserClass,
  FileManagerComponent,
  AiChatDialogComponent,
  AiEmbeddingDialogComponent,
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
  private _backgroundJobsService = inject(BackgroundJobsService);
  private _flagService = inject(FeatureFlagService);
  private readonly DARK_MODE_KEY = 'theme-preference';

  isDarkMode = signal<boolean>(false);

  private readonly _allPages: ISidebarPage[] = [
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
      translationKey: 'sidebar.pages.aiChat',
      icon: 'sparkles' as ZardIcon,
      group: 'sidebar.groups.ai',
      roles: ['Admin', 'SuperAdmin'],
      action: () => this.openAiChatDialog(),
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.aiEmbedding',
      icon: 'layers' as ZardIcon,
      group: 'sidebar.groups.ai',
      roles: ['Admin', 'SuperAdmin'],
      action: () => this.openAiEmbeddingDialog(),
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.aiSettings',
      icon: 'settings' as ZardIcon,
      group: 'sidebar.groups.ai',
      roles: ['Admin', 'SuperAdmin'],
      route: '/ai-settings',
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.aiSystemPrompts',
      icon: 'file-text' as ZardIcon,
      group: 'sidebar.groups.ai',
      roles: ['Admin', 'SuperAdmin'],
      route: '/ai-system-prompts',
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
    new SidebarPageClass({
      translationKey: 'sidebar.pages.chatSessions',
      icon: 'inbox' as ZardIcon,
      group: 'sidebar.groups.ai',
      roles: ['SuperAdmin'],
      route: '/ai-chat-sessions',
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.tokenUsageLogs',
      icon: 'activity' as ZardIcon,
      group: 'sidebar.groups.ai',
      roles: ['SuperAdmin'],
      route: '/ai-token-usage-logs',
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.categories',
      icon: 'folder-tree' as ZardIcon,
      group: 'sidebar.groups.system',
      roles: ['Admin', 'SuperAdmin'],
      route: '/categories',
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.auditLog',
      icon: 'clipboard' as ZardIcon,
      group: 'sidebar.groups.system',
      roles: ['SuperAdmin'],
      route: '/audit-log',
      type: SidebarPageType.Both,
      featureFlag: FeatureFlags.IsAuditLogPageEnabled,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.prometheus',
      icon: 'activity' as ZardIcon,
      group: 'sidebar.groups.observability',
      roles: ['SuperAdmin'],
      action: () => window.open('http://localhost:9090/', '_blank'),
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.grafana',
      icon: 'monitor' as ZardIcon,
      group: 'sidebar.groups.observability',
      roles: ['SuperAdmin'],
      action: () => window.open('http://localhost:3100/', '_blank'),
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.jaeger',
      icon: 'search' as ZardIcon,
      group: 'sidebar.groups.observability',
      roles: ['SuperAdmin'],
      action: () => window.open('http://localhost:16686/', '_blank'),
      type: SidebarPageType.Management,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.jobsCategory',
      icon: 'folder-tree' as ZardIcon,
      group: 'sidebar.groups.jobs',
      roles: ['SuperAdmin'],
      action: () => this._backgroundJobsService.openDashboard('category'),
      type: SidebarPageType.Both,
      featureFlag: FeatureFlags.IsBackgroundJobPageEnabled,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.jobsFileManager',
      icon: 'folder' as ZardIcon,
      group: 'sidebar.groups.jobs',
      roles: ['SuperAdmin'],
      action: () => this._backgroundJobsService.openDashboard('filemanager'),
      type: SidebarPageType.Both,
      featureFlag: FeatureFlags.IsBackgroundJobPageEnabled,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.jobsNotification',
      icon: 'bell' as ZardIcon,
      group: 'sidebar.groups.jobs',
      roles: ['SuperAdmin'],
      action: () => this._backgroundJobsService.openDashboard('notification'),
      type: SidebarPageType.Both,
      featureFlag: FeatureFlags.IsBackgroundJobPageEnabled,
    }),
    new SidebarPageClass({
      translationKey: 'sidebar.pages.jobsTenant',
      icon: 'house' as ZardIcon,
      group: 'sidebar.groups.jobs',
      roles: ['SuperAdmin'],
      action: () => this._backgroundJobsService.openDashboard('tenant'),
      type: SidebarPageType.Both,
      featureFlag: FeatureFlags.IsBackgroundJobPageEnabled,
    }),
  ];

  sidebarPages = computed<ISidebarPage[]>(() =>
    this._filterByFlags(this._allPages)
  );

  private _filterByFlags(pages: ISidebarPage[]): ISidebarPage[] {
    return pages
      .filter((p) => !p.featureFlag || this._flagService.isEnabled(p.featureFlag))
      .map((p) =>
        p.children
          ? { ...p, children: this._filterByFlags(p.children) }
          : p
      );
  }

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
        '(prefers-color-scheme: dark)',
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

  onPageClick(_event: ISidebarPage): void {}

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

  openAiChatDialog(): void {
    this._dialogService.create({
      zContent: AiChatDialogComponent as any,
      zWidth: '90vw',
      zCustomClasses: 'z-dialog-max-width-100',
      zHideFooter: true,
    });
  }

  openAiEmbeddingDialog(): void {
    this._dialogService.create({
      zContent: AiEmbeddingDialogComponent as any,
      zWidth: '560px',
      zHideFooter: true,
    });
  }
}
