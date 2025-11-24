# Services Updated to Use Environment URLs ✅

## Summary

All services in `libs/core` have been updated to use environment configuration instead of hardcoded relative URLs.

## Services Updated

### ✅ Identity Services

1. **AuthService** (`libs/core/src/lib/identity/auth.service.ts`)

   - Before: `private readonly _baseUrl = '/api/auth';`
   - After: `private readonly _baseUrl = \`\${this.\_env.apiUrls.identity}/api/auth\`;`

2. **UserService** (`libs/core/src/lib/identity/user.service.ts`)

   - Before: `private readonly _baseUrl = '/api/user';`
   - After: `private readonly _baseUrl = \`\${this.\_env.apiUrls.identity}/api/user\`;`

3. **AdminService** (`libs/core/src/lib/identity/admin.service.ts`)
   - Before: `private readonly _baseUrl = '/api/admin';`
   - After: `private readonly _baseUrl = \`\${this.\_env.apiUrls.identity}/api/admin\`;`

### ✅ Tenant Service

**TenantService** (`libs/core/src/lib/tenant/tenant.service.ts`)

- Before:
  - `private readonly _baseUrl = '/api/tenant';`
  - `private readonly _adminUrl = '/api/admin/tenant';`
- After:
  - `private readonly _baseUrl = \`\${this.\_env.apiUrls.tenant}/api/tenant\`;`
  - `private readonly _adminUrl = \`\${this.\_env.apiUrls.tenant}/api/admin/tenant\`;`

### ✅ Notification Service

**NotificationService** (`libs/core/src/lib/notification/notification.service.ts`)

- Before: `private readonly _baseUrl = '/api/notifications';`
- After: `private readonly _baseUrl = \`\${this.\_env.apiUrls.notification}/api/notifications\`;`

### ✅ FileManager Service

**FileManagerService** (`libs/core/src/lib/file-manager/file-manager.service.ts`)

- Before:
  - `private readonly _baseUrl = '/api/filemanager';`
  - `private readonly _adminUrl = '/api/filemanager/admin';`
- After:
  - `private readonly _baseUrl = \`\${this.\_env.apiUrls.fileManager}/api/filemanager\`;`
  - `private readonly _adminUrl = \`\${this.\_env.apiUrls.fileManager}/api/filemanager/admin\`;`

## Pattern Used

All services now follow this pattern:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../core/environment.token';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.serviceName}/api/endpoint`;

  // ... service methods
}
```

## How It Works

### Development Mode

Environment file: `environment.development.ts`

```typescript
export const environment = {
  production: false,
  apiUrls: {
    identity: 'http://localhost:5001', // ← Used by AuthService, UserService, AdminService
    tenant: 'http://localhost:5002', // ← Used by TenantService
    notification: 'http://localhost:5004', // ← Used by NotificationService
    fileManager: 'http://localhost:5005', // ← Used by FileManagerService
  },
};
```

### Example API Call

When you call `authService.login()`:

- **Before**: `POST http://localhost:4201/api/auth/login` (proxied to 5001)
- **After**: `POST http://localhost:5001/api/auth/login` (direct call)

## Benefits

✅ **Direct Calls**: No longer relying on proxy
✅ **Environment-Specific**: Different URLs for dev/prod
✅ **Type-Safe**: Environment interface ensures correct structure
✅ **Flexible**: Easy to change URLs per environment
✅ **Microservices-Ready**: Each service can be on different host/port

## Theme Persistence

The theme service already saves to localStorage:

- `localStorage.setItem('colorScheme', scheme);` - Line 26
- `localStorage.setItem('mode', mode);` - Line 35
- `initializeTheme()` loads saved values on startup - Lines 92-104

Theme should persist across page refreshes! ✅

## Testing

1. **Start all microservices**:

   ```bash
   cd MicroservicesArchitecture/src/Services
   run-all-development-instances.bat
   ```

2. **Start frontend**:

   ```bash
   cd MicroservicesArchitecture-Web
   nx serve playground
   ```

3. **Test login**:

   - Navigate to `http://localhost:4201/login`
   - Enter credentials
   - Check Network tab: Should see `POST http://localhost:5001/api/auth/login`

4. **Test theme persistence**:
   - Go to `/theme-tester`
   - Select a theme (e.g., Ihsan)
   - Refresh the page
   - Theme should remain selected ✅

## Production Deployment

For production, update `environment.ts`:

```typescript
export const environment = {
  production: true,
  apiUrls: {
    identity: 'https://api.yourdomain.com/identity',
    tenant: 'https://api.yourdomain.com/tenant',
    notification: 'https://api.yourdomain.com/notification',
    fileManager: 'https://api.yourdomain.com/filemanager',
  },
};
```

All services will automatically use production URLs! 🎉
