import { Route } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { pagesRoutes } from './pages/pages.routes';
import { AdminLoginComponent } from './pages/login/login.component';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: AdminLoginComponent,
  },
  {
    path: '',
    component: PagesComponent,
    children: pagesRoutes,
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
