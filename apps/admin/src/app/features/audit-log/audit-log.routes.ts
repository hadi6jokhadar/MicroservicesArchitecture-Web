import { Routes } from '@angular/router';
import { AuditLogListComponent } from './audit-log-list/audit-log-list.component';

export const auditLogRoutes: Routes = [
  {
    path: '',
    component: AuditLogListComponent,
  },
];
