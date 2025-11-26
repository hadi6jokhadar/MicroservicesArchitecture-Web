import { Route } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { pagesRoutes } from './pages/pages.routes';

export const appRoutes: Route[] = [
  {
    path: 'pages',
    component: PagesComponent,
    children: pagesRoutes,
  },
  {
    path: '',
    redirectTo: 'pages',
    pathMatch: 'full',
  },
];
