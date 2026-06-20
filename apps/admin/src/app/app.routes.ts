import { Route } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { pagesRoutes } from './pages/pages.routes';
import { AdminLoginComponent } from './pages/login/login.component';
import { AdminRegisterComponent } from './pages/register/register.component';
import { AdminForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { featureFlagResolver, translationResolver } from '@ihsan/core';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: AdminLoginComponent,
    resolve: { translations: translationResolver, featureFlags: featureFlagResolver },
  },
  {
    path: 'register',
    component: AdminRegisterComponent,
    resolve: { translations: translationResolver, featureFlags: featureFlagResolver },
  },
  {
    path: 'forgot-password',
    component: AdminForgotPasswordComponent,
    resolve: { translations: translationResolver, featureFlags: featureFlagResolver },
  },
  {
    path: '',
    component: PagesComponent,
    children: pagesRoutes,
    resolve: { translations: translationResolver, featureFlags: featureFlagResolver },
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
