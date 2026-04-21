import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, map, of, tap } from 'rxjs';
import { UserClass } from './models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = (route.data?.['roles'] as Array<string>) || [];
  const hasRequiredRole = (roles: Array<string>): boolean =>
    requiredRoles.length === 0 ||
    requiredRoles.some((role) => roles.includes(role));

  if (!authService.getToken()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const user = authService.currentUser();
  if (user && requiredRoles) {
    const userRoles = user.roles?.map((r) => r.name) || [];
    if (hasRequiredRole(userRoles)) {
      return true;
    }

    return router.createUrlTree(['/']);
  }

  // On page refresh, token can exist while in-memory profile is still loading.
  // Resolve profile once before deciding authorization.
  return authService.getProfile().pipe(
    tap((profile) => authService.currentUser.set(new UserClass(profile))),
    map((profile) => {
      const userRoles = profile.roles?.map((r) => r.name) || [];
      return hasRequiredRole(userRoles) ? true : router.createUrlTree(['/']);
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
