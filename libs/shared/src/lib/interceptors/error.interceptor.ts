import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpContextToken,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';

/**
 * Context token to skip error toast notification
 * Use this when component wants to handle errors manually
 */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/**
 * Backend Error Response Structure (ProblemDetails from ASP.NET Core)
 */
interface IProblemDetails {
  status: number;
  title: string;
  detail: string;
  instance: string;
  traceId?: string;
  errors?: Record<string, string[]>; // For validation errors
}

/**
 * Legacy Error Response Structure (from GlobalExceptionHandlingMiddleware)
 */
interface IErrorResponse {
  statusCode: number;
  title: string;
  message: string;
  localizationKey: string;
  traceId: string;
  timestamp: string;
}

/**
 * Error Interceptor - Handles all backend error responses
 *
 * Supported Backend Error Types:
 * - 400 Bad Request (BadRequestException, ValidationException)
 * - 401 Unauthorized (UnauthorizedException)
 * - 403 Forbidden (ForbiddenException)
 * - 404 Not Found (NotFoundException)
 * - 409 Conflict (ConflictException)
 * - 500 Internal Server Error (GeneralException)
 *
 * Error Response Formats:
 * - ProblemDetails (from GlobalExceptionHandler - IExceptionHandler)
 * - ErrorResponse (from GlobalExceptionHandlingMiddleware)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if component wants to handle error manually (skip toast)
      const skipToast = req.context.get(SKIP_ERROR_TOAST);

      if (!skipToast) {
        handleError(error, router);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Main error handler - routes to specific handlers based on status code
 */
function handleError(error: HttpErrorResponse, router: Router): void {
  // Network/Connection Errors
  if (error.status === 0) {
    handleNetworkError(error);
    return;
  }

  // Try to parse backend error response
  const errorData = parseErrorResponse(error);

  // Route to specific handler based on status code
  switch (error.status) {
    case 400:
      handleBadRequest(errorData, error);
      break;
    case 401:
      handleUnauthorized(errorData, router);
      break;
    case 403:
      handleForbidden(errorData);
      break;
    case 404:
      handleNotFound(errorData);
      break;
    case 409:
      handleConflict(errorData);
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      handleServerError(errorData, error.status);
      break;
    default:
      handleUnknownError(errorData, error.status);
  }
}

/**
 * Parse error response - supports both ProblemDetails and ErrorResponse formats
 */
function parseErrorResponse(
  error: HttpErrorResponse
): IProblemDetails | IErrorResponse | null {
  if (!error.error) {
    return null;
  }

  // Check if it's ProblemDetails format (has 'detail' property)
  if ('detail' in error.error) {
    return error.error as IProblemDetails;
  }

  // Check if it's ErrorResponse format (has 'message' property)
  if ('message' in error.error) {
    return error.error as IErrorResponse;
  }

  return null;
}

/**
 * Extract error message from either format
 */
function getErrorMessage(
  errorData: IProblemDetails | IErrorResponse | null
): string {
  if (!errorData) {
    return 'An unexpected error occurred';
  }

  // ProblemDetails format
  if ('detail' in errorData) {
    return errorData.detail;
  }

  // ErrorResponse format
  if ('message' in errorData) {
    return errorData.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Extract trace ID from either format
 */
function getTraceId(
  errorData: IProblemDetails | IErrorResponse | null
): string | undefined {
  if (!errorData) {
    return undefined;
  }

  // ProblemDetails format
  if ('detail' in errorData && errorData.traceId) {
    return errorData.traceId;
  }

  // ErrorResponse format
  if ('message' in errorData && errorData.traceId) {
    return errorData.traceId;
  }

  return undefined;
}

// ========================================================================
// SPECIFIC ERROR HANDLERS
// ========================================================================

/**
 * 400 Bad Request - Validation errors or bad input
 * Supports FluentValidation errors from backend
 */
function handleBadRequest(
  errorData: IProblemDetails | IErrorResponse | null,
  error: HttpErrorResponse
): void {
  const message = getErrorMessage(errorData);

  // Check if it's a validation error with field-specific errors
  if (errorData && 'detail' in errorData && errorData.errors) {
    const validationErrors = errorData.errors;
    const fieldCount = Object.keys(validationErrors).length;

    // Show validation errors
    const errorMessages = Object.entries(validationErrors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');

    toast.error(
      `Validation Failed (${fieldCount} field${fieldCount > 1 ? 's' : ''})`,
      {
        description: errorMessages,
        duration: 6000,
      }
    );

    console.error('Validation Errors:', validationErrors);
  } else {
    // General bad request
    toast.error('Invalid Request', {
      description: message,
      duration: 5000,
    });
  }

  logError('Bad Request', errorData, error);
}

/**
 * 401 Unauthorized - Authentication required or token expired
 * Automatically redirects to login page
 */
function handleUnauthorized(
  errorData: IProblemDetails | IErrorResponse | null,
  router: Router
): void {
  const message = getErrorMessage(errorData);

  toast.error('Unauthorized', {
    description: message || 'Your session has expired. Please login again.',
    duration: 4000,
  });

  // Clear auth tokens
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');

  // Redirect to login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: router.url },
  });

  logError('Unauthorized', errorData);
}

/**
 * 403 Forbidden - User doesn't have permission
 */
function handleForbidden(
  errorData: IProblemDetails | IErrorResponse | null
): void {
  const message = getErrorMessage(errorData);

  toast.error('Access Denied', {
    description:
      message || 'You do not have permission to perform this action.',
    duration: 5000,
  });

  logError('Forbidden', errorData);
}

/**
 * 404 Not Found - Resource not found
 */
function handleNotFound(
  errorData: IProblemDetails | IErrorResponse | null
): void {
  const message = getErrorMessage(errorData);

  toast.error('Not Found', {
    description: message || 'The requested resource was not found.',
    duration: 4000,
  });

  logError('Not Found', errorData);
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate email)
 */
function handleConflict(
  errorData: IProblemDetails | IErrorResponse | null
): void {
  const message = getErrorMessage(errorData);

  toast.error('Conflict', {
    description:
      message || 'A conflict occurred while processing your request.',
    duration: 5000,
  });

  logError('Conflict', errorData);
}

/**
 * 500/502/503/504 - Server errors
 */
function handleServerError(
  errorData: IProblemDetails | IErrorResponse | null,
  statusCode: number
): void {
  const message = getErrorMessage(errorData);
  const traceId = getTraceId(errorData);

  toast.error('Server Error', {
    description: `${message}${traceId ? ` (Trace ID: ${traceId})` : ''}`,
    duration: 6000,
  });

  logError(`Server Error (${statusCode})`, errorData);
}

/**
 * Network/Connection errors (status 0)
 */
function handleNetworkError(error: HttpErrorResponse): void {
  toast.error('Connection Error', {
    description:
      'Unable to connect to the server. Please check your internet connection.',
    duration: 5000,
  });

  console.error('Network Error:', {
    status: error.status,
    statusText: error.statusText,
    url: error.url,
  });
}

/**
 * Unknown/Unhandled errors
 */
function handleUnknownError(
  errorData: IProblemDetails | IErrorResponse | null,
  statusCode: number
): void {
  const message = getErrorMessage(errorData);

  toast.error(`Error (${statusCode})`, {
    description: message || 'An unexpected error occurred.',
    duration: 5000,
  });

  logError(`Unknown Error (${statusCode})`, errorData);
}

// ========================================================================
// LOGGING UTILITIES
// ========================================================================

/**
 * Log errors to console with full details
 */
function logError(
  type: string,
  errorData: IProblemDetails | IErrorResponse | null,
  error?: HttpErrorResponse
): void {
  const logData = {
    type,
    timestamp: new Date().toISOString(),
    ...(errorData && {
      status: 'detail' in errorData ? errorData.status : errorData.statusCode,
      title: errorData.title,
      message: getErrorMessage(errorData),
      traceId: getTraceId(errorData),
      instance: 'detail' in errorData ? errorData.instance : undefined,
      errors: 'detail' in errorData ? errorData.errors : undefined,
      localizationKey:
        'message' in errorData ? errorData.localizationKey : undefined,
    }),
    ...(error && {
      url: error.url,
      statusText: error.statusText,
    }),
  };

  console.error(`[Error Interceptor] ${type}:`, logData);
}

// ========================================================================
// UTILITY FUNCTIONS FOR COMPONENTS
// ========================================================================

/**
 * Extract error message from HTTP error response
 * Use this in components to get user-friendly error messages
 *
 * @param error - HttpErrorResponse from backend
 * @returns Formatted error message with validation details if available
 *
 * @example
 * ```typescript
 * error: (error) => {
 *   this.errorMessage.set(extractErrorMessage(error));
 * }
 * ```
 */
export function extractErrorMessage(error: HttpErrorResponse): string {
  const errorData = parseErrorResponse(error);

  if (!errorData) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Get main error message
  const mainMessage = getErrorMessage(errorData);

  // Check for validation errors
  if ('detail' in errorData && errorData.errors) {
    const validationErrors = errorData.errors;

    // Flatten all validation errors into a bulleted list
    const errorMessages = Object.entries(validationErrors)
      .flatMap(([_, messages]) => messages)
      .map((msg) => `• ${msg}`)
      .join('\n');

    return `${mainMessage}\n${errorMessages}`;
  }

  return mainMessage;
}

/**
 * Extract validation errors from HTTP error response
 * Use this to get field-specific errors for form validation
 *
 * @param error - HttpErrorResponse from backend
 * @returns Object with field names as keys and error messages as values
 *
 * @example
 * ```typescript
 * error: (error) => {
 *   const validationErrors = extractValidationErrors(error);
 *   // { email: ["Required", "Invalid format"], password: ["Too short"] }
 * }
 * ```
 */
export function extractValidationErrors(
  error: HttpErrorResponse
): Record<string, string[]> | null {
  const errorData = parseErrorResponse(error);

  if (errorData && 'detail' in errorData && errorData.errors) {
    return errorData.errors;
  }

  return null;
}
