# Admin Login Component

Modern admin login component for the Identity service authentication.

## Features

- ✅ **Reactive Forms** with typed FormGroup
- ✅ **Email & Password Validation**
- ✅ **Password Visibility Toggle**
- ✅ **Loading State** during authentication
- ✅ **Snackbar Notifications** for success/error feedback
- ✅ **Material Design** with modern styling
- ✅ **Responsive Layout**

## Usage

```typescript
import { AdminLoginComponent } from '@ihsan/shared';

// In routes
{
  path: 'login',
  loadComponent: () =>
    import('@ihsan/shared').then((m) => m.AdminLoginComponent),
}
```

## Form Validation

- **Email**: Required, must be valid email format
- **Password**: Required

## Authentication Flow

1. User enters email and password
2. Form validation runs
3. On submit, calls `AuthService.login()`
4. On success:
   - Shows success snackbar
   - Navigates to `/admin`
5. On error:
   - Shows error snackbar with message

## Styling

The component uses CSS variables for theming and follows the project's design system:

- Centered card layout
- Full-width form fields
- Material Design components
- Responsive padding

## Dependencies

- `@ihsan/core` - AuthService, ILoginRequest
- `@angular/material` - Card, Input, Button, Icon, Snackbar
- `@angular/forms` - ReactiveFormsModule
