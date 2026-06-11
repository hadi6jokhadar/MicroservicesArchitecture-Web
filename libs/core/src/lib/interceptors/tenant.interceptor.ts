import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../core/environment.token';
import { TenantService } from '../tenant/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const environment = inject(ENVIRONMENT);
  const tenantService = inject(TenantService);

  const tenantId = tenantService.currentTenantId() ?? environment.tenantId ?? null;

  if (tenantId) {
    req = req.clone({
      setHeaders: {
        'x-tenant-id': tenantId,
      },
    });
  }

  return next(req);
};
