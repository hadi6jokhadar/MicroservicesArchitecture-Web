import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CorrelationIdService } from './correlation-id.service';

export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationIdService = inject(CorrelationIdService);

  const outgoing = req.clone({
    setHeaders: { 'X-Correlation-Id': correlationIdService.current() },
  });

  return next(outgoing).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        const id = event.headers.get('X-Correlation-Id');
        if (id) {
          correlationIdService.update(id);
        }
      }
    })
  );
};
