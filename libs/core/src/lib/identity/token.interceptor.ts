import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { IAuthResponse } from './models';

// State for token refreshing
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const injector = inject(Injector);

  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('auth/refresh') &&
        !req.url.includes('auth/login')
      ) {
        const authService = injector.get(AuthService);
        return handle401Error(req, next, error, authService);
      }

      return throwError(() => error);
    })
  );
};

const handle401Error = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  originalError: HttpErrorResponse,
  authService: AuthService
): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Get tokens directly from storage or service (service might be safer if method exists and is public)
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && refreshToken) {
      return authService
        .refreshToken({
          accessToken: token,
          refreshToken: refreshToken,
        })
        .pipe(
          switchMap((response: IAuthResponse) => {
            isRefreshing = false;
            refreshTokenSubject.next(response.accessToken);
            return next(addToken(req, response.accessToken));
          }),
          catchError((err) => {
            isRefreshing = false;
            // Let the error interceptor handle the logout/redirect
            return throwError(() => err);
          })
        );
    } else {
      isRefreshing = false;
      return throwError(() => originalError);
    }
  }

  // If already refreshing, wait for the token
  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => {
      return next(addToken(req, token));
    })
  );
};

const addToken = (req: HttpRequest<unknown>, token: string) => {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};
