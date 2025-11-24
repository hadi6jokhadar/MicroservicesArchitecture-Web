# Environment Configuration

This document explains how to use environment files for microservices API URLs.

## Environment Files

### Development (`environment.development.ts`)

Used when running `nx serve` or `ng serve` (default development mode).

```typescript
export const environment = {
  production: false,
  apiUrls: {
    identity: 'http://localhost:5001',
    tenant: 'http://localhost:5002',
    notification: 'http://localhost:5004',
    fileManager: 'http://localhost:5005',
  },
};
```

### Production (`environment.ts`)

Used when building for production with `nx build --configuration=production`.

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

## Microservices Ports (Development)

Based on `run-all-development-instances.bat`:

| Service      | HTTP Port | HTTPS Port | Description                      |
| ------------ | --------- | ---------- | -------------------------------- |
| Identity     | 5001      | 5101       | Authentication & User Management |
| Tenant       | 5002      | 5102       | Tenant Configuration             |
| Notification | 5004      | 5104       | Notifications & Alerts           |
| FileManager  | 5005      | 5105       | File Upload & Management         |

## Usage in Services

Import the environment file in your services:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _http = inject(HttpClient);
  private readonly _baseUrl = `${environment.apiUrls.identity}/api/auth`;

  login(credentials: ILoginRequest) {
    return this._http.post(`${this._baseUrl}/login`, credentials);
  }
}
```

## How It Works

### File Replacement

The Angular build system automatically replaces `environment.ts` with the appropriate file:

- **Development**: `environment.ts` → `environment.development.ts`
- **Production**: `environment.ts` → `environment.ts` (no replacement)

This is configured in `project.json`:

```json
{
  "configurations": {
    "development": {
      "fileReplacements": [
        {
          "replace": "apps/playground/src/environments/environment.ts",
          "with": "apps/playground/src/environments/environment.development.ts"
        }
      ]
    }
  }
}
```

### Always Import from `environment.ts`

Always import from `environment.ts` (not `environment.development.ts`):

```typescript
// ✅ CORRECT
import { environment } from '../environments/environment';

// ❌ WRONG
import { environment } from '../environments/environment.development';
```

## Running Services

### Start All Backend Services

```bash
cd MicroservicesArchitecture/src/Services
run-all-development-instances.bat
```

This will start:

- Redis (for caching)
- Tenant Service (port 5002)
- Identity Service (port 5001)
- Notification Service (port 5004)
- FileManager Service (port 5005)

### Start Frontend

```bash
cd MicroservicesArchitecture-Web

# Playground app (port 4201)
nx serve playground

# Web app (port 4200)
nx serve web-app
```

## Proxy Configuration

For development, API calls are proxied through the dev server:

**`proxy.conf.json`:**

```json
{
  "/api": {
    "target": "http://localhost:5001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

This means:

- Frontend: `http://localhost:4201`
- API calls to `/api/*` are proxied to `http://localhost:5001/api/*`

## Production Deployment

For production, update `environment.ts` with your actual API URLs:

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

Then build:

```bash
nx build web-app --configuration=production
```

## Troubleshooting

### Issue: API calls fail with CORS errors

**Solution**: Ensure the backend services have CORS configured to allow requests from your frontend origin.

### Issue: Wrong environment file is being used

**Solution**: Check `project.json` file replacements configuration and ensure you're running with the correct configuration (`--configuration=development` or `--configuration=production`).

### Issue: Environment file not found

**Solution**: Ensure the environment files exist in the correct location:

- `apps/playground/src/environments/environment.ts`
- `apps/playground/src/environments/environment.development.ts`
