import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponentsComponent } from './test-components/test-components.component';
import { identityRoutes } from '../features/identity/identity.routes';
import { translationRoutes } from '../features/translation/translation.routes';
import { tenantRoutes } from '../features/tenant/tenant.routes';
import { notificationRoutes } from '../features/notification/notification.routes';
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
      {
        path: 'tenant',
        loadChildren: () => Promise.resolve(tenantRoutes),
        canActivate: [authGuard],
      },
      {
        path: 'translation',
        loadChildren: () => Promise.resolve(translationRoutes),
        canActivate: [authGuard],
      },
      {
        path: 'notification',
        loadChildren: () => Promise.resolve(notificationRoutes),
        canActivate: [authGuard],
      },
    ],
  },
];
