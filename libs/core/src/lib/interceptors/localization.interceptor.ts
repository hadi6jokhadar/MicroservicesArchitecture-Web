import { HttpInterceptorFn } from '@angular/common/http';

export const localizationInterceptor: HttpInterceptorFn = (req, next) => {
  const locale = localStorage.getItem('locale') || 'en';

  req = req.clone({
    setHeaders: {
      'Accept-Language': locale,
    },
  });

  return next(req);
};
