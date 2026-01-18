# Identity Module Usage Guide

**Location:** `libs/core/src/lib/identity/`

**Last Updated:** January 18, 2026

---

## 📖 Overview

The Identity module provides comprehensive authentication, authorization, and user management functionality for Angular applications. It follows the project's core principles: **signals-only** (no decorators), **dependency injection via `inject()`**, and **minimal code**.

### Key Features

- ✅ JWT-based authentication with refresh token support
- ✅ Multi-factor authentication (Email & SMS verification codes)
- ✅ Role-based access control (RBAC)
- ✅ Dynamic claims management
- ✅ Device token management for push notifications
- ✅ Functional guards (`authGuard`, `roleGuard`)
- ✅ HTTP interceptor for automatic token attachment
- ✅ Profile management
- ✅ Admin user management

---

## 🏗️ Architecture

### Module Structure

```
libs/core/src/lib/identity/
├── auth.service.ts           # Authentication & verification codes
├── user.service.ts           # User profile operations
├── admin.service.ts          # Admin user CRUD operations
├── role.service.ts           # Role & role-user assignment
├── claim.service.ts          # Claim CRUD operations
├── device-token.service.ts   # Device token management
├── token.interceptor.ts      # Auto-attach JWT to requests
├── auth.guard.ts             # Route protection (authenticated users)
├── role.guard.ts             # Route protection (role-based)
├── profile.resolver.ts       # Pre-load user profile
├── models.ts                 # Interfaces & Classes
└── index.ts                  # Public exports
```

---

## 🚀 Quick Start

### 1. Import Services

```typescript
import { inject } from '@angular/core';
import {
  AuthService,
  IdentityUserService,
  RoleService,
} from '@ihsan/core/identity';

export class MyComponent {
  private _authService = inject(AuthService);
  private _userService = inject(IdentityUserService);
  private _roleService = inject(RoleService);
}
```

### 2. Setup HTTP Interceptor

**In `app.config.ts`:**

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from '@ihsan/core/identity';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([tokenInterceptor]))],
};
```

### 3. Protect Routes

**Authentication Guard:**

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@ihsan/core/identity';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard], // Requires login
  },
];
```

**Role Guard:**

```typescript
import { roleGuard } from '@ihsan/core/identity';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'SuperAdmin'] }, // Requires Admin or SuperAdmin role
  },
];
```

---

## 📚 Services Reference

### AuthService

**Purpose:** Handles authentication, registration, logout, and verification codes.

#### Properties

| Property      | Type                        | Description                              |
| ------------- | --------------------------- | ---------------------------------------- |
| `currentUser` | `Signal<UserClass \| null>` | Current logged-in user (reactive signal) |

#### Core Methods

##### Standard Authentication

```typescript
// Login with email/password
login(request: ILoginRequest): Observable<IAuthResponse>

// Register new user
register(request: IRegisterRequest): Observable<IAuthResponse>

// Refresh access token
refreshToken(request: IRefreshTokenRequest): Observable<IAuthResponse>

// Logout (clears tokens)
logout(): Observable<object>

// Request password reset
forgotPassword(request: IForgotPasswordRequest): Observable<object>
```

##### Verification Code Flow

```typescript
// Request verification code via SMS
getVerificationCodeByPhone(phoneNumber: string): Observable<object>

// Request verification code via Email
getVerificationCodeByEmail(email: string): Observable<object>

// Login with verification code (SMS)
loginWithCodeByPhone(phoneNumber: string, code: string): Observable<IAuthResponse>

// Login with verification code (Email)
loginWithCodeByEmail(email: string, code: string): Observable<IAuthResponse>

// Register with verification code (SMS)
registerWithCodeByPhone(
  phoneNumber: string,
  code: string,
  firstName: string,
  lastName: string
): Observable<IAuthResponse>

// Register with verification code (Email)
registerWithCodeByEmail(
  email: string,
  code: string,
  firstName: string,
  lastName: string
): Observable<IAuthResponse>
```

##### Token Management

```typescript
// Get current JWT token
getToken(): string | null

// Get refresh token
getRefreshToken(): string | null
```

#### Usage Example

```typescript
import { Component, inject } from '@angular/core';
import { AuthService, ILoginRequest } from '@ihsan/core/identity';

export class LoginComponent {
  private _authService = inject(AuthService);

  async onLogin(email: string, password: string) {
    const request: ILoginRequest = { email, password };

    this._authService.login(request).subscribe({
      next: (response) => {
        console.log('Logged in:', this._authService.currentUser());
        // Navigate to dashboard
      },
      error: (err) => console.error('Login failed:', err),
    });
  }

  async onPhoneLogin(phoneNumber: string) {
    // Step 1: Request verification code
    this._authService.getVerificationCodeByPhone(phoneNumber).subscribe({
      next: () => console.log('Code sent to phone'),
    });

    // Step 2: User enters code, then login
    const code = '123456'; // From user input
    this._authService.loginWithCodeByPhone(phoneNumber, code).subscribe({
      next: (response) => console.log('Logged in via SMS'),
    });
  }
}
```

---

### IdentityUserService

**Purpose:** Manage current user's profile.

#### Methods

```typescript
// Get current user profile
getProfile(): Observable<IUser>

// Update current user profile
updateProfile(request: IUpdateProfileRequest): Observable<object>

// Delete current user account
deleteAccount(): Observable<object>
```

#### Usage Example

```typescript
import { Component, inject } from '@angular/core';
import {
  IdentityUserService,
  IUpdateProfileRequest,
} from '@ihsan/core/identity';

export class ProfileComponent {
  private _userService = inject(IdentityUserService);

  loadProfile() {
    this._userService.getProfile().subscribe({
      next: (user) => console.log('User:', user),
    });
  }

  updateProfile(firstName: string, lastName: string, phoneNumber: string) {
    const request: IUpdateProfileRequest = { firstName, lastName, phoneNumber };

    this._userService.updateProfile(request).subscribe({
      next: () => console.log('Profile updated'),
    });
  }
}
```

---

### IdentityAdminService

**Purpose:** Admin operations for user management (CRUD).

#### Methods

```typescript
// Get paginated users list
getUsers(): Observable<IPaginatedResponse<IUser>>

// Get user by ID
getUserById(id: number): Observable<IUser>

// Create new user (admin)
createUser(request: ICreateUserRequest): Observable<object>

// Update user (admin)
updateUser(id: number, request: IUpdateUserRequest): Observable<object>

// Toggle user active/inactive status
toggleUserStatus(id: number): Observable<object>

// Delete user (soft delete)
deleteUser(id: number): Observable<object>
```

#### Usage Example

```typescript
import { Component, inject, signal } from '@angular/core';
import {
  IdentityAdminService,
  IUser,
  ICreateUserRequest,
} from '@ihsan/core/identity';

export class UsersManagementComponent {
  private _adminService = inject(IdentityAdminService);
  users = signal<IUser[]>([]);

  loadUsers() {
    this._adminService.getUsers().subscribe({
      next: (response) => this.users.set(response.items),
    });
  }

  createUser(email: string, firstName: string, lastName: string, role: string) {
    const request: ICreateUserRequest = {
      email,
      firstName,
      lastName,
      role,
      isActive: true,
    };

    this._adminService.createUser(request).subscribe({
      next: () => {
        console.log('User created');
        this.loadUsers(); // Reload list
      },
    });
  }

  toggleStatus(userId: number) {
    this._adminService.toggleUserStatus(userId).subscribe({
      next: () => this.loadUsers(),
    });
  }
}
```

---

### RoleService

**Purpose:** Manage roles and assign roles/claims.

#### Methods

```typescript
// Get all roles
getAllRoles(): Observable<IRole[]>

// Get role by ID
getRoleById(id: number): Observable<IRole>

// Create new role
createRole(request: ICreateRoleRequest): Observable<object>

// Update role
updateRole(id: number, request: IUpdateRoleRequest): Observable<object>

// Delete role
deleteRole(id: number): Observable<object>

// Assign claims to role
assignClaimsToRole(roleId: number, request: IAssignClaimsToRoleRequest): Observable<object>

// Assign roles to user
assignRolesToUser(userId: number, request: IAssignRolesToUserRequest): Observable<object>
```

#### Usage Example

```typescript
import { Component, inject, signal } from '@angular/core';
import { RoleService, IRole, ICreateRoleRequest } from '@ihsan/core/identity';

export class RolesManagementComponent {
  private _roleService = inject(RoleService);
  roles = signal<IRole[]>([]);

  loadRoles() {
    this._roleService.getAllRoles().subscribe({
      next: (roles) => this.roles.set(roles),
    });
  }

  createRole(name: string, description: string) {
    const request: ICreateRoleRequest = { name, description };

    this._roleService.createRole(request).subscribe({
      next: () => this.loadRoles(),
    });
  }

  assignRolesToUser(userId: number, roleIds: number[]) {
    this._roleService.assignRolesToUser(userId, { roleIds }).subscribe({
      next: () => console.log('Roles assigned'),
    });
  }
}
```

---

### ClaimService

**Purpose:** Manage claims (permissions) for fine-grained authorization.

#### Methods

```typescript
// Get all claims
getAllClaims(): Observable<IClaim[]>

// Get claim by ID
getClaimById(id: number): Observable<IClaim>

// Create new claim
createClaim(request: ICreateClaimRequest): Observable<object>

// Update claim
updateClaim(id: number, request: IUpdateClaimRequest): Observable<object>

// Delete claim
deleteClaim(id: number): Observable<object>
```

#### Usage Example

```typescript
import { Component, inject } from '@angular/core';
import { ClaimService, ICreateClaimRequest } from '@ihsan/core/identity';

export class ClaimsManagementComponent {
  private _claimService = inject(ClaimService);

  createClaim(name: string, claimType: string, claimValue: string) {
    const request: ICreateClaimRequest = {
      name,
      claimType,
      claimValue,
      isSuperAdminOnly: false,
    };

    this._claimService.createClaim(request).subscribe({
      next: () => console.log('Claim created'),
    });
  }
}
```

---

### DeviceTokenService

**Purpose:** Manage device tokens for push notifications (Firebase/FCM integration).

#### Methods

```typescript
// Add device token
addDeviceToken(request: IAddDeviceTokenRequest): Observable<object>

// Get device token by ID
getDeviceTokenById(id: number): Observable<IDeviceToken>

// Get all tokens for a user
getUserDeviceTokens(userId: number): Observable<IDeviceToken[]>

// Get user tokens by platform (iOS/Android/Web)
getUserDeviceTokensByPlatform(userId: number, platform: string): Observable<IDeviceToken[]>

// Update device token
updateDeviceToken(id: number, request: IUpdateDeviceTokenRequest): Observable<object>

// Delete specific token
deleteDeviceToken(id: number): Observable<object>

// Delete all tokens for a user
deleteAllUserDeviceTokens(userId: number): Observable<object>

// Batch operations
getBatchDeviceTokens(request: IGetBatchDeviceTokensRequest): Observable<IDeviceToken[]>
deleteBatchDeviceTokens(request: IDeleteBatchDeviceTokensRequest): Observable<object>

// Get all tokens in current tenant
getTenantDeviceTokens(): Observable<IDeviceToken[]>
```

#### Usage Example

```typescript
import { Component, inject } from '@angular/core';
import {
  DeviceTokenService,
  IAddDeviceTokenRequest,
} from '@ihsan/core/identity';

export class DeviceTokenComponent {
  private _deviceTokenService = inject(DeviceTokenService);

  registerDevice(token: string, platform: string, deviceId: string) {
    const request: IAddDeviceTokenRequest = { token, platform, deviceId };

    this._deviceTokenService.addDeviceToken(request).subscribe({
      next: () => console.log('Device registered'),
    });
  }

  getUserTokens(userId: number) {
    this._deviceTokenService.getUserDeviceTokens(userId).subscribe({
      next: (tokens) => console.log('User tokens:', tokens),
    });
  }
}
```

---

## 🛡️ Guards

### authGuard

**Purpose:** Protect routes requiring authentication.

**Behavior:**

- ✅ Allows access if JWT token exists
- ❌ Redirects to `/login` with `returnUrl` query param if no token

**Usage:**

```typescript
import { authGuard } from '@ihsan/core/identity';

const routes: Routes = [
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
];
```

---

### roleGuard

**Purpose:** Protect routes requiring specific roles.

**Behavior:**

- ✅ Allows access if user has one of the required roles
- ❌ Redirects to `/login` if not authenticated
- ❌ Redirects to `/` if authenticated but unauthorized

**Usage:**

```typescript
import { roleGuard } from '@ihsan/core/identity';

const routes: Routes = [
  {
    path: 'admin-panel',
    component: AdminPanelComponent,
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'SuperAdmin'] }, // Required roles
  },
];
```

---

## 🔄 Resolvers

### profileResolver

**Purpose:** Pre-load user profile before route activation.

**Usage:**

```typescript
import { profileResolver } from '@ihsan/core/identity';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    resolve: { profile: profileResolver }, // Pre-loads profile
  },
];
```

**In Component:**

```typescript
import { Component, input } from '@angular/core';
import { IUser } from '@ihsan/core/identity';

export class DashboardComponent {
  profile = input.required<IUser>(); // Resolved data

  ngOnInit() {
    console.log('Profile:', this.profile());
  }
}
```

---

## 🔌 HTTP Interceptor

### tokenInterceptor

**Purpose:** Automatically attach JWT token to all HTTP requests.

**Setup:**

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from '@ihsan/core/identity';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([tokenInterceptor]))],
};
```

**Behavior:**

- Reads token from `AuthService.getToken()`
- Adds `Authorization: Bearer <token>` header to all requests
- No manual token management needed

---

## 📦 Models Reference

### Core Entities

#### IUser / UserClass

```typescript
export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: number; // Numeric role (1=User, 2=Admin, 3=SuperAdmin)
  roleName: string; // String role name
  status: boolean; // Active/Inactive
  isActive?: boolean; // Computed property (frontend)
  emailConfirmed: boolean;
  phoneNumberConfirmed?: boolean;
  created: string; // ISO 8601 UTC format
  lastLogin?: string | null;
  profilePictureId?: number | null;
  profilePicture?: IFileManagerResponse | null;
  isArchived: boolean;
  createdBy?: string | null;
  lastModified?: string;
  lastModifiedBy?: string | null;
}
```

#### IRole / RoleClass

```typescript
export interface IRole {
  id: number;
  name: string;
  description?: string;
  created: string;
  isArchived: boolean;
  createdBy?: string | null;
  lastModified?: string;
  lastModifiedBy?: string | null;
}
```

#### IClaim / ClaimClass

```typescript
export interface IClaim {
  id: number;
  name: string;
  claimType: string;
  claimValue: string;
  description?: string;
  isSuperAdminOnly: boolean;
  created: string;
  isArchived: boolean;
  createdBy?: string | null;
  lastModified?: string;
  lastModifiedBy?: string | null;
}
```

#### IDeviceToken / DeviceTokenClass

```typescript
export interface IDeviceToken {
  id: number;
  userId: number;
  token: string;
  platform: string; // "iOS", "Android", "Web"
  deviceId: string;
  created: string;
  isArchived: boolean;
  createdBy?: string | null;
  lastModified?: string;
  lastModifiedBy?: string | null;
}
```

### Request Models

```typescript
// Authentication
export interface ILoginRequest {
  email: string;
  password?: string;
}

export interface IRegisterRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface IRefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

// User Management
export interface IUpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface ICreateUserRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive?: boolean;
}

export interface IUpdateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

// Role Management
export interface ICreateRoleRequest {
  name: string;
  description?: string;
}

export interface IUpdateRoleRequest {
  name: string;
  description?: string;
}

export interface IAssignClaimsToRoleRequest {
  claimIds: number[];
}

export interface IAssignRolesToUserRequest {
  roleIds: number[];
}

// Claim Management
export interface ICreateClaimRequest {
  name: string;
  claimType: string;
  claimValue: string;
  description?: string;
  isSuperAdminOnly?: boolean;
}

export interface IUpdateClaimRequest {
  name: string;
  claimType: string;
  claimValue: string;
  description?: string;
  isSuperAdminOnly?: boolean;
}

// Device Tokens
export interface IAddDeviceTokenRequest {
  token: string;
  platform: string;
  deviceId: string;
}

export interface IUpdateDeviceTokenRequest {
  token: string;
  platform: string;
  deviceId: string;
}

export interface IGetBatchDeviceTokensRequest {
  userIds: number[];
}

export interface IDeleteBatchDeviceTokensRequest {
  tokenIds: number[];
}
```

### Response Models

```typescript
export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiryTime: string; // ISO 8601 UTC format
  user: IUser;
}

export interface IPaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
```

---

## 🎯 Common Patterns

### Pattern 1: Login & Display Current User

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '@ihsan/core/identity';

export class LoginComponent {
  private _authService = inject(AuthService);

  // Access current user as signal
  currentUser = this._authService.currentUser;

  onLogin(email: string, password: string) {
    this._authService.login({ email, password }).subscribe({
      next: () => {
        console.log('Logged in as:', this.currentUser()?.firstName);
      },
    });
  }
}
```

**Template:**

```html
@if (currentUser(); as user) {
<p>Welcome, {{ user.firstName }} {{ user.lastName }}</p>
} @else {
<p>Please log in</p>
}
```

---

### Pattern 2: SMS/Email Verification Flow

```typescript
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@ihsan/core/identity';

export class PhoneLoginComponent {
  private _authService = inject(AuthService);
  step = signal<'phone' | 'code'>('phone');
  phoneNumber = signal('');

  requestCode(phone: string) {
    this.phoneNumber.set(phone);
    this._authService.getVerificationCodeByPhone(phone).subscribe({
      next: () => this.step.set('code'),
    });
  }

  verifyCode(code: string) {
    this._authService.loginWithCodeByPhone(this.phoneNumber(), code).subscribe({
      next: () => console.log('Logged in!'),
    });
  }
}
```

---

### Pattern 3: Role-Based UI Rendering

```typescript
import { Component, inject, computed } from '@angular/core';
import { AuthService } from '@ihsan/core/identity';

export class NavbarComponent {
  private _authService = inject(AuthService);
  currentUser = this._authService.currentUser;

  isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.roleName === 'Admin' || user?.roleName === 'SuperAdmin';
  });
}
```

**Template:**

```html
@if (isAdmin()) {
<a routerLink="/admin">Admin Panel</a>
}
```

---

### Pattern 4: Admin User Management Table

```typescript
import { Component, inject, signal } from '@angular/core';
import { IdentityAdminService, IUser } from '@ihsan/core/identity';

export class UsersTableComponent {
  private _adminService = inject(IdentityAdminService);
  users = signal<IUser[]>([]);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this._adminService.getUsers().subscribe({
      next: (response) => this.users.set(response.items),
    });
  }

  toggleUserStatus(userId: number) {
    this._adminService.toggleUserStatus(userId).subscribe({
      next: () => this.loadUsers(),
    });
  }

  deleteUser(userId: number) {
    this._adminService.deleteUser(userId).subscribe({
      next: () => this.loadUsers(),
    });
  }
}
```

---

## ⚠️ Best Practices

### ✅ DO

- **Use signals for reactive state:** Access `currentUser` as a signal: `authService.currentUser()`
- **Handle errors:** Always provide error callbacks in `.subscribe()`
- **Use functional guards:** Prefer `authGuard` and `roleGuard` over class-based guards
- **Leverage interceptor:** Let `tokenInterceptor` handle token attachment automatically
- **Type requests:** Use `ILoginRequest`, `ICreateUserRequest`, etc. for type safety
- **Use `inject()`:** Always inject services with `inject()` function, not constructor injection
- **Unique IDs:** All interactive elements need unique `id` attributes

### ❌ DON'T

- **Don't use decorators:** ❌ No `@Input()`, `@Output()`, use `input()` and `output()` signals
- **Don't manually add tokens:** ❌ Token interceptor handles this automatically
- **Don't store sensitive data:** ❌ Never store passwords or unencrypted data in localStorage
- **Don't bypass guards:** ❌ Always use `authGuard` or `roleGuard` for protected routes
- **Don't hardcode roles:** ❌ Use `data: { roles: [...] }` in route configuration

---

## 🔐 Security Considerations

1. **Token Storage:** Tokens are stored in `localStorage`. For production, consider using `HttpOnly` cookies for enhanced security.
2. **HTTPS Only:** Always use HTTPS in production to prevent token interception.
3. **Token Expiry:** Implement automatic token refresh logic using `refreshToken()` method.
4. **Role Validation:** Backend MUST validate roles/claims - never rely on frontend validation alone.
5. **Device Tokens:** Protect device token endpoints - only authenticated users should manage their own tokens.

---

## 🔄 Integration with Backend

### API Base URL Configuration

**Location:** `libs/core/src/lib/core/environment.token.ts`

```typescript
export interface Environment {
  apiUrls: {
    identity: string; // Example: 'https://localhost:5001'
  };
}
```

### Expected Backend Endpoints

| Endpoint                                   | Method | Description                 |
| ------------------------------------------ | ------ | --------------------------- |
| `/api/auth/login`                          | POST   | Login with email/password   |
| `/api/auth/register`                       | POST   | Register new user           |
| `/api/auth/refresh`                        | POST   | Refresh access token        |
| `/api/auth/logout`                         | POST   | Logout user                 |
| `/api/auth/forgot-password`                | POST   | Request password reset      |
| `/api/auth/get-verification-code-by-phone` | POST   | Request SMS code            |
| `/api/auth/get-verification-code-by-email` | POST   | Request email code          |
| `/api/auth/login-with-code-by-phone`       | POST   | Login with SMS code         |
| `/api/auth/login-with-code-by-email`       | POST   | Login with email code       |
| `/api/auth/register-with-code-by-phone`    | POST   | Register with SMS code      |
| `/api/auth/register-with-code-by-email`    | POST   | Register with email code    |
| `/api/user/profile`                        | GET    | Get current user profile    |
| `/api/user/profile`                        | PUT    | Update current user profile |
| `/api/user/me`                             | DELETE | Delete current user account |
| `/api/admin/users`                         | GET    | Get all users (paginated)   |
| `/api/admin/users/{id}`                    | GET    | Get user by ID              |
| `/api/admin/users`                         | POST   | Create user                 |
| `/api/admin/users/{id}`                    | PUT    | Update user                 |
| `/api/admin/users/{id}/toggle-status`      | PATCH  | Toggle user status          |
| `/api/admin/users/{id}`                    | DELETE | Delete user                 |
| `/api/admin/roles`                         | GET    | Get all roles               |
| `/api/admin/roles/{id}`                    | GET    | Get role by ID              |
| `/api/admin/roles`                         | POST   | Create role                 |
| `/api/admin/roles/{id}`                    | PUT    | Update role                 |
| `/api/admin/roles/{id}`                    | DELETE | Delete role                 |
| `/api/admin/roles/{roleId}/claims`         | POST   | Assign claims to role       |
| `/api/admin/users/{userId}/roles`          | POST   | Assign roles to user        |
| `/api/admin/claims`                        | GET    | Get all claims              |
| `/api/admin/claims/{id}`                   | GET    | Get claim by ID             |
| `/api/admin/claims`                        | POST   | Create claim                |
| `/api/admin/claims/{id}`                   | PUT    | Update claim                |
| `/api/admin/claims/{id}`                   | DELETE | Delete claim                |
| `/api/devicetokens`                        | POST   | Add device token            |
| `/api/devicetokens/{id}`                   | GET    | Get device token            |
| `/api/devicetokens/user/{userId}`          | GET    | Get user tokens             |
| `/api/devicetokens/user/{userId}/platform` | GET    | Get user tokens by platform |
| `/api/devicetokens/{id}`                   | PUT    | Update device token         |
| `/api/devicetokens/{id}`                   | DELETE | Delete device token         |
| `/api/devicetokens/user/{userId}`          | DELETE | Delete all user tokens      |
| `/api/devicetokens/batch`                  | POST   | Get batch tokens            |
| `/api/devicetokens/batch`                  | DELETE | Delete batch tokens         |
| `/api/devicetokens/tenant`                 | GET    | Get tenant tokens           |

---

## 🧪 Testing

**IMPORTANT:** This project has **NO testing infrastructure**. Do NOT create `.spec.ts` files.

For manual testing, use Postman or the running application.

---

## 📝 Related Documentation

- [COMPONENT_USAGE_GUIDE.md](./COMPONENT_USAGE_GUIDE.md) - General component patterns
- Backend: `MicroservicesArchitecture/Doc/SHARED_IDENTITY_SERVICE_GUIDE.md` - Backend API documentation

---

## 🔄 Changelog

| Date         | Version | Changes                       |
| ------------ | ------- | ----------------------------- |
| Jan 18, 2026 | 1.0     | Initial documentation created |

---

**Need Help?** Refer to the instruction files:

- `.github/instructions/Angular.instructions.md` - Angular coding standards
- `.github/copilot-instructions.md` - Project overview
