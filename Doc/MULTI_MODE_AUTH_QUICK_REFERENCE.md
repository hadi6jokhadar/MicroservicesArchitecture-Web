# Multi-Mode Authentication Quick Reference

**Last Updated:** January 26, 2026

---

## 🚀 Quick Start

### Login Component

```html
<app-login
  [showForgotPassword]="true"
  [showCreateAccount]="true"
  [redirectAfterLogin]="'/dashboard'"
/>
```

### Register Component

```html
<app-register [showLoginLink]="true" [redirectAfterRegister]="'/dashboard'" />
```

---

## 🔑 Authentication Methods

### 1. Email/Password

**User Flow:**

1. Select "Email/Password" mode
2. Enter email and password
3. Click "Login" or "Create Account"

**API Endpoint:**

- Login: `POST /api/auth/login`
- Register: `POST /api/auth/register`

---

### 2. Email Code (Passwordless)

**User Flow:**

1. Select "Email Code" mode
2. Enter email (+ name for registration)
3. Click "Send Code"
4. Enter 6-digit code from email
5. Click "Verify & Login"

**API Endpoints:**

- Get Code: `POST /api/auth/get-verification-code-by-email`
- Login: `POST /api/auth/login-with-code-by-email`
- Register: `POST /api/auth/register-with-code-by-email` → `/login-with-code-by-email`

---

### 3. Phone Code (Passwordless)

**User Flow:**

1. Select "Phone Code" mode
2. Enter phone (+ name for registration)
3. Click "Send Code"
4. Enter 6-digit code from SMS
5. Click "Verify & Login"

**API Endpoints:**

- Get Code: `POST /api/auth/get-verification-code-by-phone`
- Login: `POST /api/auth/login-with-code-by-phone`
- Register: `POST /api/auth/register-with-code-by-phone` → `/login-with-code-by-phone`

---

## 📋 Verification Code Specs

| Property       | Value                                |
| -------------- | ------------------------------------ |
| **Length**     | 6 digits                             |
| **Format**     | Numeric string (e.g., "123456")      |
| **Validation** | `minLength(6)` and `maxLength(6)`    |
| **Input**      | `maxlength="6"`, `type="text"`       |
| **Expiration** | 5-15 minutes (configured in backend) |

---

## 🛠️ Development Mode

### Code Exposure

**Development:**

```json
{
  "success": true,
  "code": "123456",
  "message": "Code sent"
}
```

**Production:**

```json
{
  "success": true,
  "code": null,
  "message": "Code sent"
}
```

### Display Code with Toast

```typescript
import { toast } from 'ngx-sonner';

this._authService.getVerificationCodeByEmail(email).subscribe({
  next: (response) => {
    if (response.code) {
      // Development - show code
      toast.success('Verification Code', {
        description: `Your code: ${response.code}`,
        duration: 10000,
      });
    } else {
      // Production
      toast.success('Code Sent', {
        description: 'Check your email',
      });
    }
  },
});
```

---

## 🎨 Component Signals

```typescript
// Mode selection
loginMode = signal<'email-password' | 'email-code' | 'phone-code'>(
  'email-password'
);

// Step tracking
currentStep = signal<'credentials' | 'verification-code'>('credentials');

// Loading state
isLoading = signal(false);
```

---

## 📝 Form Validation

### Verification Code

```typescript
verificationCode: new FormControl<string>('', {
  nonNullable: true,
  validators: [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6)
  ],
}),
```

### Error Display

```html
@if (verificationCodeControl?.hasError('required') &&
verificationCodeControl?.touched) {
<span z-form-error>Verification code is required</span>
} @if (verificationCodeControl?.hasError('minlength') &&
verificationCodeControl?.touched) {
<span z-form-error>Code must be 6 digits</span>
}
```

---

## 🎯 Mode Selector (Zardui)

### Correct Usage ✅

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

### Common Mistakes ❌

```html
<!-- ❌ WRONG - Don't use [value] -->
<z-segmented [value]="loginMode()">
  <!-- ❌ WRONG - Don't use (valueChange) -->
  <z-segmented (valueChange)="onChange($event)">
    <!-- ❌ WRONG - Missing 'label' input -->
    <z-segmented-item value="email">Email</z-segmented-item>

    <!-- ✅ CORRECT -->
    <z-segmented [zDefaultValue]="loginMode()" (zChange)="onChange($event)">
      <z-segmented-item value="email" label="Email"
        >Email</z-segmented-item
      ></z-segmented
    ></z-segmented
  ></z-segmented
>
```

---

## 🔐 AuthService Methods

### Get Verification Code

```typescript
// Email
getVerificationCodeByEmail(email: string): Observable<IVerificationCodeResponse>

// Phone
getVerificationCodeByPhone(phoneNumber: string): Observable<IVerificationCodeResponse>
```

### Login with Code

```typescript
// Email
loginWithCodeByEmail(email: string, code: string): Observable<IAuthResponse>

// Phone
loginWithCodeByPhone(phoneNumber: string, code: string): Observable<IAuthResponse>
```

### Register with Code

```typescript
// Email
registerWithCodeByEmail(
  email: string,
  firstName: string,
  lastName: string,
  data?: string
): Observable<IVerificationCodeResponse>

// Phone
registerWithCodeByPhone(
  phoneNumber: string,
  firstName: string,
  lastName: string,
  data?: string
): Observable<IVerificationCodeResponse>
```

---

## 🧪 Testing in Development

### Login with Email Code

```typescript
// Step 1: Get code
this._authService
  .getVerificationCodeByEmail('test@example.com')
  .subscribe((response) => {
    console.log('Code:', response.code); // "123456"
  });

// Step 2: Login
this._authService
  .loginWithCodeByEmail('test@example.com', '123456')
  .subscribe((response) => {
    console.log('Logged in:', response.user);
  });
```

### Register with Phone Code

```typescript
// Step 1: Register
this._authService
  .registerWithCodeByPhone('+1234567890', 'John', 'Doe')
  .subscribe((response) => {
    console.log('Code:', response.code); // "654321"
  });

// Step 2: Login
this._authService
  .loginWithCodeByPhone('+1234567890', '654321')
  .subscribe((response) => {
    console.log('Logged in:', response.user);
  });
```

---

## 📚 Documentation Links

- **Complete Guide:** [MULTI_MODE_AUTHENTICATION_GUIDE.md](./MULTI_MODE_AUTHENTICATION_GUIDE.md)
- **Identity Module:** [IDENTITY_MODULE_GUIDE.md](./IDENTITY_MODULE_GUIDE.md)
- **Backend Details:** [VERIFICATION_CODE_DEVELOPMENT_MODE_UPDATE.md](../../MicroservicesArchitecture/Doc/VERIFICATION_CODE_DEVELOPMENT_MODE_UPDATE.md)
- **Zardui Components:** [ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md)

---

## 🐛 Troubleshooting

### Code not received in development

✅ Check `response.code` in API response  
✅ Look for toast notification  
✅ Check browser console

### "Invalid verification code" error

✅ Ensure code is exactly 6 digits  
✅ Check if code expired (5-15 min)  
✅ Use code from API response in dev mode

### Mode selector not working

✅ Use `[zDefaultValue]` not `[value]`  
✅ Use `(zChange)` not `(valueChange)`  
✅ Add `label` input to all items

---

**Version:** 1.0 | **Date:** January 26, 2026
