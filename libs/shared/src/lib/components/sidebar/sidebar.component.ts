import { KeyValuePipe } from '@angular/common';
import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  ZardButtonComponent,
  ZardDividerComponent,
  ZardIconComponent,
  ZardDropdownImports,
} from '@ihsan/ui';
import { ISidebarPage, ISidebarUser, SidebarPageType } from './sidebar.model';
import { TranslatePipe, TranslationService } from '@ihsan/core';

@Component({
  selector: 'shared-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    KeyValuePipe,
    ZardButtonComponent,
    ZardDividerComponent,
    ZardIconComponent,
    TranslatePipe,
    ...ZardDropdownImports,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  host: {
    '[class.mobile-open]': 'isMobileOpen()',
  },
})
export class SidebarComponent {
  pages = input.required<ISidebarPage[]>();
  currentUser = input.required<ISidebarUser>();
  appTitleTranslationKey = input<string>('Application');

  pageClicked = output<ISidebarPage>();
  darkModeToggled = output<void>();
  logoutClicked = output<void>();

  expandedPages = signal<Set<string>>(new Set());
  currentLanguage = signal<string>('en');
  isMobileOpen = signal<boolean>(false);

  private _platformId = inject(PLATFORM_ID);
  private _router = inject(Router);
  private _translationService = inject(TranslationService);

  availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  constructor() {
    // Load saved language from localStorage
    if (isPlatformBrowser(this._platformId)) {
      const savedLanguage = localStorage.getItem('app-language');
      if (savedLanguage) {
        this.currentLanguage.set(savedLanguage);
      }
    }

    // Auto-expand parent pages when navigating to a child route
    effect(() => {
      // Reading pages() triggers the effect when the input changes
      // We need to be defensive here since the input might not be set yet
      try {
        const currentPages = this.pages();
        if (currentPages && currentPages.length > 0) {
          this._autoExpandParentPages();
        }
      } catch {
        // Ignore errors when pages input is not yet available
      }
    });

    // Also listen to route changes
    this._router.events.subscribe(() => {
      try {
        const currentPages = this.pages();
        if (currentPages && currentPages.length > 0) {
          this._autoExpandParentPages();
        }
      } catch {
        // Ignore errors when pages input is not yet available
      }
    });

    // Re-check visibility when localStorage changes (for tenantId) or user/pages input changes
    effect(() => {
      // this will just trigger re-evaluation of computed properties or effects dependent on signals
      // Since getGroupedPages is called from template (or should be a computed), it will update if signals update.
      // However, localStorage is not reactive.
      // We might need a signal for tenantId if we want it to be reactive.
      // For now, let's assume the parent component might handle reactivity or page reload is expected.
    });
  }

  private _canShowPage(page: ISidebarPage): boolean {
    // Check Tenant Scope
    const pageType = page.type || SidebarPageType.Both;
    if (pageType !== SidebarPageType.Both) {
      if (isPlatformBrowser(this._platformId)) {
        const tenantId = localStorage.getItem('tenantId');
        if (pageType === SidebarPageType.Management && tenantId) {
          return false;
        }
        if (pageType === SidebarPageType.Tenant && !tenantId) {
          return false;
        }
      }
    }

    // Check Roles
    if (page.roles && page.roles.length > 0) {
      const userRoles = this.currentUser().roles || [];
      const hasRole = page.roles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        return false;
      }
    }

    return true;
  }

  private _autoExpandParentPages(): void {
    const currentUrl = this._router.url;
    const expandedSet = new Set<string>();
    const currentPages = this.pages();

    if (!currentPages || currentPages.length === 0) {
      return;
    }

    // Find all parent pages that have children matching the current route
    const findParentsForRoute = (pages: ISidebarPage[]): void => {
      pages.forEach((page) => {
        if (!this._canShowPage(page)) return;

        if (page.children && page.children.length > 0) {
          // Check if any child matches the current route
          const hasMatchingChild = page.children.some(
            (child) =>
              child.route &&
              currentUrl.startsWith(child.route) &&
              this._canShowPage(child)
          );

          if (hasMatchingChild) {
            expandedSet.add(page.translationKey);
          }
          // Recursively check children
          findParentsForRoute(page.children);
        }
      });
    };

    findParentsForRoute(currentPages);
    this.expandedPages.set(expandedSet);
  }

  toggleMobileMenu(): void {
    this.isMobileOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.isMobileOpen.set(false);
  }

  onPageClick(page: ISidebarPage): void {
    if (page.children && page.children.length > 0) {
      this.toggleExpand(page.translationKey);
      this.isMobileOpen.set(true);
    } else {
      this.closeMobileMenu();
      this.pageClicked.emit(page);
      if (page.action) {
        page.action();
      }
    }
  }

  toggleExpand(pageTranslationKey: string): void {
    const expanded = this.expandedPages();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(pageTranslationKey)) {
      newExpanded.delete(pageTranslationKey);
    } else {
      newExpanded.add(pageTranslationKey);
    }

    this.expandedPages.set(newExpanded);
  }

  isExpanded(pageTranslationKey: string): boolean {
    return this.expandedPages().has(pageTranslationKey);
  }

  onToggleDarkMode(): void {
    this.darkModeToggled.emit();
  }

  onLogout(): void {
    this.logoutClicked.emit();
  }

  onLanguageChange(languageCode: string): void {
    // Save language to localStorage
    if (isPlatformBrowser(this._platformId)) {
      localStorage.setItem('app-language', languageCode);
    }
    this.currentLanguage.set(languageCode);

    this._translationService.getTranslations(languageCode).subscribe({
      next: (data) => {
        this._translationService.setTranslations(
          data.translations,
          data.language
        );
        // Reload the current page to apply translations
        if (isPlatformBrowser(this._platformId)) {
          window.location.reload();
        }
      },
      error: (error) => {
        console.error('Failed to change language:', error);
      },
    });
  }

  getCurrentLanguageName(): string {
    const currentLang = this.currentLanguage();
    return (
      this.availableLanguages.find((lang) => lang.code === currentLang)?.name ||
      'English'
    );
  }

  groupedPages = computed(() => {
    const grouped = new Map<string, ISidebarPage[]>();

    try {
      const pages = this.pages();

      if (!pages || pages.length === 0) {
        return grouped;
      }

      pages.forEach((page) => {
        if (!this._canShowPage(page)) return;

        // Create a shallow copy to modify children without affecting the original
        const pageToDisplay = { ...page };

        if (page.children && page.children.length > 0) {
          pageToDisplay.children = page.children.filter((child) =>
            this._canShowPage(child)
          );
        }

        const group = pageToDisplay.group || 'default';
        if (!grouped.has(group)) {
          grouped.set(group, []);
        }
        const groupPages = grouped.get(group);
        if (groupPages) {
          groupPages.push(pageToDisplay);
        }
      });
    } catch {
      // Return empty map if pages input is not yet available
    }

    return grouped;
  });
}
