# Error Handler Usage Guide

**Version:** 1.0  
**Date:** January 25, 2026  
**Location:** `libs/shared/src/lib/interceptors/error.interceptor.ts`

---

## 📋 Overview

The Error Handler provides **two modes** for managing HTTP errors in your Angular application:

1. **Automatic Toast Notifications** (Default) - Interceptor catches errors and shows toast
2. **Manual Component Handling** - Component handles errors without showing toast

This allows you to have consistent error handling across your app while giving auth components and forms full control over error display.

---

## 🎯 Key Features

✅ **Automatic Error Interception** - All HTTP errors are caught globally  
✅ **Formatted Error Messages** - Backend validation errors displayed as clean bullet lists  
✅ **Skip Toast Option** - Components can opt-out of automatic toast notifications  
✅ **Dual Format Support** - Works with both `ProblemDetails` and `ErrorResponse` formats  
✅ **Helper Functions** - Easy-to-use utilities for extracting error messages

---

## 🚀 Quick Start

### Default Behavior (Automatic Toast)

By default, all HTTP errors automatically show toast notifications:

```typescript
export class UserService {
  private readonly _http = inject(HttpClient);

  createUser(user: ICreateUserRequest) {
    // ✅ Interceptor automatically shows toast on error
    return this._http.post<IUserDto>('/api/users', user);
  }
}
```

**No additional code needed!** The interceptor handles everything.

---

### Component-Level Error Handling

For auth components, forms, or custom error UI, skip the toast and handle errors manually:

```typescript
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';

export class LoginComponent {
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    // Create context to skip toast
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.login(request, context).subscribe({
      next: (response) => {
        // Handle success
        this._router.navigate(['/dashboard']);
      },
      error: (error) => {
        // ✅ Extract formatted error message
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
```

**Template:**

```html
@if (errorMessage()) {
<z-alert
  zType="destructive"
  zIcon="circle-alert"
  [zDescription]="errorMessage()"
/>
}
```

**Why Use z-alert:**

- ✅ Consistent UI with Zardui design system
- ✅ Built-in support for icons, titles, and descriptions
- ✅ Proper styling and accessibility out-of-the-box
- ✅ No custom CSS needed
- ✅ Automatically handles multi-line content with proper formatting

---

## 📦 Backend Error Response Formats

### Single Error (e.g., 401 Unauthorized)

**Backend Response:**

```json
{
  "title": "Unauthorized access",
  "status": 401,
  "detail": "Invalid email or password",
  "instance": "/api/auth/login",
  "traceId": "0HNIS4LMJ0TTJ:00000002"
}
```

**Frontend Display:**

```
Invalid email or password
```

---

### Validation Errors (400 Bad Request)

**Backend Response:**

```json
{
  "title": "Bad Request",
  "status": 400,
  "detail": "One or more validation errors occurred",
  "instance": "/api/auth/register",
  "traceId": "0HNIS4LMJ0TTI:00000002",
  "errors": {
    "password": [
      "Password must be at least 8 characters long",
      "Password must contain at least one special character"
    ],
    "firstName": ["First name must contain only letters and spaces"],
    "lastName": ["Last name must contain only letters and spaces"]
  }
}
```

**Frontend Display:**

```
One or more validation errors occurred

• Password must be at least 8 characters long

• Password must contain at least one special character

• First name must contain only letters and spaces

• Last name must contain only letters and spaces
```

---

## 🛠️ API Reference

### `SKIP_ERROR_TOAST` Context Token

**Import:**

```typescript
import { SKIP_ERROR_TOAST } from '@ihsan/shared';
```

**Usage:**

```typescript
import { HttpContext } from '@angular/common/http';

const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
this._http.post('/api/users', data, { context }).subscribe({
  error: (error) => {
    // Handle error manually - no toast will be shown
  },
});
```

**When to Use:**

- Login/Register/Forgot Password forms
- Multi-step wizards
- Forms with custom error UI
- Any component that needs full control over error display

---

### `extractErrorMessage(error)` Function

Extracts a formatted error message from HTTP error response, including validation errors.

**Import:**

```typescript
import { extractErrorMessage } from '@ihsan/shared';
```

**Signature:**

```typescript
function extractErrorMessage(error: HttpErrorResponse): string;
```

**Returns:**

- For single errors: `"Error message"`
- For validation errors:

  ```
  Main message

  • Error 1

  • Error 2
  ```

**Example:**

```typescript
error: (error) => {
  this.errorMessage.set(extractErrorMessage(error));
};
```

---

### `extractValidationErrors(error)` Function

Extracts field-specific validation errors as a structured object.

**Import:**

```typescript
import { extractValidationErrors } from '@ihsan/shared';
```

**Signature:**

```typescript
function extractValidationErrors(
  error: HttpErrorResponse
): Record<string, string[]> | null;
```

**Returns:**

```typescript
{
  "email": ["Email is required", "Invalid email format"],
  "password": ["Password must be at least 8 characters"]
}
// or null if no validation errors
```

**Example:**

```typescript
error: (error) => {
  const validationErrors = extractValidationErrors(error);

  if (validationErrors) {
    // Apply errors to specific form controls
    Object.entries(validationErrors).forEach(([field, messages]) => {
      const control = this.form.get(field);
      if (control) {
        control.setErrors({ backend: messages.join(', ') });
      }
    });
  } else {
    // General error
    this.errorMessage.set(extractErrorMessage(error));
  }
};
```

---

## 💡 Complete Examples

### Example 1: Register Component

**Component:**

```typescript
import { Component, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, IRegisterRequest } from '@ihsan/core';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';

interface IRegisterForm {
  email: FormControl<string>;
  password: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
}

export class RegisterComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly registerForm = new FormGroup<IRegisterForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.registerForm.getRawValue();
    const request: IRegisterRequest = {
      email: formValue.email,
      password: formValue.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
    };

    // Skip toast - handle error in component
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.register(request, context).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Registration successful!');
        setTimeout(() => {
          this._router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading.set(false);
        // Extract formatted error message with validation errors
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
```

**Template:**

```html
<form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
  <!-- Form fields... -->

  <!-- Error Display -->
  @if (errorMessage()) {
  <z-alert
    zType="destructive"
    zIcon="circle-alert"
    [zDescription]="errorMessage()"
  />
  }

  <!-- Success Display -->
  @if (successMessage()) {
  <z-alert
    zType="default"
    zIcon="circle-check"
    [zDescription]="successMessage()"
  />
  }

  <button z-button type="submit" [zLoading]="isLoading()">Register</button>
</form>
```

**Important:** No custom CSS needed - `z-alert` component handles all styling and multi-line content automatically!

---

### Example 2: Login Component

**Component:**

```typescript
import { Component, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ILoginRequest } from '@ihsan/core';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';

interface ILoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

export class LoginComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = new FormGroup<ILoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.loginForm.getRawValue();
    const request: ILoginRequest = {
      email: formValue.email,
      password: formValue.password,
    };

    // Skip toast - handle error in component
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.login(request, context).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        // Extract error message from backend
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
```

---

### Example 3: Field-Specific Validation Errors

```typescript
import { extractValidationErrors } from '@ihsan/shared';

error: (error) => {
  const validationErrors = extractValidationErrors(error);

  if (validationErrors) {
    // Apply backend validation errors to form controls
    Object.entries(validationErrors).forEach(([fieldName, messages]) => {
      const control = this.registerForm.get(fieldName);
      if (control) {
        // Set backend error on the control
        control.setErrors({
          backend: messages.join(', '),
        });
        control.markAsTouched();
      }
    });

    // Also show general message
    this.errorMessage.set('Please fix the errors below');
  } else {
    // General error without field-specific details
    this.errorMessage.set(extractErrorMessage(error));
  }
};
```

---

## 📊 Error Display Patterns

### Pattern 1: Using z-alert (Recommended)

```html
@if (errorMessage()) {
<z-alert
  zType="destructive"
  zIcon="circle-alert"
  [zDescription]="errorMessage()"
/>
}
```

**Why z-alert:**

- ✅ Consistent with Zardui design system
- ✅ No custom CSS needed
- ✅ Proper accessibility and styling
- ✅ Handles multi-line content automatically

---

### Pattern 2: Custom Alert with Template

For complex error structures with lists:

```html
@if (errorMessage()) {
<z-alert
  zType="destructive"
  zTitle="Validation Error"
  [zDescription]="errorTemplate"
/>

<ng-template #errorTemplate>
  <p>{{ getMainErrorMessage() }}</p>
  <ul class="list-disc pl-5">
    @for (error of getErrorList(); track error) {
    <li>{{ error }}</li>
    }
  </ul>
</ng-template>
}
```

---

### Pattern 3: Toast for Non-Auth Operations

```typescript
// No special code needed - default behavior
export class UserService {
  deleteUser(id: string) {
    // ✅ Interceptor automatically shows toast on error
    return this._http.delete(`/api/users/${id}`);
  }
}
```

---

## ✅ Best Practices

### DO ✅

- **Use `SKIP_ERROR_TOAST`** for auth components (login, register, forgot-password)
- **Use `extractErrorMessage()`** to get formatted error messages with validation details
- **Add `white-space: pre-line`** to your error message display CSS
- **Use `getRawValue()`** instead of non-null assertions on form values
- **Clear error message** when form is resubmitted or inputs change
- **Let interceptor handle errors** for general API calls (CRUD operations)

### DON'T ❌

- **Don't skip toast** without handling the error in your component
- **Don't hardcode error messages** when backend provides them
- **Don't forget CSS styling** - line breaks won't show without `white-space: pre-line`
- **Don't use non-null assertions (`!`)** on form values - use `getRawValue()` instead
- **Don't duplicate error handling** - use either interceptor OR component, not both

---

## 🔍 Debugging

### Check if Toast is Skipped

```typescript
const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
console.log('Skip toast:', context.get(SKIP_ERROR_TOAST)); // true
```

### Console Logs

The interceptor logs all errors to console (only when toast is NOT skipped):

```
[Error Interceptor] Bad Request: {
  type: "Bad Request",
  timestamp: "2026-01-25T10:30:00.000Z",
  status: 400,
  title: "Validation Failed",
  message: "One or more validation errors occurred",
  traceId: "00-abc123...",
  errors: { ... }
}
```

---

## 🔧 Service Layer Integration

### Auth Service

The `AuthService` has been updated to accept an optional `HttpContext` parameter:

```typescript
// libs/core/src/lib/identity/auth.service.ts
import { HttpContext } from '@angular/common/http';

login(request: ILoginRequest, context?: HttpContext): Observable<IAuthResponse> {
  return this._http.post<IAuthResponse>(`${this._baseUrl}/login`, request, { context });
}

register(request: IRegisterRequest, context?: HttpContext): Observable<IAuthResponse> {
  return this._http.post<IAuthResponse>(`${this._baseUrl}/register`, request, { context });
}

forgotPassword(request: IForgotPasswordRequest, context?: HttpContext): Observable<object> {
  return this._http.post(`${this._baseUrl}/forgot-password`, request, { context });
}
```

**Backwards Compatible:** The `context` parameter is optional, so existing code continues to work.

---

## 📚 Related Files

### Implementation Files

- **Interceptor:** `libs/shared/src/lib/interceptors/error.interceptor.ts`
- **Auth Service:** `libs/core/src/lib/identity/auth.service.ts`
- **Register Component:** `libs/shared/src/lib/components/register/register.component.ts`
- **Login Component:** `libs/shared/src/lib/components/login/login.component.ts`
- **Forgot Password:** `libs/shared/src/lib/components/forgot-password/forgot-password.component.ts`

### Documentation

- **Complete Guide:** `FRONTEND_ERROR_INTERCEPTOR_GUIDE.md`
- **Quick Reference:** `FRONTEND_ERROR_INTERCEPTOR_QUICK_REFERENCE.md`
- **Backend Integration:** `ERROR_HANDLING_COMPONENT_VS_INTERCEPTOR.md`
- **Flow Diagrams:** `ERROR_HANDLING_FLOW_DIAGRAM.md`

---

## 🎓 Migration Guide

### For Existing Components

**Before:**

```typescript
error: (error) => {
  this.errorMessage.set(error?.error?.message || 'An error occurred');
};
```

**After:**

```typescript
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';

// In your HTTP call
const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
this._service.someMethod(data, context).subscribe({
  error: (error) => {
    this.errorMessage.set(extractErrorMessage(error));
  },
});
```

**CSS:**

```scss
.error-message {
  white-space: pre-line; // ✅ Add this
  line-height: 1.6;
}
```

---

## 🎉 Summary

**The Error Handler provides:**

✅ **Automatic toast notifications** for all HTTP errors (default)  
✅ **Component-level error handling** for auth forms  
✅ **Formatted validation errors** as clean bullet lists  
✅ **Helper functions** (`extractErrorMessage`, `extractValidationErrors`)  
✅ **Dual format support** (ProblemDetails, ErrorResponse)  
✅ **Backwards compatible** with existing code

**Result:** Consistent error handling across your app with flexibility for custom error UI!

---

---

## 🔗 HTTP Interceptors Reference

All HTTP interceptors live in `libs/core/src/lib/interceptors/` and are registered in each app's `app.config.ts` via `withInterceptors([...])`.

### Interceptor chain (order matters)

```typescript
// apps/admin/src/app/app.config.ts
withInterceptors([
  correlationIdInterceptor,  // 1. stamp/read X-Correlation-Id
  errorInterceptor,          // 2. catch errors, show toast
  tokenInterceptor,          // 3. attach Bearer token
  tenantInterceptor,         // 4. attach x-tenant-id header
])
```

Interceptors run **in order** for outgoing requests and **in reverse** for incoming responses. `correlationIdInterceptor` is first so the ID is stamped before anything else modifies the request; on the response path it runs last so it always sees the final echoed ID.

---

### `correlationIdInterceptor`

**File:** `libs/core/src/lib/interceptors/correlation-id.interceptor.ts`  
**Import:** `import { correlationIdInterceptor } from '@ihsan/core';`

**What it does:**

- **Outgoing request**: reads the current ID from `CorrelationIdService` and adds `X-Correlation-Id` header
- **Incoming response**: reads the echoed `X-Correlation-Id` header from the backend response and calls `CorrelationIdService.update()` to store it for the next request

**`CorrelationIdService`**

**File:** `libs/core/src/lib/interceptors/correlation-id.service.ts`  
**Import:** `import { CorrelationIdService } from '@ihsan/core';`

```typescript
@Injectable({ providedIn: 'root' })
export class CorrelationIdService {
  readonly current = signal(crypto.randomUUID()); // starts with a fresh UUID on app boot

  update(id: string): void { ... }  // called automatically by the interceptor
}
```

Inject `CorrelationIdService` anywhere to read the active ID — useful for logging it in error dialogs or support screens:

```typescript
private readonly _correlationId = inject(CorrelationIdService);

showError(): void {
  console.error('Request failed. Correlation ID:', this._correlationId.current());
}
```

---

### `errorInterceptor`

**File:** `libs/shared/src/lib/interceptors/error.interceptor.ts`  
**Import:** `import { errorInterceptor } from '@ihsan/shared';`

Catches all HTTP errors. Shows a toast by default. Components can opt out with `new HttpContext().set(SKIP_ERROR_TOAST, true)`. See full documentation above.

---

### `tokenInterceptor`

**File:** `libs/core/src/lib/identity/`  
**Import:** `import { tokenInterceptor } from '@ihsan/core';`

Reads the stored JWT access token and adds `Authorization: Bearer <token>` to every outgoing request. No action on requests that already have an `Authorization` header.

---

### `tenantInterceptor`

**File:** `libs/core/src/lib/interceptors/tenant.interceptor.ts`  
**Import:** `import { tenantInterceptor } from '@ihsan/core';`

Reads `tenantId` from the injected `ENVIRONMENT` token and adds `x-tenant-id` header. Does nothing if `tenantId` is null/undefined (for apps that don't need tenant context).

---

**Version:** 1.1  
**Last Updated:** June 5, 2026  
**Maintained By:** Development Team
