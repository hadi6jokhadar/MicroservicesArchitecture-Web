import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, map, of, tap } from 'rxjs';
import { UserClass } from './models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = (route.data?.['roles'] as Array<string>) || [];
  const requiredPermissions =
    (route.data?.['permissions'] as Array<string>) || [];
  // Passes if no roles/permissions are required, the user holds any required role
  // (e.g. Admin/SuperAdmin), OR the user holds any required permission claim (e.g. a
  // "NasheedDataEntry" role's "nasheed.pages.songs" claim) — role and permission are
  // alternative, not additive, gates.
  const isAuthorized = (roles: Array<string>, permissions: Array<string>): boolean =>
    (requiredRoles.length === 0 && requiredPermissions.length === 0) ||
    requiredRoles.some((role) => roles.includes(role)) ||
    requiredPermissions.some((permission) => permissions.includes(permission));

  if (!authService.getToken()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const user = authService.currentUser();
  if (user) {
    const userRoles = user.roles?.map((r) => r.name) || [];
    if (isAuthorized(userRoles, user.permissions)) {
      return true;
    }

    return router.createUrlTree(['/']);
  }

  // On page refresh, token can exist while in-memory profile is still loading.
  // Resolve profile once before deciding authorization.
  return authService.getProfile().pipe(
    map((profile) => new UserClass(profile)),
    tap((resolvedUser) => authService.currentUser.set(resolvedUser)),
    map((resolvedUser) => {
      const userRoles = resolvedUser.roles?.map((r) => r.name) || [];
      return isAuthorized(userRoles, resolvedUser.permissions)
        ? true
        : router.createUrlTree(['/']);
    }),
    catchError(() =>
      of(
        router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url },
        })
      )
    )
  );
};
