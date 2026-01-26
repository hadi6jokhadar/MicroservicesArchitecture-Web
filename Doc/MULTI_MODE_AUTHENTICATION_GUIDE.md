# Multi-Mode Authentication Components Guide

**Date:** January 26, 2026  
**Components:** Login & Register  
**Location:** `libs/shared/src/lib/components/login/`, `libs/shared/src/lib/components/register/`

---

## 🎯 Overview

The login and register components now support **three authentication modes** with a seamless step-by-step flow. Users can choose their preferred authentication method using a segmented control selector.

---

## 🔑 Authentication Modes

### Login Component

| Mode               | Flow                                      | API Endpoints Used                                                            |
| ------------------ | ----------------------------------------- | ----------------------------------------------------------------------------- |
| **Email/Password** | Traditional login with email and password | `POST /api/auth/login`                                                        |
| **Email Code**     | Request code → Enter 6-digit code → Login | `POST /api/auth/get-verification-code-by-email` → `/login-with-code-by-email` |
| **Phone Code**     | Request code → Enter 6-digit code → Login | `POST /api/auth/get-verification-code-by-phone` → `/login-with-code-by-phone` |

### Register Component

| Mode               | Flow                                                        | API Endpoints Used                                                         |
| ------------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Email/Password** | Traditional registration with all fields                    | `POST /api/auth/register`                                                  |
| **Email Code**     | Enter name & email → Request code → Enter code → Auto-login | `POST /api/auth/register-with-code-by-email` → `/login-with-code-by-email` |
| **Phone Code**     | Enter name & phone → Request code → Enter code → Auto-login | `POST /api/auth/register-with-code-by-phone` → `/login-with-code-by-phone` |

---

## 🏗️ Architecture

### Component Structure

Both components follow a **two-step flow** with signals and reactive forms:

```typescript
type LoginMode = 'email-password' | 'email-code' | 'phone-code';
type LoginStep = 'credentials' | 'verification-code';

// Component signals
loginMode = signal<LoginMode>('email-password');
currentStep = signal<LoginStep>('credentials');
```

### Form Fields

**Login Form:**

```typescript
interface ILoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
  phoneNumber: FormControl<string>;
  verificationCode: FormControl<string>; // 6 digits, min/max length validation
}
```

**Register Form:**

```typescript
interface IRegisterForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  verificationCode: FormControl<string>; // 6 digits, min/max length validation
}
```

---

## 🎨 UI/UX Features

### Mode Selector

- Uses **Zardui Segmented Component** (`z-segmented`)
- Three options with icons (mail, smartphone)
- Visible only on the first step (credentials/registration)

### Conditional Field Visibility

**Login - Email/Password Mode:**

- Email field ✅
- Password field ✅

**Login - Email Code Mode:**

- Email field only ✅

**Login - Phone Code Mode:**

- Phone number field only ✅

**Register - Email/Password Mode:**

- Name fields ✅
- Email field ✅
- Phone field (optional) ✅
- Password fields ✅

**Register - Email Code Mode:**

- Name fields ✅
- Email field ✅

**Register - Phone Code Mode:**

- Name fields ✅
- Phone field ✅

### Dynamic Submit Button Text

The button text changes based on mode and step:

**Login:**

- Step 1: "Login", "Send Code" (Email), "Send Code" (Phone)
- Step 2: "Verify & Login"

**Register:**

- Step 1: "Create Account", "Send Code" (Email), "Send Code" (Phone)
- Step 2: "Verify & Register"

---

## 🔄 Authentication Flows

### Email/Password Login

```typescript
1. User selects "Email/Password" mode
2. User enters email and password
3. User clicks "Login"
4. Component calls: authService.login({ email, password })
5. On success: Navigate to dashboard
```

### Email Code Login

```typescript
1. User selects "Email Code" mode
2. User enters email
3. User clicks "Send Code"
4. Component calls: authService.getVerificationCodeByEmail(email)
5. Server sends email with 6-digit code
   - In development: code returned in response.code
   - In production: code sent via email only
6. UI transitions to step 2 (verification-code)
7. User enters 6-digit code
8. User clicks "Verify & Login"
9. Component calls: authService.loginWithCodeByEmail(email, code)
10. On success: Navigate to dashboard
```

### Phone Code Login

```typescript
1. User selects "Phone Code" mode
2. User enters phone number
3. User clicks "Send Code"
4. Component calls: authService.getVerificationCodeByPhone(phoneNumber)
5. Server sends SMS with 6-digit code
   - In development: code returned in response.code
   - In production: code sent via SMS only
6. UI transitions to step 2 (verification-code)
7. User enters 6-digit code
8. User clicks "Verify & Login"
9. Component calls: authService.loginWithCodeByPhone(phoneNumber, code)
10. On success: Navigate to dashboard
```

### Email Code Registration

```typescript
1. User selects "Email Code" mode
2. User enters firstName, lastName, email
3. User clicks "Send Code"
4. Component calls: authService.registerWithCodeByEmail(email, firstName, lastName)
5. Server creates user and sends email with 6-digit code
   - In development: code returned in response.code
   - In production: code sent via email only
6. UI transitions to step 2 (verification-code)
7. User enters 6-digit code
8. User clicks "Verify & Register"
9. Component calls: authService.loginWithCodeByEmail(email, code)
   - Note: Uses login endpoint, not register (user already exists)
10. On success: Navigate to dashboard
```

### Phone Code Registration

```typescript
1. User selects "Phone Code" mode
2. User enters firstName, lastName, phoneNumber
3. User clicks "Send Code"
4. Component calls: authService.registerWithCodeByPhone(phoneNumber, firstName, lastName)
5. Server creates user and sends SMS with 6-digit code
   - In development: code returned in response.code
   - In production: code sent via SMS only
6. UI transitions to step 2 (verification-code)
7. User enters 6-digit code
8. User clicks "Verify & Register"
9. Component calls: authService.loginWithCodeByPhone(phoneNumber, code)
10. On success: Navigate to dashboard
```

---

## 💻 Code Examples

### Login Component Usage

```html
<app-login
  [showForgotPassword]="true"
  [showCreateAccount]="true"
  [redirectAfterLogin]="'/dashboard'"
/>
```

### Register Component Usage

```html
<app-register [showLoginLink]="true" [redirectAfterRegister]="'/dashboard'" />
```

### Handling Development Mode Codes with Toast

```typescript
import { toast } from 'ngx-sonner';

this._authService.getVerificationCodeByEmail(email).subscribe({
  next: (response) => {
    if (response.code) {
      // Development mode - show code to user
      toast.success('Verification Code', {
        description: `Your code is: ${response.code}`,
        duration: 10000,
      });
    } else {
      // Production mode
      toast.success('Code Sent', {
        description: 'Check your email for the verification code',
      });
    }

    this.currentStep.set('verification-code');
    this.isLoading.set(false);
  },
  error: (err) => {
    this.errorMessage.set(err.message || 'Failed to send verification code');
    this.isLoading.set(false);
  },
});
```

---

## 🎨 Zardui Component Usage

### Segmented Control (Mode Selector)

```html
<z-segmented
  [zDefaultValue]="loginMode()"
  (zChange)="onLoginModeChange($any($event))"
>
  <z-segmented-item value="email-password" label="Email/Password">
    <z-icon zType="mail" />
    Email/Password
  </z-segmented-item>
  <z-segmented-item value="email-code" label="Email Code">
    <z-icon zType="mail" />
    Email Code
  </z-segmented-item>
  <z-segmented-item value="phone-code" label="Phone Code">
    <z-icon zType="smartphone" />
    Phone Code
  </z-segmented-item>
</z-segmented>
```

**Key Points:**

- Use `[zDefaultValue]` for initial value (NOT `[value]`)
- Use `(zChange)` event (NOT `(valueChange)`)
- Both `value` and `label` inputs are **required** on `z-segmented-item`

---

## 🔐 Security Considerations

### Development vs Production

| Feature              | Development              | Production                     |
| -------------------- | ------------------------ | ------------------------------ |
| Code in API response | ✅ Yes (`response.code`) | ❌ No (`response.code = null`) |
| Code delivery        | Response + Email/SMS     | Email/SMS only                 |
| Toast notification   | Shows actual code        | Shows "Code sent" message      |
| Debugging            | Easy - code visible      | Secure - code hidden           |

### Validation

- Email format validation using `Validators.email`
- Phone number required validation
- Verification code: **exactly 6 digits** (`minLength(6)` and `maxLength(6)`)
- Password minimum 6 characters
- Confirm password must match password

---

## 🧪 Testing

### Development Mode Testing

**Login with Email Code:**

```typescript
// 1. Request code
authService
  .getVerificationCodeByEmail('test@example.com')
  .subscribe((response) => {
    console.log('Code:', response.code); // e.g., "123456"
  });

// 2. Login with code (use code from response or enter manually)
authService
  .loginWithCodeByEmail('test@example.com', '123456')
  .subscribe((response) => {
    console.log('Logged in:', response);
  });
```

**Register with Phone Code:**

```typescript
// 1. Register and get code
authService
  .registerWithCodeByPhone('+1234567890', 'John', 'Doe')
  .subscribe((response) => {
    console.log('Code:', response.code); // e.g., "654321"
  });

// 2. Login with code
authService
  .loginWithCodeByPhone('+1234567890', '654321')
  .subscribe((response) => {
    console.log('Logged in:', response);
  });
```

---

## 📋 Verification Code Specifications

- **Length:** 6 digits
- **Format:** Numeric string (e.g., "123456")
- **Expiration:** Set by backend (typically 5-15 minutes)
- **Delivery Methods:**
  - Email: Sent via configured email service
  - SMS: Sent via configured SMS provider
  - Development: Included in API response (`response.code`)

---

## 🔗 Related Documentation

- [IDENTITY_MODULE_GUIDE.md](./IDENTITY_MODULE_GUIDE.md) - Complete Identity module documentation
- [VERIFICATION_CODE_DEVELOPMENT_MODE_UPDATE.md](../../MicroservicesArchitecture/Doc/VERIFICATION_CODE_DEVELOPMENT_MODE_UPDATE.md) - Backend implementation details
- [ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md) - Zardui component usage guide
- [COMPONENT_USAGE_GUIDE.md](./COMPONENT_USAGE_GUIDE.md) - General component patterns

---

## 🐛 Troubleshooting

### Issue: Verification code not received

**Development Mode:**

- Check `response.code` in the API response
- Check browser console for the code
- Look for toast notification with the code

**Production Mode:**

- Verify email/phone number is correct
- Check spam folder for emails
- Confirm SMS provider is configured
- Check backend logs for delivery errors

### Issue: "Invalid verification code" error

- Ensure code is exactly 6 digits
- Check if code has expired (typically 5-15 minutes)
- Verify correct email/phone was used
- In development, use code from API response

### Issue: Mode selector not working

- Verify `z-segmented-item` has both `value` and `label` inputs
- Check `(zChange)` event is bound correctly (not `(valueChange)`)
- Ensure `[zDefaultValue]` is used (not `[value]`)

---

**Version:** 1.0  
**Author:** Development Team  
**Last Updated:** January 26, 2026
