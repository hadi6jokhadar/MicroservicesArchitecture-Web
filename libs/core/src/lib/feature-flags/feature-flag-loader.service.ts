import { Injectable, effect, inject } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import { AuthService } from '../identity/auth.service';
import { TenantService } from '../tenant/tenant.service';
import { FeatureFlagService } from './feature-flag.service';

@Injectable({ providedIn: 'root' })
export class FeatureFlagLoaderService {
  private readonly _env = inject(ENVIRONMENT);
  private readonly _auth = inject(AuthService);
  private readonly _tenantService = inject(TenantService);
  private readonly _flagService = inject(FeatureFlagService);

  constructor() {
    // Reactive: reload flags whenever the logged-in user changes (login / logout).
    // Startup loading is handled by featureFlagResolver.
    effect(() => {
      const user = this._auth.currentUser();
      if (!user) {
        this._flagService.setFlags(null);
        return;
      }
      const tenantId = this._env.tenantId ?? this._auth.getTenantId() ?? undefined;
      this._tenantService
        .getFeatureFlags(tenantId)
        .pipe(catchError(() => EMPTY))
        .subscribe((flags) => this._flagService.setFlags(flags));
    });
  }
}
