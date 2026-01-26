# Frontend Error Interceptor Guide

**Version:** 1.0  
**Date:** January 25, 2026  
**Location:** `libs/shared/src/lib/interceptors/error.interceptor.ts`

---

## 📋 Overview

The Error Interceptor is a comprehensive HTTP error handler for the Angular frontend that:

1. **Intercepts all HTTP errors** from backend services
2. **Parses backend error responses** (supports both ProblemDetails and ErrorResponse formats)
3. **Displays user-friendly toast notifications** using ngx-sonner
4. **Handles authentication failures** (auto-redirects to login)
5. **Logs detailed error information** to console for debugging

---

## 🎯 Supported Backend Error Types

The interceptor handles all backend exception types from the .NET microservices:

| Status Code | Exception Type          | Description                         | Auto-Action       |
| ----------- | ----------------------- | ----------------------------------- | ----------------- |
| **400**     | BadRequestException     | Validation errors or bad input      | Show toast        |
| **400**     | ValidationException     | FluentValidation errors (w/ fields) | Show field errors |
| **401**     | UnauthorizedException   | Authentication required/expired     | Redirect to login |
| **403**     | ForbiddenException      | User lacks permission               | Show toast        |
| **404**     | NotFoundException       | Resource not found                  | Show toast        |
| **409**     | ConflictException       | Resource conflict (e.g., duplicate) | Show toast        |
| **500**     | GeneralException        | Internal server error               | Show toast        |
| **0**       | Network Error           | No connection to server             | Show toast        |

---

## 🔧 Installation & Setup

### 1. Interceptor Already Registered

The interceptor is automatically registered in `apps/admin/src/app/app.config.ts`:

```typescript
import { errorInterceptor } from '@ihsan/shared';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor])),
    // ... other providers
  ],
};
```

### 2. Dependencies

**Required packages (already installed):**

- `ngx-sonner` - Toast notification library (used by Zardui)
- `@angular/common/http` - Angular HTTP client
- `@angular/router` - For login redirects

---

## 📦 Backend Error Response Formats

The interceptor supports **two error response formats** from the backend:

### Format 1: ProblemDetails (Primary - from GlobalExceptionHandler)

```json
{
  "status": 400,
  "title": "Bad Request",
  "detail": "Invalid request data",
  "instance": "/api/users",
  "traceId": "00-abc123...",
  "errors": {
    "email": ["Email is required", "Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**Properties:**

- `status` - HTTP status code
- `title` - Localized error title
- `detail` - Localized error message
- `instance` - Request path that caused the error
- `traceId` - Unique trace ID for debugging
- `errors` - (Optional) Validation errors by field name

**Backend Source:** `GlobalExceptionHandler.cs` (implements `IExceptionHandler`)

---

### Format 2: ErrorResponse (Legacy - from GlobalExceptionHandlingMiddleware)

```json
{
  "statusCode": 404,
  "title": "Not Found",
  "message": "User not found",
  "localizationKey": "Exceptions.UserNotFound",
  "traceId": "00-def456...",
  "timestamp": "2026-01-25T10:30:00Z"
}
```

**Properties:**

- `statusCode` - HTTP status code
- `title` - Localized error title
- `message` - Localized error message
- `localizationKey` - Backend localization key
- `traceId` - Unique trace ID for debugging
- `timestamp` - ISO 8601 UTC timestamp

**Backend Source:** `GlobalExceptionHandlingMiddleware.cs` (middleware approach)

---

## 🎨 User Experience Examples

### 1. Validation Errors (400 Bad Request)

**Backend Response:**

```json
{
  "status": 400,
  "title": "Validation Failed",
  "detail": "One or more validation errors occurred",
  "errors": {
    "email": ["Email is required", "Invalid email format"],
    "password": ["Password must be at least 8 characters"],
    "name": ["Name is required"]
  }
}
```

**Frontend Display:**

```
🔴 Validation Failed (3 fields)
email: Email is required, Invalid email format
password: Password must be at least 8 characters
name: Name is required
```

---

### 2. Unauthorized (401)

**Backend Response:**

```json
{
  "status": 401,
  "title": "Unauthorized",
  "detail": "Your session has expired"
}
```

**Frontend Actions:**

1. Show toast: `"Unauthorized - Your session has expired. Please login again."`
2. Clear tokens from localStorage/sessionStorage
3. Redirect to `/auth/login?returnUrl=/current-page`

---

### 3. Conflict (409)

**Backend Response:**

```json
{
  "status": 409,
  "title": "Conflict",
  "detail": "Email is already registered"
}
```

**Frontend Display:**

```
🔴 Conflict
Email is already registered
```

---

### 4. Server Error (500)

**Backend Response:**

```json
{
  "statusCode": 500,
  "title": "Internal Server Error",
  "message": "An unexpected error occurred",
  "traceId": "00-abc123..."
}
```

**Frontend Display:**

```
🔴 Server Error
An unexpected error occurred (Trace ID: 00-abc123...)
```

---

### 5. Network Error (Status 0)

**Scenario:** Backend server is down or no internet connection

**Frontend Display:**

```
🔴 Connection Error
Unable to connect to the server. Please check your internet connection.
```

---

## 🔍 Error Handling Flow

```typescript
HTTP Request
    ↓
[Token Interceptor] ← Adds JWT token
    ↓
Backend API
    ↓
[Error Response] ← If error occurs
    ↓
[Error Interceptor] ← Catches error
    ↓
Parse Response Format (ProblemDetails or ErrorResponse)
    ↓
Route to Specific Handler (based on status code)
    ↓
┌─────────────┬─────────────┬─────────────┐
│ Show Toast  │ Redirect    │ Log Error   │
└─────────────┴─────────────┴─────────────┘
```

---

## 📝 Usage Examples

### Example 1: Service Call with Automatic Error Handling

```typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export class UserService {
  private readonly _http = inject(HttpClient);

  // ✅ CORRECT - Interceptor handles all errors automatically
  createUser(user: ICreateUserRequest) {
    return this._http.post<IUserDto>('/api/users', user);
    // No .catch() needed - interceptor shows toast on error
  }

  // ✅ CORRECT - Can still handle errors manually if needed
  createUserWithCustomHandling(user: ICreateUserRequest) {
    return this._http.post<IUserDto>('/api/users', user).pipe(
      catchError((error) => {
        // Custom error handling (e.g., form-specific validation)
        // Interceptor still logs and shows toast
        return throwError(() => error);
      })
    );
  }
}
```

---

### Example 2: Component Usage

```typescript
import { Component, inject, signal } from '@angular/core';
import { UserService } from './user.service';

export class UserFormComponent {
  private readonly _userService = inject(UserService);
  readonly isLoading = signal(false);

  onSubmit(): void {
    this.isLoading.set(true);

    this._userService.createUser(this.userForm.value).subscribe({
      next: (user) => {
        // Success handling
        toast.success('User created successfully');
        this.router.navigate(['/users', user.id]);
      },
      error: () => {
        // Error already handled by interceptor
        // Just reset loading state
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
```

---

### Example 3: Ignoring Interceptor for Specific Requests

If you need to handle errors manually **without** toast notifications:

```typescript
import { HttpContext, HttpContextToken } from '@angular/common/http';

// Define custom context token
const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

// Use in service
export class UserService {
  private readonly _http = inject(HttpClient);

  // Custom error handling without toast
  checkEmailExists(email: string) {
    return this._http
      .get<boolean>(`/api/users/email-exists/${email}`, {
        context: new HttpContext().set(SKIP_ERROR_TOAST, true),
      })
      .pipe(
        catchError(() => {
          // Handle silently
          return of(false);
        })
      );
  }
}

// Update interceptor to check context (add this to error.interceptor.ts)
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip toast if context flag is set
      if (!req.context.get(SKIP_ERROR_TOAST)) {
        handleError(error, router);
      }
      return throwError(() => error);
    })
  );
};
```

---

## 🐛 Debugging

### Console Logging

The interceptor logs **detailed error information** to the console:

```typescript
[Error Interceptor] Validation Failed (400): {
  type: "Bad Request",
  timestamp: "2026-01-25T10:30:00.000Z",
  status: 400,
  title: "Validation Failed",
  message: "One or more validation errors occurred",
  traceId: "00-abc123...",
  instance: "/api/users",
  errors: {
    email: ["Email is required"],
    password: ["Password must be at least 8 characters"]
  },
  url: "https://api.example.com/api/users",
  statusText: "Bad Request"
}
```

### Viewing Trace IDs

Trace IDs are included in:

1. **Console logs** - For frontend debugging
2. **Toast notifications** (server errors only) - For user reporting
3. **Backend logs** - For backend debugging

**To trace an error end-to-end:**

1. User reports error with Trace ID from toast
2. Search backend logs for the Trace ID
3. View full stack trace and request details

---

## 🔧 Customization

### Modify Toast Duration

```typescript
// In error.interceptor.ts

function handleBadRequest(
  errorData: IProblemDetails | IErrorResponse | null,
  error: HttpErrorResponse
): void {
  toast.error('Invalid Request', {
    description: message,
    duration: 8000, // ✅ Change duration (default: 5000ms)
  });
}
```

---

### Add Custom Error Types

```typescript
// In error.interceptor.ts

function handleError(error: HttpErrorResponse, router: Router): void {
  // ... existing code

  switch (error.status) {
    // ... existing cases

    case 422: // ✅ Add new error type
      handleUnprocessableEntity(errorData);
      break;
  }
}

function handleUnprocessableEntity(
  errorData: IProblemDetails | IErrorResponse | null
): void {
  const message = getErrorMessage(errorData);

  toast.error('Unprocessable Entity', {
    description: message || 'The request could not be processed.',
    duration: 5000,
  });

  logError('Unprocessable Entity', errorData);
}
```

---

### Change Toast Style

The toast component is configured in `app.component.html`:

```html
<!-- apps/admin/src/app/app.component.html -->
<z-toaster
  position="bottom-right"
  [richColors]="true"
  [closeButton]="true"
  [duration]="4000"
/>
<router-outlet />
```

**Options:**

- `position`: `'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`
- `richColors`: `boolean` - Use colored icons for success/error/warning
- `closeButton`: `boolean` - Show close button on toasts
- `duration`: `number` - Default duration in milliseconds

---

## ✅ Best Practices

### DO ✅

- **Let the interceptor handle errors** - Don't duplicate error handling in every service
- **Use meaningful backend error messages** - They're shown directly to users
- **Include Trace IDs in backend logs** - Essential for debugging production issues
- **Test all error scenarios** - Ensure toast notifications display correctly

### DON'T ❌

- **Don't swallow errors** - Always let errors propagate to the interceptor
- **Don't show duplicate toasts** - The interceptor already shows one
- **Don't hardcode error messages** - Use backend localization keys
- **Don't rely solely on toast notifications** - Log errors for debugging

---

## 🔗 Related Files

### Frontend

- `libs/shared/src/lib/interceptors/error.interceptor.ts` - Error interceptor
- `apps/admin/src/app/app.config.ts` - Interceptor registration
- `libs/core/src/lib/identity/auth.service.ts` - Token interceptor

### Backend

- `src/Shared/IhsanDev.Shared.Infrastructure/Middleware/GlobalExceptionHandler.cs` - Primary exception handler
- `src/Shared/IhsanDev.Shared.Infrastructure/Middleware/GlobalExceptionHandlingMiddleware.cs` - Legacy middleware
- `src/Shared/IhsanDev.Shared.Application/Exceptions/AppException.cs` - Exception types

### Documentation

- `MicroservicesArchitecture/Doc/CENTRALIZED_VALIDATION_ERROR_HANDLING.md` - Backend error handling
- `MicroservicesArchitecture/Doc/COMPLETE_LOCALIZATION_MIGRATION_SUMMARY.md` - Localization guide

---

## 🧪 Testing

### Test Backend Error Responses

```typescript
// Example: Test 401 Unauthorized
describe('Error Interceptor', () => {
  it('should redirect to login on 401 error', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    httpMock
      .expectOne('/api/users')
      .flush(
        { title: 'Unauthorized', detail: 'Token expired' },
        { status: 401, statusText: 'Unauthorized' }
      );

    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: jasmine.any(String) },
    });
  });
});
```

---

## 📚 Additional Resources

- **ngx-sonner Documentation:** https://ngx-sonner.vercel.app/
- **Angular HTTP Interceptors:** https://angular.dev/guide/http/interceptors
- **ASP.NET Core ProblemDetails:** https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.problemdetails

---

**Version:** 1.0  
**Last Updated:** January 25, 2026  
**Maintained By:** Development Team
