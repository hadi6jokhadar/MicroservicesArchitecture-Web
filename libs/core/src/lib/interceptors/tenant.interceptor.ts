import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../core/environment.token';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const environment = inject(ENVIRONMENT);
  const tenantId = environment.tenantId ?? null;

  if (tenantId) {
    req = req.clone({
      setHeaders: {
        'x-tenant-id': tenantId,
      },
    });
  }

  return next(req);
};
