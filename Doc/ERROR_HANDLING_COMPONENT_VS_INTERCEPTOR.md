# Error Handling - Component-Level vs Interceptor

**Date:** January 25, 2026

---

## 🎯 Overview

The error interceptor now supports **two modes** of error handling:

1. **Automatic Toast Notifications** (Default) - Interceptor shows toast
2. **Manual Component Handling** - Component handles errors without toast

---

## 🔧 How It Works

### Default Behavior (Show Toast)

By default, the interceptor catches all HTTP errors and shows toast notifications:

```typescript
export class UserService {
  createUser(user: ICreateUserRequest) {
    // ✅ Interceptor automatically shows toast on error
    return this._http.post<IUserDto>('/api/users', user);
  }
}
```

---

### Component Handling (Skip Toast)

For auth components (login, register, forgot-password), errors are handled manually:

```typescript
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';

export class LoginComponent {
  onSubmit(): void {
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.login(request, context).subscribe({
      next: (response) => {
        // Handle success
      },
      error: (error) => {
        // ✅ No toast shown - component handles error
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
```

---

## 📦 Error Response Formats

### Single Error (401 Unauthorized)

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

```typescript
this.errorMessage.set(extractErrorMessage(error));
// Output: "Invalid email or password"
```

---

### Validation Errors (400 Bad Request)

**Backend Response:**

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "One or more validation errors occurred",
  "instance": "/api/auth/register",
  "traceId": "0HNIS4LMJ0TTI:00000002",
  "errors": {
    "password": ["Password must contain at least one uppercase letter"],
    "firstName": ["First name must contain only letters and spaces"],
    "lastName": ["Last name must contain only letters and spaces"]
  }
}
```

**Frontend Display:**

```typescript
this.errorMessage.set(extractErrorMessage(error));
// Output:
// "One or more validation errors occurred
//
// password: Password must contain at least one uppercase letter
// firstName: First name must contain only letters and spaces
// lastName: Last name must contain only letters and spaces"
```

---

## 🛠️ Utility Functions

### `extractErrorMessage(error)`

Extracts formatted error message from backend response (includes validation errors).

**Usage:**

```typescript
import { extractErrorMessage } from '@ihsan/shared';

error: (error) => {
  this.errorMessage.set(extractErrorMessage(error));
};
```

**Returns:**

- `"detail message"` - For single errors
- `"detail message\n\nfield1: error1\nfield2: error2"` - For validation errors

---

### `extractValidationErrors(error)`

Extracts field-specific validation errors.

**Usage:**

```typescript
import { extractValidationErrors } from '@ihsan/shared';

error: (error) => {
  const validationErrors = extractValidationErrors(error);
  // { email: ["Required", "Invalid format"], password: ["Too short"] }

  if (validationErrors) {
    // Apply to form controls or display separately
    Object.entries(validationErrors).forEach(([field, messages]) => {
      console.log(`${field}: ${messages.join(', ')}`);
    });
  }
};
```

---

## ✅ Complete Example - Register Component

```typescript
import { Component, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly registerForm = new FormGroup<IRegisterForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    firstName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl<string>('', {
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

    // ✅ Skip toast - component handles error
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.register(request, context).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Registration successful!');
      },
      error: (error) => {
        this.isLoading.set(false);
        // ✅ Extract error message (includes validation errors)
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
```

**Template:**

```html
@if (errorMessage()) {
<div class="error-message">{{ errorMessage() }}</div>
} @if (successMessage()) {
<div class="success-message">{{ successMessage() }}</div>
}
```

---

## 📊 Comparison

| Aspect                 | Default (Interceptor)      | Component Handling             |
| ---------------------- | -------------------------- | ------------------------------ |
| **Toast Notification** | ✅ Auto-shown              | ❌ No toast                    |
| **Component Error**    | ❌ Not available           | ✅ Available in errorMessage   |
| **Use Case**           | General API calls          | Auth forms, custom error UI    |
| **Setup**              | No setup needed            | Add `SKIP_ERROR_TOAST` context |
| **Error Format**       | Toast with detail + errors | Component displays as needed   |

---

## 🎨 Error Display Patterns

### Pattern 1: Simple Error Alert

```html
@if (errorMessage()) {
<z-alert zType="destructive"> {{ errorMessage() }} </z-alert>
}
```

---

### Pattern 2: Multi-line Error (Validation)

```html
@if (errorMessage()) {
<div class="error-container">
  <z-icon zType="circle-alert" class="error-icon" />
  <div class="error-text" style="white-space: pre-line">
    {{ errorMessage() }}
  </div>
</div>
}
```

**Note:** Use `white-space: pre-line` to preserve line breaks for validation errors.

---

### Pattern 3: Field-Specific Errors

```typescript
import { extractValidationErrors } from '@ihsan/shared';

error: (error) => {
  const validationErrors = extractValidationErrors(error);

  if (validationErrors) {
    // Set error on specific form controls
    Object.entries(validationErrors).forEach(([field, messages]) => {
      const control = this.registerForm.get(field);
      if (control) {
        control.setErrors({ backend: messages.join(', ') });
      }
    });
  } else {
    // General error message
    this.errorMessage.set(extractErrorMessage(error));
  }
};
```

---

## 🚀 When to Use Each Approach

### Use Interceptor (Default) ✅

- General CRUD operations
- User management
- File uploads
- Notifications
- Any API call where toast is acceptable

### Use Component Handling ✅

- **Login forms** - Show error under form
- **Register forms** - Display validation errors
- **Forgot password** - Custom success/error messages
- **Settings forms** - Need custom error UI
- **Multi-step forms** - Track errors per step

---

## 🔍 Debugging

### Check if Error Was Handled

```typescript
import { SKIP_ERROR_TOAST } from '@ihsan/shared';

// In component
const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
console.log('Skip toast:', context.get(SKIP_ERROR_TOAST)); // true

// In interceptor (logs automatically)
// [Error Interceptor] Login Error: { ... } (only if toast NOT skipped)
```

---

## ✅ Best Practices

**DO:**

- ✅ Use `SKIP_ERROR_TOAST` for auth components
- ✅ Use `extractErrorMessage()` to get formatted errors
- ✅ Display validation errors with `white-space: pre-line`
- ✅ Clear error message on form resubmit
- ✅ Use `getRawValue()` instead of non-null assertions

**DON'T:**

- ❌ Skip toast without handling error in component
- ❌ Hardcode error messages when backend provides them
- ❌ Use non-null assertions (`!`) on form values
- ❌ Forget to set loading state to false in error handler

---

## 📚 Related Files

- `libs/shared/src/lib/interceptors/error.interceptor.ts` - Error interceptor
- `libs/shared/src/lib/components/login/login.component.ts` - Example usage
- `libs/shared/src/lib/components/register/register.component.ts` - Example usage
- `libs/core/src/lib/identity/auth.service.ts` - Auth service with context support

---

**Last Updated:** January 25, 2026
