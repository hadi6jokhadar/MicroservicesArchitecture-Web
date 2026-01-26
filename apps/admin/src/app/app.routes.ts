import { Route } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { pagesRoutes } from './pages/pages.routes';
import { AdminLoginComponent } from './pages/login/login.component';
import { AdminRegisterComponent } from './pages/register/register.component';
import { AdminForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: AdminLoginComponent,
  },
  {
    path: 'register',
    component: AdminRegisterComponent,
  },
  {
    path: 'forgot-password',
    component: AdminForgotPasswordComponent,
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
