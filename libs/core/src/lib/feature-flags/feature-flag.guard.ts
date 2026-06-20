import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureFlagService } from './feature-flag.service';

export const featureFlagGuard: CanActivateFn = (route) => {
  const flagName = route.data?.['featureFlag'] as string | undefined;
  if (!flagName) return true;

  const service = inject(FeatureFlagService);
  const router = inject(Router);
  const defaultValue = (route.data?.['featureFlagDefault'] as boolean) ?? true;

  if (service.isEnabled(flagName, defaultValue)) return true;

  const redirectTo = (route.data?.['featureFlagRedirect'] as string) ?? '/';
  return router.createUrlTree([redirectTo]);
};
