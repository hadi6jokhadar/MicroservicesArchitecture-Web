# Error Handler Quick Reference

**Version:** 1.0 | **Date:** January 25, 2026

---

## 🚀 Quick Usage

### Default (Auto Toast)

```typescript
// ✅ Nothing special needed - interceptor handles it
this._http.post('/api/users', data).subscribe();
```

### Component Error Handling

```typescript
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';

const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

this._service.login(data, context).subscribe({
  error: (err) => this.errorMessage.set(extractErrorMessage(err)),
});
```

---

## 📦 Imports

```typescript
import { HttpContext } from '@angular/common/http';
import {
  SKIP_ERROR_TOAST,
  extractErrorMessage,
  extractValidationErrors,
} from '@ihsan/shared';
```

---

## 🛠️ API Functions

### `extractErrorMessage(error)`

Returns formatted error message (single string with bullet points for validation errors).

**Returns:**

```
Main error message

• Error 1

• Error 2
```

---

### `extractValidationErrors(error)`

Returns field-specific errors as object.

**Returns:**

```typescript
{
  "email": ["Error 1", "Error 2"],
  "password": ["Error 3"]
}
// or null
```

---

## 💡 Complete Example

```typescript
export class LoginComponent {
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.login(request, context).subscribe({
      next: () => this._router.navigate(['/dashboard']),
      error: (err) => this.errorMessage.set(extractErrorMessage(err)),
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

**Why:**

- ✅ No custom CSS needed
- ✅ Zardui design system
- ✅ Handles multi-line automatically

---

## ✅ Checklist

- [ ] Import `SKIP_ERROR_TOAST` and `extractErrorMessage`
- [ ] Import `ZardAlertComponent` from `@ihsan/ui`
- [ ] Create `HttpContext` with skip flag
- [ ] Pass context to service method
- [ ] Extract error in subscribe error handler
- [ ] Use `<z-alert>` component for error display

---

## 📚 Full Guide

See [ERROR_HANDLER_USAGE_GUIDE.md](./ERROR_HANDLER_USAGE_GUIDE.md) for complete documentation.

---

**Last Updated:** January 25, 2026
