import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();
  const requiredRoles = route.data['roles'] as Array<string>;

  if (!authService.getToken()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (user && requiredRoles) {
    const userRoles = user.roles?.map((r) => r.name) || [];
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );
    if (hasRequiredRole) {
      return true;
    }
  }

  // Not authorized
  router.navigate(['/']);
  return false;
};
