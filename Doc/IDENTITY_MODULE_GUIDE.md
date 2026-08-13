# Identity Module Usage Guide

**Location:** `libs/core/src/lib/identity/`

**Last Updated:** August 13, 2026

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
├── identity-storage.service.ts # Single choke point for token/tenant localStorage access
├── token.interceptor.ts      # Auto-attach JWT to requests (reads via IdentityStorageService)
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
} from '@ihsan/core';

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
import { tokenInterceptor } from '@ihsan/core';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([tokenInterceptor]))],
};
```

### 3. Protect Routes

**Authentication Guard:**

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@ihsan/core';

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
import { roleGuard } from '@ihsan/core';

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
logout(): Observable<void>

// Request password reset
forgotPassword(request: IForgotPasswordRequest): Observable<string>
```

##### Verification Code Flow

```typescript
// Request verification code via SMS (returns code in development mode)
getVerificationCodeByPhone(phoneNumber: string): Observable<IVerificationCodeResponse>

// Request verification code via Email (returns code in development mode)
getVerificationCodeByEmail(email: string): Observable<IVerificationCodeResponse>

// Login with verification code (SMS)
loginWithCodeByPhone(phoneNumber: string, code: string): Observable<IAuthResponse>

// Login with verification code (Email)
loginWithCodeByEmail(email: string, code: string): Observable<IAuthResponse>

// Register with verification code (SMS) - generates and returns code in dev mode
registerWithCodeByPhone(
  phoneNumber: string,
  firstName: string,
  lastName: string,
  data?: string
): Observable<IVerificationCodeResponse>

// Register with verification code (Email) - generates and returns code in dev mode
registerWithCodeByEmail(
  email: string,
  firstName: string,
  lastName: string,
  data?: string
): Observable<IVerificationCodeResponse>
```

**IVerificationCodeResponse:**

```typescript
interface IVerificationCodeResponse {
  success: boolean;
  code: string | null; // Only present in development mode
  message?: string;
}
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
import { AuthService, ILoginRequest } from '@ihsan/core';

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
    // Step 1: Request verification code (returns code in development mode)
    this._authService.getVerificationCodeByPhone(phoneNumber).subscribe({
      next: (response) => {
        console.log('Code sent to phone');
        // In development mode, you can access the code:
        if (response.code) {
          console.log('Dev mode - Code:', response.code);
          // Optionally show code to user in development with toast
          // toast.success('Verification Code', { description: response.code });
        } else {
          console.log('Code sent (production mode)');
        }
      },
    });

    // Step 2: User enters code, then login
    const code = '123456'; // 6-digit code from user input (or response.code in dev mode)
    this._authService.loginWithCodeByPhone(phoneNumber, code).subscribe({
      next: (response) => console.log('Logged in via SMS'),
    });
  }

  async onPhoneRegistration(
    phoneNumber: string,
    firstName: string,
    lastName: string
  ) {
    // Step 1: Register user and get verification code (returns code in dev mode)
    this._authService
      .registerWithCodeByPhone(phoneNumber, firstName, lastName)
      .subscribe({
        next: (response) => {
          console.log('Registration successful, code sent');
          // In development mode, code is in response.code
          if (response.code) {
            console.log('Dev mode - Code:', response.code);
            // Optionally show code to user in development with toast
            // toast.success('Verification Code', { description: response.code });
          } else {
            console.log('Code sent (production mode)');
          }
        },
      });

    // Step 2: User enters code, then login
    const code = '123456'; // 6-digit code from user input
    this._authService.loginWithCodeByPhone(phoneNumber, code).subscribe({
      next: (response) => console.log('Logged in after registration'),
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
updateProfile(request: IUpdateProfileRequest): Observable<IUser>

// Delete current user account
deleteAccount(): Observable<boolean>
```

#### Usage Example

```typescript
import { Component, inject } from '@angular/core';
import {
  IdentityUserService,
  IUpdateProfileRequest,
} from '@ihsan/core';

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
// Get paginated/filtered users list (all filter fields optional)
getUsers(request?: IUserFilterRequest): Observable<IPaginatedResponse<IUser>>

// Get user by ID
getUserById(id: number): Observable<IUser>

// Create new user (admin)
createUser(request: ICreateUserRequest, context?: HttpContext): Observable<IUser>

// Update user (admin)
updateUser(id: number, request: IUpdateUserRequest, context?: HttpContext): Observable<IUser>

// Toggle user active/inactive status
toggleUserStatus(id: number): Observable<boolean>

// Toggle user archived status
toggleArchive(id: number): Observable<boolean>

// Delete user (soft delete)
deleteUser(id: number): Observable<boolean>
```

`IUserFilterRequest` (passed to `getUsers`): `{ pageNumber?, pageSize?, searchTerm?, roleName?, status?, isArchived? }`.

#### Usage Example

```typescript
import { Component, inject, signal } from '@angular/core';
import {
  IdentityAdminService,
  IUser,
  ICreateUserRequest,
} from '@ihsan/core';

export class UsersManagementComponent {
  private _adminService = inject(IdentityAdminService);
  users = signal<IUser[]>([]);

  loadUsers() {
    this._adminService.getUsers().subscribe({
      next: (response) => this.users.set(response.items),
    });
  }

  createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    roleIds: number[]
  ) {
    const request: ICreateUserRequest = {
      email,
      password,
      firstName,
      lastName,
      roleIds,
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

  toggleArchive(userId: number) {
    this._adminService.toggleArchive(userId).subscribe({
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
// Get all roles — cached in-memory after the first call; pass true to bypass the cache
getAllRoles(forceRefresh?: boolean): Observable<IRole[]>

// Clear the in-memory roles cache (call after create/update/delete)
clearCache(): void

// Get role by ID
getRoleById(id: number): Observable<IRole>

// Create new role
createRole(request: ICreateRoleRequest, context?: HttpContext): Observable<IRole>

// Update role
updateRole(id: number, request: IUpdateRoleRequest, context?: HttpContext): Observable<IRole>

// Delete role
deleteRole(id: number): Observable<boolean>

// Assign claims to role
assignClaimsToRole(roleId: number, request: IAssignClaimsToRoleRequest, context?: HttpContext): Observable<boolean>

// Assign roles to user (role-scoped endpoint — see "Expected Backend Endpoints" below)
assignRolesToUser(userId: number, request: IAssignRolesToUserRequest): Observable<boolean>
```

`createRole`, `updateRole`, and `deleteRole` each clear the roles cache automatically after a successful response.

#### Usage Example

```typescript
import { Component, inject, signal } from '@angular/core';
import { RoleService, IRole, ICreateRoleRequest } from '@ihsan/core';

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
createClaim(request: ICreateClaimRequest, context?: HttpContext): Observable<IClaim>

// Update claim
updateClaim(id: number, request: IUpdateClaimRequest, context?: HttpContext): Observable<IClaim>

// Delete claim
deleteClaim(id: number): Observable<boolean>
```

#### Usage Example

```typescript
import { Component, inject } from '@angular/core';
import { ClaimService, ICreateClaimRequest } from '@ihsan/core';

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
addDeviceToken(request: IAddDeviceTokenRequest): Observable<IDeviceToken>

// Get device token by ID
getDeviceTokenById(id: number): Observable<IDeviceToken>

// Get all tokens for a user
getUserDeviceTokens(userId: number): Observable<IDeviceToken[]>

// Get user tokens by platform (iOS/Android/Web)
getUserDeviceTokensByPlatform(userId: number, platform: string): Observable<IDeviceToken[]>

// Update device token
updateDeviceToken(id: number, request: IUpdateDeviceTokenRequest): Observable<IDeviceToken>

// Delete specific token
deleteDeviceToken(id: number): Observable<void>

// Delete all tokens for a user
deleteAllUserDeviceTokens(userId: number): Observable<void>

// Batch operations — response is keyed by userId, not a flat array
getBatchDeviceTokens(request: IGetBatchDeviceTokensRequest): Observable<Record<number, IDeviceToken[]>>
deleteBatchDeviceTokens(request: IDeleteBatchDeviceTokensRequest): Observable<number> // count of deleted tokens

// Get all tokens in current tenant
getTenantDeviceTokens(): Observable<IDeviceToken[]>
```

#### Usage Example

```typescript
import { Component, inject } from '@angular/core';
import {
  DeviceTokenService,
  IAddDeviceTokenRequest,
} from '@ihsan/core';

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
import { authGuard } from '@ihsan/core';

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

**Purpose:** Protect routes requiring specific roles **or** permission claims (role-OR-permission — never AND; a role holder never needs a claim too).

**Behavior:**

- ✅ Allows access if no `roles`/`permissions` are configured in route `data`
- ✅ Allows access if the user has **any** of the required `data.roles` (checked against `UserClass.roles[].name`)
- ✅ Allows access if the user has **any** of the required `data.permissions` (checked against `UserClass.permissions`, the flattened `Permission`-claim list — see `Doc/PERMISSIONS_GUIDE.md`)
- ✅ On page refresh, fetches profile once when token exists but in-memory user is not yet loaded
- ❌ Redirects to `/login` if not authenticated
- ❌ Redirects to `/` if authenticated but unauthorized

**Usage — role-gated route:**

```typescript
import { roleGuard } from '@ihsan/core';

const routes: Routes = [
  {
    path: 'admin-panel',
    component: AdminPanelComponent,
    canActivate: [roleGuard],
    data: { roles: ['Admin', 'SuperAdmin'] }, // Required roles
  },
];
```

**Usage — role OR permission-gated route** (lower-privileged role reachable via a claim instead of a role):

```typescript
const routes: Routes = [
  {
    path: 'songs',
    component: SongsComponent,
    canActivate: [roleGuard],
    data: {
      roles: ['Admin', 'SuperAdmin'],
      permissions: ['nasheed.pages.songs'],
    },
  },
];
```

See `Doc/PERMISSIONS_GUIDE.md` for the full permission-claims guide (where claims come from, sidebar visibility, and action-level button gating).

---

## 🔄 Resolvers

### profileResolver

**Purpose:** Pre-load user profile before route activation.

**Usage:**

```typescript
import { profileResolver } from '@ihsan/core';

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
import { IUser } from '@ihsan/core';

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
import { tokenInterceptor } from '@ihsan/core';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([tokenInterceptor]))],
};
```

**Behavior:**

- Reads the access/refresh tokens via `IdentityStorageService` (`getAccessToken()` / `getRefreshToken()`) — the single choke point for token storage; the interceptor no longer touches `localStorage` directly
- Adds `Authorization: Bearer <token>` header to all requests
- No manual token management needed

### Token Expiry — Automatic Refresh (already implemented)

`tokenInterceptor` (`libs/core/src/lib/identity/token.interceptor.ts`) already implements automatic token refresh — this is **not** an outstanding TODO:

- On any `401` response (excluding the `auth/refresh` and `auth/login` requests themselves, to avoid a refresh loop), it calls `AuthService.refreshToken()` with the stored access + refresh tokens.
- A module-level `isRefreshing` flag + `refreshTokenSubject` (`BehaviorSubject<string | null>`) ensure only **one** refresh call is in flight — concurrent requests that 401 while a refresh is already underway queue on `refreshTokenSubject` and retry once the new token arrives, instead of each firing their own refresh call.
- On success, the failed request is retried once with the new access token via `addToken()`.
- On refresh failure (or if no tokens are present), the original error propagates so the global error interceptor can handle logout/redirect.

No caller-side action is needed — the interceptor handles this transparently for every HTTP request that goes through it.

---

## 📦 Models Reference

> **RBAC redesign note:** This module moved from a single numeric `role`/`roleName` field on `IUser` to **multi-role** RBAC — a user now holds a `roles: IRole[]` array, and each `IRole` carries its own `claims: IClaim[]`. `UserClass` additionally derives a flattened `permissions: string[]` from every `Permission`-typed claim across all of the user's roles — see `Doc/PERMISSIONS_GUIDE.md`. Source of truth: `libs/core/src/lib/identity/models.ts`.

### Core Entities

#### IUser / UserClass

```typescript
export interface IUser {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailConfirmed?: boolean;
  lastLogin?: string | null;
  status: boolean; // Active/Inactive
  created: string; // ISO 8601 UTC format
  lastModified?: string | null;
  roles: IRole[]; // Multi-role — replaces the old single role/roleName fields
  profilePictureId?: number | null;
  profilePicture?: IFileManagerResponse | null;
  verificationCode?: string | null;
  data?: string | null;
  isArchived: boolean;
}

// UserClass implements IUser and additionally derives:
export class UserClass implements IUser {
  // ...all IUser fields, plus:

  /** Flattened "Permission" claim values across all of this user's roles (e.g. "nasheed.songs.create"). */
  permissions: string[];
}
```

`UserClass`'s constructor computes `permissions` once from `roles.flatMap(r => r.claims ?? []).filter(c => c.claimType === 'Permission').map(c => c.claimValue)` — nothing needs to be fetched separately.

#### IRole / RoleClass

```typescript
export interface IRole {
  id: number;
  name: string;
  description?: string;
  isSystemRole: boolean;
  status: boolean;
  claims?: IClaim[]; // Populated on the roles returned with a user/role detail response
}
```

#### IClaim / ClaimClass

```typescript
export interface IClaim {
  id: number;
  name: string;
  description?: string;
  claimType: string; // e.g. "Permission"
  claimValue: string; // e.g. "nasheed.songs.create"
  isSuperAdminOnly: boolean;
  /** Seeded by the system (SystemPermissionCatalog on the backend) — cannot be deleted or renamed. */
  isSystemClaim: boolean;
  status: boolean;
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
  phoneNumber?: string | null;
  profilePictureId?: number | null;
  id?: number | null;
  data?: string | null;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds: number[]; // Multi-role assignment — replaces the old single `role: string`
  phoneNumber?: string | null;
  profilePictureId?: number | null;
  data?: string | null;
}

export interface IUpdateUserRequest {
  id: number;
  firstName: string;
  lastName: string;
  roleIds: number[]; // Multi-role assignment — replaces the old single `role: string`
  phoneNumber?: string | null;
  profilePictureId?: number | null;
  emailConfirmed?: boolean | null;
  status?: boolean | null;
  data?: string | null;
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
// IAuthResponse extends IUser (flattened fields) — the login/register/refresh
// response is NOT a nested `{ user: IUser }` shape, it IS a user plus tokens.
export interface IAuthResponse extends IUser {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiryTime: string; // ISO 8601 UTC format
}

// AuthResponseClass extends UserClass, so it also carries the derived `permissions: string[]`.
export class AuthResponseClass extends UserClass implements IAuthResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiryTime: string;
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

**Accessing the response:**

```typescript
this._authService.login({ email, password }).subscribe({
  next: (response) => {
    // response.roles, response.permissions, response.accessToken — all flattened,
    // NOT response.user.roles.
    console.log(response.accessToken, response.roles, response.permissions);
  },
});
```

---

## 🎯 Common Patterns

### Pattern 1: Login & Display Current User

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '@ihsan/core';

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
import { AuthService } from '@ihsan/core';

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
import { AuthService } from '@ihsan/core';

export class NavbarComponent {
  private _authService = inject(AuthService);
  currentUser = this._authService.currentUser;

  isAdmin = computed(() => {
    const user = this.currentUser();
    return (
      user?.roles?.some((r) => r.name === 'Admin' || r.name === 'SuperAdmin') ??
      false
    );
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
import { IdentityAdminService, IUser } from '@ihsan/core';

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
- **Don't hardcode roles:** ❌ Use `data: { roles: [...], permissions: [...] }` in route configuration

---

## 🔐 Security Considerations

1. **Token Storage:** Tokens are stored in `localStorage`. For production, consider using `HttpOnly` cookies for enhanced security.
2. **HTTPS Only:** Always use HTTPS in production to prevent token interception.
3. **Token Expiry:** Automatic token refresh is already implemented — see "Token Expiry" under the HTTP Interceptor section below. No outstanding work needed here.
4. **Role Validation:** Backend MUST validate roles/claims - never rely on frontend validation alone.
5. **Device Tokens:** Protect device token endpoints - only authenticated users should manage their own tokens.

---

## 🔄 Integration with Backend

### API Base URL Configuration

**Location:** `libs/core/src/lib/core/environment.token.ts`

Every identity service builds its base URL from `environment.apiUrls.gateway` — **not** a dedicated `identity` port. All requests route through the API Gateway (port 5000), which proxies to the Identity service (port 5001) internally. This matches the platform-wide rule that only the Gateway is reachable externally (see root `CLAUDE.md`, "Cross-Stack Communication Rules").

```typescript
export interface Environment {
  production: boolean;
  tenantId?: string;
  apiUrls: {
    gateway: string; // Example: 'https://localhost:5000' — every identity service builds off this
    identity?: string; // Present for reference only — NOT used to build request URLs
    // ...other per-service URLs, also unused by identity services
  };
}
```

```typescript
// auth.service.ts
private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/auth`;

// user.service.ts
private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/user`;

// admin.service.ts
private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/admin`;

// role.service.ts
private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/admin/roles`;

// claim.service.ts
private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/admin/claims`;

// device-token.service.ts
private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/device-tokens`;
```

### Expected Backend Endpoints

All endpoints are versioned under `/api/v1/...` and reached through the Gateway.

| Endpoint                                        | Method | Description                              |
| ------------------------------------------------ | ------ | ----------------------------------------- |
| `/api/v1/auth/login`                             | POST   | Login with email/password                |
| `/api/v1/auth/register`                          | POST   | Register new user                        |
| `/api/v1/auth/refresh`                           | POST   | Refresh access token                      |
| `/api/v1/auth/logout`                            | POST   | Logout user                               |
| `/api/v1/auth/forgot-password`                   | POST   | Request password reset                    |
| `/api/v1/auth/get-verification-code-by-phone`    | POST   | Request SMS code                          |
| `/api/v1/auth/get-verification-code-by-email`    | POST   | Request email code                        |
| `/api/v1/auth/login-with-code-by-phone`          | POST   | Login with SMS code                       |
| `/api/v1/auth/login-with-code-by-email`          | POST   | Login with email code                     |
| `/api/v1/auth/register-with-code-by-phone`       | POST   | Register with SMS code                    |
| `/api/v1/auth/register-with-code-by-email`       | POST   | Register with email code                  |
| `/api/v1/user/profile`                           | GET    | Get current user profile                  |
| `/api/v1/user/profile`                           | PUT    | Update current user profile               |
| `/api/v1/user/me`                                | DELETE | Delete current user account               |
| `/api/v1/admin/users`                            | GET    | Get all users (paginated, filterable)     |
| `/api/v1/admin/users/{id}`                       | GET    | Get user by ID                            |
| `/api/v1/admin/users`                            | POST   | Create user                               |
| `/api/v1/admin/users/{id}`                       | PUT    | Update user                               |
| `/api/v1/admin/users/{id}/toggle-status`         | PATCH  | Toggle user active/inactive status        |
| `/api/v1/admin/users/{id}/toggle-archive`        | PATCH  | Toggle user archived status                |
| `/api/v1/admin/users/{id}`                       | DELETE | Delete user                               |
| `/api/v1/admin/roles`                            | GET    | Get all roles                             |
| `/api/v1/admin/roles/{id}`                       | GET    | Get role by ID                            |
| `/api/v1/admin/roles`                            | POST   | Create role                               |
| `/api/v1/admin/roles/{id}`                       | PUT    | Update role                               |
| `/api/v1/admin/roles/{id}`                       | DELETE | Delete role                               |
| `/api/v1/admin/roles/{roleId}/claims`            | POST   | Assign claims to role                     |
| `/api/v1/admin/roles/user/{userId}`              | POST   | Assign roles to user (role-scoped, not user-scoped — note the path is under `/admin/roles`, not `/admin/users/{userId}/roles`) |
| `/api/v1/admin/claims`                           | GET    | Get all claims                            |
| `/api/v1/admin/claims/{id}`                      | GET    | Get claim by ID                           |
| `/api/v1/admin/claims`                           | POST   | Create claim                              |
| `/api/v1/admin/claims/{id}`                      | PUT    | Update claim                              |
| `/api/v1/admin/claims/{id}`                      | DELETE | Delete claim                              |
| `/api/v1/device-tokens`                          | POST   | Add device token                          |
| `/api/v1/device-tokens/{id}`                     | GET    | Get device token                          |
| `/api/v1/device-tokens/user/{userId}`            | GET    | Get user tokens                           |
| `/api/v1/device-tokens/user/{userId}/platform`   | GET    | Get user tokens by platform               |
| `/api/v1/device-tokens/{id}`                     | PUT    | Update device token                       |
| `/api/v1/device-tokens/{id}`                     | DELETE | Delete device token                       |
| `/api/v1/device-tokens/user/{userId}`            | DELETE | Delete all user tokens                    |
| `/api/v1/device-tokens/batch`                    | POST   | Get batch tokens (response keyed by userId) |
| `/api/v1/device-tokens/batch`                    | DELETE | Delete batch tokens (returns deleted count) |
| `/api/v1/device-tokens/tenant`                   | GET    | Get tenant tokens                         |

Note the device-token path segment is hyphenated (`device-tokens`), not `devicetokens`.

---

## 🧪 Testing

**IMPORTANT:** This project has **NO testing infrastructure**. Do NOT create `.spec.ts` files.

For manual testing, use Postman or the running application.

---

## 📝 Related Documentation

- [COMPONENT_USAGE_GUIDE.md](./COMPONENT_USAGE_GUIDE.md) - General component patterns
- [PERMISSIONS_GUIDE.md](./PERMISSIONS_GUIDE.md) - Permission-claim route guard, sidebar visibility, and action-level button gating (finer-grained than roles)
- Backend: `MicroservicesArchitecture/Doc/SHARED_IDENTITY_SERVICE_GUIDE.md` - Backend API documentation

---

## 🔄 Changelog

| Date         | Version | Changes                       |
| ------------ | ------- | ----------------------------- |
| Jan 18, 2026 | 1.0     | Initial documentation created |
| Aug 13, 2026 | 2.0     | Rewrote doc to match the multi-role RBAC redesign: fixed Model Reference (`IUser.roles[]`/`UserClass.permissions`, `IClaim.isSystemClaim`, flattened `IAuthResponse`), corrected every `@ihsan/core/identity` import to `@ihsan/core`, fixed API base URL (`apiUrls.gateway`, not a dedicated `identity` URL) and versioned (`/api/v1/...`) + hyphenated (`/device-tokens`) endpoint table, documented `roleGuard`'s permission-claim OR-authorization, corrected several service method return types, and corrected the Token Expiry section (automatic refresh is already implemented in `token.interceptor.ts`, not a TODO) |

---

**Need Help?** Refer to the instruction files:

- `.github/instructions/Angular.instructions.md` - Angular coding standards
- `.github/copilot-instructions.md` - Project overview
