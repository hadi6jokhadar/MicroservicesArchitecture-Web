import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ENVIRONMENT } from '../core/environment.token';
import { AuthService } from '../identity/auth.service';
import { TenantService } from '../tenant/tenant.service';
import { FeatureFlagService } from './feature-flag.service';

export const featureFlagResolver: ResolveFn<void> = (): Observable<void> => {
  const env = inject(ENVIRONMENT);
  const authService = inject(AuthService);
  const tenantService = inject(TenantService);
  const flagService = inject(FeatureFlagService);

  const tenantId = env.tenantId ?? authService.getTenantId() ?? undefined;

  return tenantService.getFeatureFlags(tenantId).pipe(
    tap((flags) => flagService.setFlags(flags)),
    map(() => void 0 as void),
    catchError(() => of(void 0 as void))
  );
};
