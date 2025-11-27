import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  sidebarPages = signal<ISidebarPage[]>([
    new SidebarPageClass({
      label: 'Dashboard',
      icon: '🏠',
      route: '/dashboard',
    }),
    new SidebarPageClass({
      label: 'Identity',
      icon: '👥',
      group: 'User Group',
      route: '/identity',
    }),
    new SidebarPageClass({
      label: 'Tenant',
      icon: '🏢',
      group: 'System Group',
      route: '/tenant',
    }),
    new SidebarPageClass({
      label: 'FileManager',
      icon: '📁',
      group: 'System Group',
      route: '/file-manager',
    }),
    new SidebarPageClass({
      label: 'Notification',
      icon: '🔔',
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

  onPageClick(page: ISidebarPage): void {
    console.log('Page clicked:', page);
  }

  toggleDarkMode(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('dark-mode');
  }
}
