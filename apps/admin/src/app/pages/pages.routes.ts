import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TestComponentsComponent } from './test-components/test-components.component';
import { identityRoutes } from '../features/identity/identity.routes';
import { translationRoutes } from '../features/translation/translation.routes';
import { aiSettingsRoutes } from '../features/ai-settings/ai-settings.routes';
import { aiSystemPromptsRoutes } from '../features/ai-system-prompts/ai-system-prompts.routes';
import { aiChatSessionsRoutes } from '../features/ai-chat-sessions/ai-chat-sessions.routes';
import { aiTokenUsageLogsRoutes } from '../features/ai-token-usage-logs/ai-token-usage-logs.routes';
import { tenantRoutes } from '../features/tenant/tenant.routes';
import { notificationRoutes } from '../features/notification/notification.routes';
import { categoryRoutes } from '../features/category/category.routes';
import { auditLogRoutes } from '../features/audit-log/audit-log.routes';
import { authGuard, featureFlagGuard, FeatureFlags, roleGuard } from '@ihsan/core';

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
        path: 'ai-system-prompts',
        loadChildren: () => Promise.resolve(aiSystemPromptsRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'notification',
        loadChildren: () => Promise.resolve(notificationRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin'] },
      },
      {
        path: 'ai-chat-sessions',
        loadChildren: () => Promise.resolve(aiChatSessionsRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin'] },
      },
      {
        path: 'ai-token-usage-logs',
        loadChildren: () => Promise.resolve(aiTokenUsageLogsRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SuperAdmin'] },
      },
      {
        path: 'categories',
        loadChildren: () => Promise.resolve(categoryRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'audit-log',
        loadChildren: () => Promise.resolve(auditLogRoutes),
        canActivate: [authGuard, roleGuard, featureFlagGuard],
        data: { roles: ['SuperAdmin'], featureFlag: FeatureFlags.IsAuditLogPageEnabled },
      },
    ],
  },
];
