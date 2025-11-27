import { KeyValuePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ZardAvatarComponent,
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
    ZardAvatarComponent,
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

  onPageClick(page: ISidebarPage): void {
    this.pageClicked.emit(page);
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
