import { CurrencyPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ISidebarPage,
  ISidebarUser,
  SidebarPageClass,
  SidebarUserClass,
} from '@ihsan/shared';
import { ZardButtonComponent, ZardCardComponent } from '@ihsan/ui';

@Component({
  selector: 'app-pages',
  imports: [CurrencyPipe, ZardCardComponent, ZardButtonComponent],
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
})
export class PagesComponent {
  private _router = new Router();
  products = [
    {
      id: 1,
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: 29.99,
      quantity: 150,
      status: 'In Stock',
    },
    {
      id: 2,
      name: 'Mechanical Keyboard',
      category: 'Electronics',
      price: 89.99,
      quantity: 75,
      status: 'In Stock',
    },
    {
      id: 3,
      name: 'USB-C Cable',
      category: 'Accessories',
      price: 12.99,
      quantity: 0,
      status: 'Out of Stock',
    },
    {
      id: 4,
      name: 'Laptop Stand',
      category: 'Accessories',
      price: 45.5,
      quantity: 30,
      status: 'In Stock',
    },
    {
      id: 5,
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: 129.99,
      quantity: 5,
      status: 'Low Stock',
    },
  ];

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
    if (page.route) {
      // Navigate to the route when implemented
      // this._router.navigate([page.route]);
    }
  }

  toggleDarkMode(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('dark-mode');
  }
}
