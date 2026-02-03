import { Route } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { pagesRoutes } from './pages/pages.routes';
import { AdminLoginComponent } from './pages/login/login.component';
import { AdminRegisterComponent } from './pages/register/register.component';
import { AdminForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { translationResolver } from '@ihsan/core';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: AdminLoginComponent,
    resolve: { translations: translationResolver },
  },
  {
    path: 'register',
    component: AdminRegisterComponent,
    resolve: { translations: translationResolver },
  },
  {
    path: 'forgot-password',
    component: AdminForgotPasswordComponent,
    resolve: { translations: translationResolver },
  },
  {
    path: '',
    component: PagesComponent,
    children: pagesRoutes,
    resolve: { translations: translationResolver },
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
