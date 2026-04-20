import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponentsComponent } from './test-components/test-components.component';
import { identityRoutes } from '../features/identity/identity.routes';
import { translationRoutes } from '../features/translation/translation.routes';
import { aiSettingsRoutes } from '../features/ai-settings/ai-settings.routes';
import { tenantRoutes } from '../features/tenant/tenant.routes';
import { notificationRoutes } from '../features/notification/notification.routes';
import { authGuard, roleGuard } from '@ihsan/core';

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
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'tenant',
        loadChildren: () => Promise.resolve(tenantRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin'] },
      },
      {
        path: 'translation',
        loadChildren: () => Promise.resolve(translationRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'ai-settings',
        loadChildren: () => Promise.resolve(aiSettingsRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'notification',
        loadChildren: () => Promise.resolve(notificationRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin'] },
      },
    ],
  },
];
