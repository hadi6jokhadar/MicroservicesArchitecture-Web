import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'theme-tester',
    loadComponent: () =>
      import('@ihsan/shared').then((m) => m.ThemeTesterComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@ihsan/shared').then((m) => m.AdminLoginComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
