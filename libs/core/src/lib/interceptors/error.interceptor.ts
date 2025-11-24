import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { ErrorComponent, ErrorDialogData } from '@ihsan/shared';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let data: ErrorDialogData = {
        title: 'Error',
        message: 'An unexpected error occurred.',
        status: error.status,
      };

      if (error.error) {
        // Handle ProblemDetails (Standard)
        if (error.error.title) {
          data.title = error.error.title;
        }
        if (error.error.detail) {
          data.message = error.error.detail;
        }

        // Handle Custom ErrorResponse
        if (error.error.message) {
          data.message = error.error.message;
        }
        if (error.error.traceId) {
          data.traceId = error.error.traceId;
        }

        // Handle Validation Errors
        if (error.error.extensions?.errors) {
          data.errors = error.error.extensions.errors;
        }
        if (error.error.errors) {
          data.errors = error.error.errors;
        }
      }

      // Don't show dialog for 401 (Unauthorized) as it usually redirects
      if (error.status !== 401) {
        dialog.open(ErrorComponent, {
          data,
          width: '400px',
          disableClose: true,
        });
      }

      return throwError(() => error);
    })
  );
};
