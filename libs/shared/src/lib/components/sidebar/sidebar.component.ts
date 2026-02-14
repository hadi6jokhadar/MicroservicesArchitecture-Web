import { KeyValuePipe } from '@angular/common';
import {
  Component,
  input,
  output,
  signal,
  effect,
  inject,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  ZardButtonComponent,
  ZardDividerComponent,
  ZardIconComponent,
  ZardDropdownImports,
} from '@ihsan/ui';
import { ISidebarPage, ISidebarUser } from './sidebar.model';
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

  private _router = inject(Router);
  private _translationService = inject(TranslationService);

  availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage) {
      this.currentLanguage.set(savedLanguage);
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
        if (page.children && page.children.length > 0) {
          // Check if any child matches the current route
          const hasMatchingChild = page.children.some(
            (child) => child.route && currentUrl.startsWith(child.route)
          );

          if (hasMatchingChild) {
            expandedSet.add(page.translationKey);
          }
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
    localStorage.setItem('app-language', languageCode);
    this.currentLanguage.set(languageCode);

    this._translationService.getTranslations(languageCode).subscribe({
      next: (data) => {
        this._translationService.setTranslations(
          data.translations,
          data.language
        );
        // Reload the current page to apply translations
        window.location.reload();
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

  getGroupedPages(): Map<string, ISidebarPage[]> {
    const grouped = new Map<string, ISidebarPage[]>();

    try {
      const pages = this.pages();

      if (!pages || pages.length === 0) {
        return grouped;
      }

      pages.forEach((page) => {
        const group = page.group || 'default';
        if (!grouped.has(group)) {
          grouped.set(group, []);
        }
        const groupPages = grouped.get(group);
        if (groupPages) {
          groupPages.push(page);
        }
      });
    } catch {
      // Return empty map if pages input is not yet available
    }

    return grouped;
  }
}
