import { Routes } from '@angular/router';
import { TenantListComponent } from './tenant-list/tenant-list.component';
import { tenantResolver } from '@ihsan/core';

export const tenantRoutes: Routes = [
  {
    path: '',
    component: TenantListComponent,
    resolve: { tenants: tenantResolver },
  },
];
