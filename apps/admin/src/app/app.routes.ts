import { Route } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { pagesRoutes } from './pages/pages.routes';

export const appRoutes: Route[] = [
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
