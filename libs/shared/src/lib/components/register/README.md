# Register Component

A fully-featured registration component with form validation, password confirmation, and automatic routing after successful registration.

## Features

- ✅ First name and last name fields
- ✅ Email validation
- ✅ Optional phone number field
- ✅ Password strength validation (minimum 6 characters)
- ✅ Password confirmation with mismatch detection
- ✅ Show/hide password toggles
- ✅ Loading states
- ✅ Error and success messages
- ✅ Automatic redirect after successful registration
- ✅ Link to login page
- ✅ Responsive design with decorative background

## Usage

### Basic Usage

```typescript
import { RegisterComponent } from '@ihsan/shared';

@Component({
  selector: 'app-register-page',
  imports: [RegisterComponent],
  template: '<shared-register />',
})
export class RegisterPageComponent {}
```

### With Configuration

```typescript
@Component({
  selector: 'app-register-page',
  imports: [RegisterComponent],
  template: `
    <shared-register
      [showLoginLink]="true"
      [redirectAfterRegister]="'/welcome'"
    />
  `,
})
export class RegisterPageComponent {}
```

## Input Signals

| Input                   | Type      | Default        | Description                                        |
| ----------------------- | --------- | -------------- | -------------------------------------------------- |
| `showLoginLink`         | `boolean` | `true`         | Show/hide the "Already have an account?" link      |
| `redirectAfterRegister` | `string`  | `'/dashboard'` | Route to navigate to after successful registration |

## Form Fields

### Required Fields

- **First Name**: Minimum 2 characters
- **Last Name**: Minimum 2 characters
- **Email**: Valid email format
- **Password**: Minimum 6 characters
- **Confirm Password**: Must match password

### Optional Fields

- **Phone Number**: Optional contact number

## Validation

The component includes comprehensive validation:

1. **Required field validation**: First name, last name, email, and password
2. **Email format validation**: Ensures valid email format
3. **Minimum length validation**: Names (2 chars), password (6 chars)
4. **Password match validation**: Confirms passwords match
5. **Real-time validation**: Shows errors after field is touched

## Events

On successful registration:

1. Shows success message
2. Waits 1.5 seconds
3. Automatically navigates to configured route (default: `/dashboard`)

## Styling

The component uses:

- Zardui components for consistent UI
- CSS custom properties for theming
- Logical CSS properties for RTL support
- Responsive grid layout for name fields
- Animated decorative background elements
- Focus states for accessibility

## Example with Router

```typescript
// In your routing configuration
const routes: Routes = [
  {
    path: 'register',
    component: RegisterPageComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
];
```

## Accessibility

- Unique IDs on all interactive elements
- Proper ARIA labels for password toggles
- Form validation messages
- Keyboard navigation support
- Focus indicators
