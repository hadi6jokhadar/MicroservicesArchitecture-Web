import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { snapRequestsRoutes } from '../features/snap-requests/snap-requests.routes';
import { mapPocRoutes } from '../features/map-poc/map-poc.routes';
import { authGuard, roleGuard } from '@ihsan/core';
import { identityRoutes } from '@ihsan/shared';

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
        path: 'snap-requests',
        loadChildren: () => Promise.resolve(snapRequestsRoutes),
        canActivate: [authGuard],
      },
      {
        path: 'map-poc',
        loadChildren: () => Promise.resolve(mapPocRoutes),
        canActivate: [authGuard],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
