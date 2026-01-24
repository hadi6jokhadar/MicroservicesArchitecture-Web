import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponentsComponent } from './test-components/test-components.component';
import { identityRoutes } from '../features/identity/identity.routes';
import { authGuard } from '@ihsan/core';

export const pagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'test-components',
        component: TestComponentsComponent,
      },
      {
        path: 'identity',
        loadChildren: () => Promise.resolve(identityRoutes),
        canActivate: [authGuard],
      },
    ],
  },
];
