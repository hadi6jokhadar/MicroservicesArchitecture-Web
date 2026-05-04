import { Routes } from '@angular/router';
import { translationResolver } from '@ihsan/core';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.AdminLoginComponent),
    resolve: { translations: translationResolver },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.AdminRegisterComponent
      ),
    resolve: { translations: translationResolver },
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.AdminForgotPasswordComponent
      ),
    resolve: { translations: translationResolver },
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/pages.component').then((m) => m.PagesComponent),
    resolve: { translations: translationResolver },
    loadChildren: () =>
      import('./pages/pages.routes').then((m) => m.pagesRoutes),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
