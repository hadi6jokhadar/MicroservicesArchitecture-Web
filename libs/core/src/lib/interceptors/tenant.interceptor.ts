import { HttpInterceptorFn } from '@angular/common/http';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantId = localStorage.getItem('tenantId');
  if (tenantId) {
    req = req.clone({
      setHeaders: {
        'x-tenant-id': tenantId,
      },
    });
  }

  return next(req);
};
