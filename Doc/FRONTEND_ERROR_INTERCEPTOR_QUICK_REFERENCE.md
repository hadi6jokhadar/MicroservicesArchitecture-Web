# Frontend Error Interceptor - Quick Reference

**Version:** 1.0 | **Date:** January 25, 2026

---

## 🎯 What It Does

Automatically handles **ALL** HTTP errors from backend with:

- ✅ User-friendly toast notifications
- ✅ Auto-redirect to login on 401
- ✅ Detailed console logging
- ✅ Support for validation errors

---

## 📍 Location

**Interceptor:** `libs/shared/src/lib/interceptors/error.interceptor.ts`  
**Registered:** `apps/admin/src/app/app.config.ts`

```typescript
import { errorInterceptor } from '@ihsan/shared';

provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor]));
```

---

## 🚨 Supported Error Types

| Status | Type                  | Action                      |
| ------ | --------------------- | --------------------------- |
| 0      | Network Error         | Show "Connection Error"     |
| 400    | Bad Request           | Show validation errors      |
| 401    | Unauthorized          | Show toast + redirect login |
| 403    | Forbidden             | Show "Access Denied"        |
| 404    | Not Found             | Show "Not Found"            |
| 409    | Conflict              | Show "Conflict"             |
| 500    | Internal Server Error | Show "Server Error"         |

---

## 📦 Backend Error Formats Supported

### Format 1: ProblemDetails (Primary)

```json
{
  "status": 400,
  "title": "Bad Request",
  "detail": "Invalid request",
  "traceId": "00-abc...",
  "errors": {
    "email": ["Required", "Invalid format"]
  }
}
```

### Format 2: ErrorResponse (Legacy)

```json
{
  "statusCode": 404,
  "title": "Not Found",
  "message": "User not found",
  "traceId": "00-def..."
}
```

---

## 💻 Usage Examples

### ✅ CORRECT - Let Interceptor Handle Errors

```typescript
export class UserService {
  private readonly _http = inject(HttpClient);

  // Interceptor shows toast on error
  createUser(user: ICreateUserRequest) {
    return this._http.post<IUserDto>('/api/users', user);
  }
}
```

### ✅ CORRECT - Component Handles Success Only

```typescript
export class UserFormComponent {
  onSubmit(): void {
    this._userService.createUser(this.form.value).subscribe({
      next: (user) => {
        toast.success('User created');
        this.router.navigate(['/users', user.id]);
      },
      error: () => {
        // Error already handled by interceptor
        this.isLoading.set(false);
      },
    });
  }
}
```

### ❌ WRONG - Duplicate Error Handling

```typescript
// Don't do this - interceptor already shows toast
this._http.post('/api/users', user).subscribe({
  error: (error) => {
    toast.error('Failed to create user'); // ❌ Duplicate toast
  },
});
```

---

## 🎨 Toast Notifications

### Validation Errors (400)

```
🔴 Validation Failed (3 fields)
email: Email is required, Invalid format
password: Must be at least 8 characters
name: Name is required
```

### Unauthorized (401)

```
🔴 Unauthorized
Your session has expired. Please login again.
```

_Auto-redirects to: `/auth/login?returnUrl=/current-page`_

### Server Error (500)

```
🔴 Server Error
An unexpected error occurred (Trace ID: 00-abc123...)
```

---

## 🔍 Debugging

### Console Logs

Every error is logged with full details:

```typescript
[Error Interceptor] Bad Request: {
  type: "Bad Request",
  timestamp: "2026-01-25T10:30:00.000Z",
  status: 400,
  title: "Validation Failed",
  message: "One or more validation errors occurred",
  traceId: "00-abc123...",
  errors: { email: ["Required"], password: ["Too short"] },
  url: "https://api.example.com/api/users"
}
```

### Trace IDs

- **User-facing:** Shown in toast for 500 errors
- **Console:** Logged for all errors
- **Backend:** Search logs with trace ID for full stack trace

---

## ⚙️ Customization

### Change Toast Duration

```typescript
// In error.interceptor.ts
toast.error('Title', {
  description: message,
  duration: 8000, // 8 seconds (default: 5000)
});
```

### Change Toast Position

```html
<!-- In app.component.html -->
<z-toaster position="top-right" <!-- Change position -->
  [richColors]="true" [closeButton]="true" /></z-toaster
>
```

### Skip Interceptor for Specific Requests

```typescript
import { HttpContext, HttpContextToken } from '@angular/common/http';

const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

// Make request without toast
this._http
  .get('/api/users/check-email', {
    context: new HttpContext().set(SKIP_ERROR_TOAST, true),
  })
  .pipe(catchError(() => of(false)));
```

---

## 🔗 Related Files

**Frontend:**

- `libs/shared/src/lib/interceptors/error.interceptor.ts`
- `apps/admin/src/app/app.config.ts`
- `libs/core/src/lib/identity/auth.service.ts` (token interceptor)

**Backend:**

- `src/Shared/IhsanDev.Shared.Infrastructure/Middleware/GlobalExceptionHandler.cs`
- `src/Shared/IhsanDev.Shared.Application/Exceptions/AppException.cs`

**Documentation:**

- `MicroservicesArchitecture-Web/Doc/FRONTEND_ERROR_INTERCEPTOR_GUIDE.md` (full guide)
- `MicroservicesArchitecture/Doc/CENTRALIZED_VALIDATION_ERROR_HANDLING.md`

---

## ✅ Best Practices

**DO:**

- ✅ Let interceptor handle all HTTP errors
- ✅ Use backend localization for error messages
- ✅ Include Trace IDs in backend logs
- ✅ Test all error scenarios

**DON'T:**

- ❌ Show duplicate toast notifications
- ❌ Swallow errors without propagating
- ❌ Hardcode error messages in frontend
- ❌ Ignore validation errors

---

## 📚 Full Documentation

See [FRONTEND_ERROR_INTERCEPTOR_GUIDE.md](./FRONTEND_ERROR_INTERCEPTOR_GUIDE.md) for complete documentation.

---

**Last Updated:** January 25, 2026
