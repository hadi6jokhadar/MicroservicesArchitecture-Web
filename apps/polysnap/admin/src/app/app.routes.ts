import { Routes } from '@angular/router';
import { translationResolver } from '@ihsan/core';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.PolysnapLoginComponent),
    resolve: { translations: translationResolver },
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.PolysnapForgotPasswordComponent
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
