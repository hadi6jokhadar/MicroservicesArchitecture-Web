import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { identityRoutes } from '../features/identity/identity.routes';

export const pagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'identity',
        loadChildren: () => Promise.resolve(identityRoutes),
      },
    ],
  },
];
