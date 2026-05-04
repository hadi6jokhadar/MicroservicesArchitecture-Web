import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { identityRoutes } from '../features/identity/identity.routes';
import { authGuard, roleGuard } from '@ihsan/core';

export const pagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      {
        path: 'identity',
        loadChildren: () => Promise.resolve(identityRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
