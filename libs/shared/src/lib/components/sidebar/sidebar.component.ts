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
} from '@ihsan/ui';
import { ISidebarPage, ISidebarUser } from './sidebar.model';

@Component({
  selector: 'shared-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    KeyValuePipe,
    ZardButtonComponent,
    ZardDividerComponent,
    ZardIconComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  pages = input.required<ISidebarPage[]>();
  currentUser = input.required<ISidebarUser>();
  appTitle = input<string>('Application');

  pageClicked = output<ISidebarPage>();
  darkModeToggled = output<void>();

  expandedPages = signal<Set<string>>(new Set());

  private _router = inject(Router);

  constructor() {
    // Auto-expand parent pages when navigating to a child route
    effect(() => {
      this.pages(); // Trigger effect when pages input changes
      this._autoExpandParentPages();
    });

    // Also listen to route changes
    this._router.events.subscribe(() => {
      this._autoExpandParentPages();
    });
  }

  private _autoExpandParentPages(): void {
    const currentUrl = this._router.url;
    const expandedSet = new Set<string>();

    // Find all parent pages that have children matching the current route
    const findParentsForRoute = (pages: ISidebarPage[]): void => {
      pages.forEach((page) => {
        if (page.children && page.children.length > 0) {
          // Check if any child matches the current route
          const hasMatchingChild = page.children.some(
            (child) => child.route && currentUrl.startsWith(child.route)
          );

          if (hasMatchingChild) {
            expandedSet.add(page.label);
          }
        }
      });
    };

    findParentsForRoute(this.pages());
    this.expandedPages.set(expandedSet);
  }

  onPageClick(page: ISidebarPage): void {
    if (page.children && page.children.length > 0) {
      this.toggleExpand(page.label);
    } else {
      this.pageClicked.emit(page);
    }
  }

  toggleExpand(pageLabel: string): void {
    const expanded = this.expandedPages();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(pageLabel)) {
      newExpanded.delete(pageLabel);
    } else {
      newExpanded.add(pageLabel);
    }

    this.expandedPages.set(newExpanded);
  }

  isExpanded(pageLabel: string): boolean {
    return this.expandedPages().has(pageLabel);
  }

  onToggleDarkMode(): void {
    this.darkModeToggled.emit();
  }

  getGroupedPages(): Map<string, ISidebarPage[]> {
    const grouped = new Map<string, ISidebarPage[]>();
    const pages = this.pages();

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

    return grouped;
  }
}
