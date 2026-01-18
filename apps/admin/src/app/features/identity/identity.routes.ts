import { Routes } from '@angular/router';
import { IdentityComponent } from './identity.component';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { ClaimsComponent } from './claims/claims.component';

export const identityRoutes: Routes = [
  {
    path: '',
    component: IdentityComponent,
    children: [
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'roles',
        component: RolesComponent,
      },
      {
        path: 'claims',
        component: ClaimsComponent,
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
    ],
  },
];
