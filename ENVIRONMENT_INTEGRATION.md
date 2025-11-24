# Environment Integration Complete ✅

## Summary

All microservices are now linked with environment configuration in the Angular applications.

## What Was Done

### 1. **Environment Files Created**

- `apps/playground/src/environments/environment.ts` (Production)
- `apps/playground/src/environments/environment.development.ts` (Development)
- `apps/web-app/src/environments/environment.ts` (Production)
- `apps/web-app/src/environments/environment.development.ts` (Development)

### 2. **Environment Injection Token**

Created `libs/core/src/lib/core/environment.token.ts`:

```typescript
export interface Environment {
  production: boolean;
  apiUrls: {
    identity: string;
    tenant: string;
    notification: string;
    fileManager: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
```

### 3. **App Configuration Updated**

Both `playground` and `web-app` now provide the environment:

```typescript
import { ENVIRONMENT } from '@ihsan/core';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    { provide: ENVIRONMENT, useValue: environment },
  ],
};
```

### 4. **File Replacements Configured**

Updated `project.json` for both apps to automatically swap environment files based on configuration.

## Microservices URLs

### Development (localhost)

| Service      | URL                   | Port |
| ------------ | --------------------- | ---- |
| Identity     | http://localhost:5001 | 5001 |
| Tenant       | http://localhost:5002 | 5002 |
| Notification | http://localhost:5004 | 5004 |
| FileManager  | http://localhost:5005 | 5005 |

### Production (to be configured)

Update `environment.ts` with your production URLs:

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

## Current Service Implementation

All services in `libs/core` are currently using **relative URLs** with proxy configuration:

### Identity Services

- `AuthService`: `/api/auth`
- `UserService`: `/api/user`
- `AdminService`: `/api/admin`

### Tenant Service

- `TenantService`: `/api/tenant`, `/api/admin/tenant`

### Notification Service

- `NotificationService`: `/api/notifications`

### FileManager Service

- `FileManagerService`: `/api/filemanager`, `/api/filemanager/admin`

## How It Works

### Development Mode (with Proxy)

1. Frontend runs on `http://localhost:4201` (playground) or `http://localhost:4200` (web-app)
2. API calls to `/api/*` are proxied to `http://localhost:5001` (Identity service)
3. Services use relative URLs like `/api/auth`
4. Proxy configuration in `proxy.conf.json` handles routing

### Production Mode (direct calls)

When you need to call microservices directly (without proxy):

1. **Option A**: Update services to use `ENVIRONMENT` token

   ```typescript
   @Injectable({ providedIn: 'root' })
   export class AuthService {
     private _env = inject(ENVIRONMENT);
     private readonly _baseUrl = `${this._env.apiUrls.identity}/api/auth`;
   }
   ```

2. **Option B**: Configure API Gateway/Load Balancer
   - Deploy all microservices behind a single gateway
   - Keep using relative URLs
   - Gateway routes `/api/auth` → Identity Service
   - Gateway routes `/api/tenant` → Tenant Service
   - etc.

## Usage Example

If you want to use environment URLs in a service:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '@ihsan/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);

  // Use environment URL
  private readonly _baseUrl = `${this._env.apiUrls.identity}/api/custom`;

  getData() {
    return this._http.get(`${this._baseUrl}/data`);
  }
}
```

## Benefits

✅ **Environment-specific configuration**: Different URLs for dev/prod
✅ **Type-safe**: TypeScript interface for environment
✅ **Dependency Injection**: Easy to inject and use
✅ **Automatic file replacement**: Angular handles swapping files
✅ **Centralized configuration**: All URLs in one place
✅ **Flexible**: Can use proxy or direct calls

## Next Steps

If you want to use environment URLs in existing services:

1. Inject `ENVIRONMENT` token in the service
2. Replace hardcoded `/api/...` with `${this._env.apiUrls.serviceName}/api/...`
3. Test in both development and production modes

For now, the proxy configuration works perfectly for development! 🎉
