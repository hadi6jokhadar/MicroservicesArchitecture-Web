import { Routes } from '@angular/router';
import { TenantListComponent } from './tenant-list/tenant-list.component';

export const tenantRoutes: Routes = [
  {
    path: '',
    component: TenantListComponent,
  },
];
