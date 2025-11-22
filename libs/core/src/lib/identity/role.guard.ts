import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();
  const requiredRoles = route.data['roles'] as Array<string>;

  if (!authService.getToken()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (user && requiredRoles && requiredRoles.includes(user.role)) {
    return true;
  }

  // Not authorized
  router.navigate(['/']);
  return false;
};
