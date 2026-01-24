# Login Component (Shared)

## Overview

A reusable, configurable login component located in `libs/shared` for use across multiple applications (Admin, Users, etc.).

## Location

`libs/shared/src/lib/components/login/`

## Features

- ✅ **Standalone Component** - Can be used anywhere without sidebar or layout
- ✅ **Configurable Inputs** - Show/hide forgot password and create account links
- ✅ **Custom Redirect** - Configure where to redirect after successful login
- ✅ **Email and password authentication** using `ILoginRequest`
- ✅ **Form validation** with visual feedback
- ✅ **Password visibility toggle**
- ✅ **Loading states** during authentication
- ✅ **Error handling** with user-friendly messages
- ✅ **Responsive design** (Desktop, Tablet, Mobile)
- ✅ **Decorative animated background**
- ✅ **Accessibility features** (ARIA labels, focus states)
- ✅ **Uses Zardui components** exclusively

## Usage

### Basic Usage (Default - All features enabled)

```typescript
import { LoginComponent } from '@ihsan/shared';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginComponent,
  },
];
```

This will show:

- ✅ Forgot password link
- ✅ Create account link
- ✅ Redirect to `/dashboard` after login

### Custom Configuration

```typescript
// Hide forgot password link
<app-login [showForgotPassword]="false" />

// Hide create account link
<app-login [showCreateAccount]="false" />

// Hide both links
<app-login [showForgotPassword]="false" [showCreateAccount]="false" />

// Custom redirect after login
<app-login [redirectAfterLogin]="'/admin/dashboard'" />

// Complete custom configuration
<app-login
  [showForgotPassword]="true"
  [showCreateAccount]="false"
  [redirectAfterLogin]="'/user/profile'"
/>
```

### Example: Admin App

```typescript
// apps/admin/src/app/app.routes.ts
import { Route } from '@angular/router';
import { LoginComponent } from '@ihsan/shared';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginComponent, // No sidebar visible
  },
  {
    path: '',
    component: PagesComponent, // Sidebar visible for authenticated routes
    children: pagesRoutes,
  },
];
```

### Example: User App (Different Configuration)

```typescript
// apps/users/src/app/app.routes.ts
import { Route } from '@angular/router';
import { LoginComponent } from '@ihsan/shared';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginComponent,
    data: {
      showForgotPassword: false, // Hide for users
      showCreateAccount: true,
      redirectAfterLogin: '/user/home',
    },
  },
];
```

## Input Properties

| Property             | Type      | Default        | Description                                 |
| -------------------- | --------- | -------------- | ------------------------------------------- |
| `showForgotPassword` | `boolean` | `true`         | Show/hide "Forgot password?" link           |
| `showCreateAccount`  | `boolean` | `true`         | Show/hide "Create account" link             |
| `redirectAfterLogin` | `string`  | `'/dashboard'` | Route to navigate to after successful login |

## Protected Routes

The `identity` routes are protected with the `authGuard`:

- Only authenticated users can access `/identity/*` routes
- Unauthenticated users are redirected to `/login`
- Return URL is preserved in query params for post-login redirection

## Form Validation Rules

- **Email**: Required, must be valid email format
- **Password**: Required, minimum 6 characters

## Components Used

- `ZardButtonComponent` - Submit button with loading state
- `ZardCardComponent` - Login form container
- `ZardFormImports` - Form field, label, error components
- `ZardInputDirective` - Styled input fields
- `ZardIconComponent` - Shield logo, input icons, password toggle

## Integration

- **Service**: `AuthService` from `@ihsan/core`
- **Guard**: `authGuard` applied to protected routes
- **Model**: `ILoginRequest` interface
- **Import**: Always use `@ihsan/core` (NOT `@ihsan/core/identity`)

### ⚠️ Import Path Note

**CRITICAL:** Always import from `@ihsan/core` (base path only):

```typescript
import { AuthService, ILoginRequest, authGuard } from '@ihsan/core';
```

**DO NOT** use subpaths like `@ihsan/core/identity` - this will cause TypeScript error:

```
Cannot find module '@ihsan/core/identity' or its corresponding type declarations.ts(2307)
```

## File Structure

```
libs/shared/src/lib/components/login/
├── login.component.ts       # Component logic with signals and typed forms
├── login.component.html     # Template with Zardui components
├── login.component.scss     # Styles with CSS logical properties
└── index.ts                 # Export file
```

## Styling Features

- CSS Variables for theming
- Logical properties for RTL support
- Smooth animations and transitions
- Focus states for accessibility
- Responsive breakpoints (768px, 480px)
- Floating background decorations

## Key Differences from Page-Based Login

- ✅ **No Sidebar** - Component is outside of PagesComponent layout
- ✅ **Reusable** - Can be used in Admin, User, or any other app
- ✅ **Configurable** - Input signals allow customization per use case
- ✅ **Shared Library** - Located in `libs/shared` for cross-app usage

## Migration from Page-Based Login

The old login page at `apps/admin/src/app/pages/login/` has been:

1. ✅ Moved to `libs/shared/src/lib/components/login/`
2. ✅ Enhanced with input signals for configuration
3. ✅ Removed from pages routes (no longer shows sidebar)
4. ✅ Added to app routes directly (standalone route)

## Future Enhancements

- [ ] Implement "Forgot Password" functionality
- [ ] Add "Create Account" registration flow
- [ ] Add "Remember Me" functionality
- [ ] Implement social login providers
- [ ] Add two-factor authentication support
