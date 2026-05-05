import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { identityRoutes } from '../features/identity/identity.routes';
import { authGuard, roleGuard } from '@ihsan/core';

export const pagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      {
        path: 'identity',
        loadChildren: () => Promise.resolve(identityRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'artists',
        loadChildren: () =>
          import('../features/artists/artists.routes').then((m) => m.artistsRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'songs',
        loadChildren: () =>
          import('../features/songs/songs.routes').then((m) => m.SONGS_ROUTES),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'ingestion',
        loadChildren: () =>
          import('../features/ingestion/ingestion.routes').then((m) => m.INGESTION_ROUTES),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] },
      },
      {
        path: 'search',
        loadChildren: () =>
          import('../features/search/search.routes').then((m) => m.SEARCH_ROUTES),
        canActivate: [authGuard],
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
