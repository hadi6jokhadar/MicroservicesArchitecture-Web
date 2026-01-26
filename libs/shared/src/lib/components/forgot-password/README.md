# Forgot Password Component

A user-friendly forgot password component with email validation and success state display.

## Features

- ✅ Email validation
- ✅ Loading states
- ✅ Error messages
- ✅ Success state with step-by-step instructions
- ✅ Resend capability
- ✅ Back to login navigation
- ✅ Responsive design with decorative background

## Usage

### Basic Usage

```typescript
import { ForgotPasswordComponent } from '@ihsan/shared';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ForgotPasswordComponent],
  template: '<shared-forgot-password />',
})
export class ForgotPasswordPageComponent {}
```

### With Configuration

```typescript
@Component({
  selector: 'app-forgot-password-page',
  imports: [ForgotPasswordComponent],
  template: `
    <shared-forgot-password
      [showBackToLogin]="true"
      [redirectAfterSuccess]="'/auth/login'"
    />
  `,
})
export class ForgotPasswordPageComponent {}
```

## Input Signals

| Input                  | Type      | Default    | Description                                 |
| ---------------------- | --------- | ---------- | ------------------------------------------- |
| `showBackToLogin`      | `boolean` | `true`     | Show/hide the "Back to Login" button        |
| `redirectAfterSuccess` | `string`  | `'/login'` | Route for "Back to Login" button navigation |

## Form Fields

### Required Fields

- **Email**: Valid email format

## States

### Initial State

- Shows email input field
- Submit button to send reset instructions
- Optional back to login link

### Success State

- Confirmation icon
- Success message with email address
- Three-step instructions:
  1. Check your email inbox
  2. Click the reset link
  3. Create a new password
- "Try again" link to resend email
- Back to login button

## Validation

The component includes:

1. **Required field validation**: Email is required
2. **Email format validation**: Ensures valid email format
3. **Real-time validation**: Shows errors after field is touched

## User Flow

1. User enters their email address
2. Clicks "Send Reset Instructions"
3. System sends password reset email
4. Success message appears with next steps
5. User can click "Back to Login" or "Try again" to resend

## Styling

The component uses:

- Zardui components for consistent UI
- CSS custom properties for theming
- Logical CSS properties for RTL support
- Animated decorative background elements
- Success state with visual steps
- Focus states for accessibility

## Example with Router

```typescript
// In your routing configuration
const routes: Routes = [
  {
    path: 'forgot-password',
    component: ForgotPasswordPageComponent,
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
];
```

## Accessibility

- Unique IDs on all interactive elements
- Proper form labels
- Validation messages
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
