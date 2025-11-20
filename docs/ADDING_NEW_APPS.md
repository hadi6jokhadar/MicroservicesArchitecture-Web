# Adding New Angular Applications to Nx Workspace

This guide explains how to add multiple Angular applications to your Nx monorepo workspace.

## 🎯 Understanding the Structure

Your Nx workspace can host multiple applications that share libraries (`core`, `shared`, `features`).

**Current Structure:**

```
MicroservicesArchitecture-Web/
├── apps/                    # (will be created when adding apps)
│   ├── web-app/            # Main application (already exists)
│   ├── admin-app/          # Admin dashboard (example)
│   └── mobile-app/         # Mobile-specific app (example)
├── libs/
│   ├── core/               # Shared across all apps
│   ├── shared/             # Shared across all apps
│   └── features/           # Shared across all apps
```

## 📦 Adding Applications

### Option 1: Add a Single New Application

```bash
# Navigate to workspace
cd MicroservicesArchitecture-Web

# Generate new Angular application
npx nx g @nx/angular:application my-app \
  --style=scss \
  --routing=true \
  --standalone=true \
  --prefix=app \
  --skipTests=false

# Example: Admin Dashboard
npx nx g @nx/angular:application admin-dashboard \
  --style=scss \
  --routing=true \
  --standalone=true \
  --prefix=admin \
  --skipTests=false
```

### Option 2: Add Multiple Applications

```bash
# Add Admin Dashboard
npx nx g @nx/angular:application admin-dashboard \
  --style=scss \
  --routing=true \
  --standalone=true \
  --prefix=admin

# Add Customer Portal
npx nx g @nx/angular:application customer-portal \
  --style=scss \
  --routing=true \
  --standalone=true \
  --prefix=customer

# Add Partner Portal
npx nx g @nx/angular:application partner-portal \
  --style=scss \
  --routing=true \
  --standalone=true \
  --prefix=partner
```

## 🎨 Application Types and Examples

### 1️⃣ Single Application (Current Setup)

**Use Case:** One web application

```bash
# Already exists
web-app (main application)
```

**Running:**

```bash
npx nx serve web-app
```

### 2️⃣ Dual Application Setup

**Use Case:** Main app + Admin dashboard

```bash
# Add admin dashboard
npx nx g @nx/angular:application admin-dashboard \
  --style=scss \
  --routing=true \
  --standalone=true \
  --prefix=admin
```

**Project Structure:**

```
apps/
├── web-app/              # Main customer-facing app (port 4200)
└── admin-dashboard/      # Admin dashboard (port 4201)
```

**Running:**

```bash
# Terminal 1: Main app
npx nx serve web-app

# Terminal 2: Admin dashboard
npx nx serve admin-dashboard --port=4201
```

### 3️⃣ Multiple Applications Setup

**Use Case:** Main app + Admin + Multiple portals

```bash
# Add admin dashboard
npx nx g @nx/angular:application admin-dashboard \
  --style=scss --routing=true --standalone=true --prefix=admin

# Add customer portal
npx nx g @nx/angular:application customer-portal \
  --style=scss --routing=true --standalone=true --prefix=customer

# Add partner portal
npx nx g @nx/angular:application partner-portal \
  --style=scss --routing=true --standalone=true --prefix=partner

# Add mobile-optimized app
npx nx g @nx/angular:application mobile-app \
  --style=scss --routing=true --standalone=true --prefix=mobile
```

**Project Structure:**

```
apps/
├── web-app/              # Main website
├── admin-dashboard/      # Admin dashboard
├── customer-portal/      # Customer portal
├── partner-portal/       # Partner portal
└── mobile-app/          # Mobile-optimized app
```

**Running Multiple Apps:**

```bash
# Run all apps on different ports
npx nx serve web-app             # http://localhost:4200
npx nx serve admin-dashboard --port=4201  # http://localhost:4201
npx nx serve customer-portal --port=4202  # http://localhost:4202
npx nx serve partner-portal --port=4203   # http://localhost:4203
npx nx serve mobile-app --port=4204       # http://localhost:4204
```

## 🔧 Configure New Application

After creating a new app, configure it to use shared libraries and styles:

### 1. Import Core and Shared Libraries

**Edit `apps/[app-name]/src/app/app.config.ts`:**

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
  ],
};
```

### 2. Add Global Styles

**Edit `apps/[app-name]/src/styles.scss`:**

```scss
/* Import Material Theme */
@use '../../../src/styles/material-theme';

/* Import CSS Variables */
@use '../../../src/styles/variables';

/* Import Mixins */
@use '../../../src/styles/mixins';

/* App-specific styles */
// Add your app-specific global styles here
```

Or create a shared styles file:

**Create `src/styles/_shared-styles.scss`:**

```scss
@use './material-theme';
@use './variables';
@use './mixins';

// Common global styles
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: var(--font-family);
  color: var(--text-color);
  background-color: var(--background-color);
}
```

**Then in each app's `styles.scss`:**

```scss
@use '../../../src/styles/shared-styles';
```

### 3. Use Shared Libraries

**In any component:**

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';
import { UserCardComponent } from '@shared/components/user-card/user-card.component';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UserCardComponent],
  template: `
    <app-user-card [userName]="user.name" [userEmail]="user.email" />
  `,
})
export class DashboardComponent {
  private _themeService = inject(ThemeService);

  user = new User({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  });
}
```

## 🎯 Application Naming Conventions

### Application Prefix

Each app should have a unique prefix:

- `web-app` → prefix: `app`
- `admin-dashboard` → prefix: `admin`
- `customer-portal` → prefix: `customer`
- `partner-portal` → prefix: `partner`
- `mobile-app` → prefix: `mobile`

**Example:**

```typescript
@Component({
  selector: 'admin-dashboard',  // Uses admin prefix
  // ...
})
```

## 📁 Shared Code Structure

All applications share the same libraries:

```
libs/
├── core/                  # Shared across ALL apps
│   ├── models/           # User, Product, etc.
│   ├── services/         # API services, theme, auth
│   ├── guards/           # Auth guards, role guards
│   └── interceptors/     # Auth interceptor, error handling
├── shared/               # Shared across ALL apps
│   ├── components/       # Reusable UI components
│   ├── pipes/            # Custom pipes
│   └── directives/       # Custom directives
└── features/             # Feature-specific (optional)
    ├── auth/            # Login, register, etc.
    ├── users/           # User management
    └── products/        # Product management
```

## 🔀 Application-Specific Features

For app-specific code that shouldn't be shared:

```bash
# Create app-specific feature library
npx nx g @nx/angular:library admin-features \
  --directory=libs/apps/admin-dashboard \
  --standalone

# Structure
libs/apps/
├── admin-dashboard/
│   └── admin-features/
│       └── src/lib/
│           ├── dashboard/
│           ├── reports/
│           └── settings/
```

## 🚀 Running and Building

### Development

```bash
# Run single app
npx nx serve web-app

# Run with specific port
npx nx serve admin-dashboard --port=4201

# Run multiple apps (use separate terminals)
npx nx serve web-app & npx nx serve admin-dashboard --port=4201
```

### Production Build

```bash
# Build single app
npx nx build web-app

# Build all apps
npx nx run-many --target=build --all

# Build specific apps
npx nx run-many --target=build --projects=web-app,admin-dashboard
```

### Build Output

```
dist/
├── web-app/
├── admin-dashboard/
├── customer-portal/
└── partner-portal/
```

## 🧪 Testing Multiple Apps

```bash
# Test single app
npx nx test web-app

# Test all apps
npx nx run-many --target=test --all

# Test specific apps
npx nx run-many --target=test --projects=web-app,admin-dashboard
```

## 📊 Visualize Dependencies

```bash
# View dependency graph
npx nx graph

# View affected projects
npx nx affected:graph
```

## 🔧 Common Tasks

### Add E2E Tests for New App

```bash
# E2E tests are created automatically with the app
# Run E2E tests
npx nx e2e admin-dashboard-e2e
```

### Share Routes Between Apps

**Create `libs/core/src/lib/routing/routes.config.ts`:**

```typescript
export const SHARED_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};
```

**Use in apps:**

```typescript
import { SHARED_ROUTES } from '@core/routing/routes.config';

export const routes: Routes = [
  {
    path: SHARED_ROUTES.LOGIN,
    loadComponent: () => import('./login.component'),
  },
  {
    path: SHARED_ROUTES.DASHBOARD,
    loadComponent: () => import('./dashboard.component'),
  },
];
```

## 🎨 Different Themes Per App

**In app-specific `styles.scss`:**

```scss
// Admin app - Use blue theme by default
:root {
  @use '../../../src/styles/variables';

  // Override primary color for admin app
  --primary-color: #2196f3;
  --secondary-color: #ff9800;
}
```

## 📝 Best Practices

1. **Shared Libraries First**

   - Put common code in `libs/core` or `libs/shared`
   - Only create app-specific libraries when truly needed

2. **Consistent Naming**

   - Use descriptive app names: `admin-dashboard`, not `admin`
   - Use consistent prefixes: `admin-`, `customer-`, etc.

3. **Port Management**

   - Assign fixed ports to each app
   - Document ports in README

4. **Lazy Loading**

   - Use lazy loading for routes in all apps
   - Share route modules when possible

5. **Environment Configuration**

   - Create environment files per app
   - Share common environment config

6. **Build Optimization**
   - Use Nx caching for faster builds
   - Build only affected apps in CI/CD

## 🎯 Quick Reference

```bash
# Add new app
npx nx g @nx/angular:application [app-name] --style=scss --routing=true --standalone=true

# Serve app
npx nx serve [app-name]

# Build app
npx nx build [app-name]

# Test app
npx nx test [app-name]

# List all apps
npx nx show projects

# View dependency graph
npx nx graph
```

## 📖 Additional Resources

- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.dev)
- [Nx Angular Plugin](https://nx.dev/nx-api/angular)

---

**Need Help?** Check the other documentation files in `docs/` for more information about project structure and coding standards.
