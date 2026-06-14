---
name: fe-admin-app-creator
description: Use when creating a new Angular frontend admin application in the MicroservicesArchitecture-Web workspace. Scaffolds the full project — main.ts, app.config.ts, app shell, routing, pages component with sidebar, login, environments, tsconfig, project.json, and styles — following the nasheed-admin reference pattern. Invoke with app name, folder path, title translation key, tenant ID, dev port, and optional pages (register, forgot-password).
tools: Read, Edit, Write, Bash, Glob, Grep, TodoWrite
---

# Frontend Admin App Creator Agent

You are a specialized agent for creating new Angular frontend admin applications in the MicroservicesArchitecture-Web workspace. All patterns and templates are based on the **nasheed-admin** reference app (`apps/nasheed/admin`).

## Before You Start — Ask the User

Collect the following required information:

| Field                             | Example                                                                 |
| --------------------------------- | ----------------------------------------------------------------------- |
| **App name** (Nx project name)    | `nasheed-admin`                                                         |
| **App folder path**               | `apps/nasheed/admin` — determines nesting depth for `tsconfig.app.json` |
| **App title translation key**     | `app.title`                                                             |
| **Tenant ID**                     | `anashid` — set manually in `environment.ts`                            |
| **Dev port**                      | `4300` — must be unique (see Known Ports below)                         |
| **Include Register page?**        | yes / no                                                                |
| **Include Forgot Password page?** | yes / no                                                                |

### Known Ports

| App           | Port |
| ------------- | ---- |
| admin (root)  | 4200 |
| nasheed-admin | 4300 |
| nasheed-web   | 4301 |

**Pick the next unused port for each new app.**

---

## Architecture Overview

```
apps/{domain}/{app-name}/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   └── identity/         # Users, Roles, Claims
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── register/         # Optional
│   │   │   ├── forgot-password/  # Optional
│   │   │   ├── pages.component.ts
│   │   │   ├── pages.component.html
│   │   │   ├── pages.component.scss
│   │   │   └── pages.routes.ts
│   │   ├── shared/               # App-specific shared components
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── app.scss
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles/
│   │   └── dialog-shared.css
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── public/
├── project.json
├── tsconfig.app.json
└── tsconfig.json
```

---

## File Templates

All templates are verbatim from the working nasheed-admin app. Replace `{{PLACEHOLDER}}` values.

### `main.ts`

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { App } from "./app/app";

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

---

### `app.config.ts`

```typescript
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { appRoutes } from "./app.routes";
import { provideZard } from "@ihsan/ui/lib/zard/core/provider/providezard";
import { ENVIRONMENT, tenantInterceptor, tokenInterceptor } from "@ihsan/core";
import { errorInterceptor } from "@ihsan/shared";
import { environment } from "../environments/environment";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([errorInterceptor, tokenInterceptor, tenantInterceptor]),
    ),
    provideAnimationsAsync(),
    { provide: ENVIRONMENT, useValue: environment },
    provideZard(),
  ],
};
```

> **Interceptor order is fixed:** `errorInterceptor → tokenInterceptor → tenantInterceptor`

---

### `app.ts`

```typescript
import { Component, effect, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ZardToastComponent } from "@ihsan/ui";
import { ENVIRONMENT, TenantService, TranslationService } from "@ihsan/core";
import { SignalrService } from "@ihsan/shared";

@Component({
  imports: [RouterModule, ZardToastComponent],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  protected title = "{{APP_TITLE}}";

  private _translationService = inject(TranslationService);
  private _tenantService = inject(TenantService);
  private _platformId = inject(PLATFORM_ID);
  private _signalrService = inject(SignalrService);
  private _environment = inject(ENVIRONMENT);

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this._platformId)) {
        const currentLanguage =
          this._translationService.getCurrentLanguageSignal()();
        const htmlElement = document.documentElement;

        if (currentLanguage === "ar") {
          htmlElement.setAttribute("dir", "rtl");
          htmlElement.setAttribute("lang", "ar");
        } else {
          htmlElement.setAttribute("dir", "ltr");
          htmlElement.setAttribute("lang", currentLanguage);
        }
      }
    });

    if (isPlatformBrowser(this._platformId)) {
      const tenantId = this._environment.tenantId;
      if (tenantId) {
        this._tenantService.setCurrentTenantId = tenantId;
      }
      this._signalrService.initializeConnection();
    }
  }
}
```

> **Critical:** `tenantId` is read **exclusively** from `this._environment.tenantId`. No localStorage. No hardcoded strings.

---

### `app.html`

```html
<router-outlet></router-outlet>
<z-toaster position="bottom-right" [richColors]="true" />
```

---

### `app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { translationResolver } from '@ihsan/core';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.{{PREFIX}}LoginComponent),
    resolve: { translations: translationResolver },
  },
  // Add 'register' and 'forgot-password' routes here if requested
  {
    path: '',
    loadComponent: () =>
      import('./pages/pages.component').then((m) => m.PagesComponent),
    resolve: { translations: translationResolver },
    loadChildren: () =>
      import('./pages/pages.routes').then((m) => m.pagesRoutes),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
```

> **Rule:** Every route (including the pages shell) must have `resolve: { translations: translationResolver }`.

---

### `pages/pages.routes.ts`

```typescript
import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { identityRoutes } from "../features/identity/identity.routes";
import { authGuard, roleGuard } from "@ihsan/core";

export const pagesRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      {
        path: "identity",
        loadChildren: () => Promise.resolve(identityRoutes),
        canActivate: [authGuard, roleGuard],
        data: { roles: ["Admin", "SuperAdmin"] },
      },
      // Add custom feature routes here
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
    ],
  },
];
```

---

### `pages/pages.component.ts`

```typescript
import {
  Component,
  signal,
  computed,
  effect,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { ZardIcon } from "@ihsan/ui/lib/zard/components/icon";
import { ZardDialogService } from "@ihsan/ui";
import { AuthService } from "@ihsan/core";
import {
  ISidebarPage,
  ISidebarUser,
  SidebarComponent,
  SidebarPageClass,
  SidebarUserClass,
  FileManagerComponent,
  SidebarPageType,
} from "@ihsan/shared";

@Component({
  selector: "app-pages",
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: "./pages.component.html",
  styleUrls: ["./pages.component.scss"],
})
export class PagesComponent {
  private _platformId = inject(PLATFORM_ID);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _dialogService = inject(ZardDialogService);
  private readonly DARK_MODE_KEY = "theme-preference";

  isDarkMode = signal<boolean>(false);

  sidebarPages = signal<ISidebarPage[]>([
    new SidebarPageClass({
      translationKey: "sidebar.pages.dashboard",
      icon: "layout-dashboard" as ZardIcon,
      route: "/dashboard",
      type: SidebarPageType.Both,
    }),
    new SidebarPageClass({
      translationKey: "sidebar.pages.identity",
      icon: "shield" as ZardIcon,
      group: "sidebar.groups.user",
      roles: ["Admin", "SuperAdmin"],
      type: SidebarPageType.Both,
      children: [
        new SidebarPageClass({
          translationKey: "sidebar.pages.users",
          icon: "users" as ZardIcon,
          route: "/identity/users",
          roles: ["Admin", "SuperAdmin"],
          type: SidebarPageType.Both,
        }),
        new SidebarPageClass({
          translationKey: "sidebar.pages.roles",
          icon: "badge-check" as ZardIcon,
          route: "/identity/roles",
          roles: ["Admin", "SuperAdmin"],
          type: SidebarPageType.Both,
        }),
        new SidebarPageClass({
          translationKey: "sidebar.pages.claims",
          icon: "shield" as ZardIcon,
          route: "/identity/claims",
          roles: ["Admin", "SuperAdmin"],
          type: SidebarPageType.Both,
        }),
      ],
    }),
    new SidebarPageClass({
      translationKey: "sidebar.pages.fileManager",
      icon: "folder" as ZardIcon,
      group: "sidebar.groups.system",
      action: () => this.openFileManagerDialog(),
      roles: ["Admin", "SuperAdmin"],
      type: SidebarPageType.Both,
    }),
    // Add app-specific menu items here
  ]);

  currentUser = computed<ISidebarUser>(() => {
    const user = this._authService.currentUser() as
      | {
          firstName?: string;
          lastName?: string;
          email?: string;
          roles?: { name: string }[];
        }
      | null
      | undefined;

    const name = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.email || "User";

    return new SidebarUserClass({
      name: name,
      username: user?.email || "",
      imageUrl: undefined,
      roles: user?.roles?.map((r) => r.name) || [],
    });
  });

  appTitleTranslationKey = signal<string>("{{APP_TITLE_KEY}}");

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      const savedTheme = localStorage.getItem(this.DARK_MODE_KEY);
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const shouldBeDark =
        savedTheme === "dark" || (!savedTheme && prefersDark);

      this.isDarkMode.set(shouldBeDark);
      this.applyTheme(shouldBeDark);

      effect(() => {
        const isDark = this.isDarkMode();
        this.applyTheme(isDark);
        localStorage.setItem(this.DARK_MODE_KEY, isDark ? "dark" : "light");
      });
    }
  }

  private applyTheme(isDark: boolean): void {
    if (isPlatformBrowser(this._platformId)) {
      const html = document.documentElement;
      if (isDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }
  }

  onPageClick(event: ISidebarPage): void {}

  toggleDarkMode(): void {
    this.isDarkMode.update((current) => !current);
  }

  onLogout(): void {
    this._authService.logout().subscribe({
      next: () => {
        this._router.navigate(["/login"]);
      },
      error: () => {
        this._router.navigate(["/login"]);
      },
    });
  }

  openFileManagerDialog(): void {
    this._dialogService.create({
      zContent: FileManagerComponent,
      zData: {
        allowedTypes: ["image/*", "video/*", "audio/*"],
        maxFiles: 5,
        selectionMode: "multiple",
        viewMode: "grid",
      },
      zWidth: "80vw",
      zCustomClasses: "z-dialog-max-width-100",
      zHideFooter: true,
      zOnOk: (files) => {
        console.log("Selected files:", files);
      },
    });
  }
}
```

---

### `pages/pages.component.html`

```html
<div class="pages-container">
  <shared-sidebar
    [pages]="sidebarPages()"
    [currentUser]="currentUser()"
    [appTitleTranslationKey]="appTitleTranslationKey()"
    (pageClicked)="onPageClick($event)"
    (darkModeToggled)="toggleDarkMode()"
    (logoutClicked)="onLogout()"
  />
  <main class="main-content">
    <router-outlet />
  </main>
</div>
```

---

### `pages/pages.component.scss`

```scss
:host {
  display: block;
  block-size: 100vh;
  overflow: hidden;

  .pages-container {
    display: flex;
    block-size: 100%;
    inline-size: 100%;
    overflow: hidden;

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background-color: var(--background);
      color: var(--foreground);

      @media (max-width: 768px) {
        padding: 1rem;
      }

      @media (max-width: 480px) {
        padding: 0.75rem;
      }
    }
  }
}
```

---

### `pages/login/login.component.ts`

```typescript
import { Component } from '@angular/core';
import { LoginComponent } from '@ihsan/shared';

@Component({
  selector: 'app-{{PREFIX}}-login',
  standalone: true,
  imports: [LoginComponent],
  template: `<shared-login
    [showModes]="false"
    [showForgotPassword]="true"
    [showCreateAccount]="false"
    [redirectAfterLogin]="'/dashboard'"
  />`,
})
export class {{PREFIX}}LoginComponent {}
```

> Replace `{{PREFIX}}` with PascalCase app prefix (e.g., `Admin`, `NasheedAdmin`).

---

### `environments/environment.ts`

```typescript
import { Environment } from "@ihsan/core";

export const environment: Environment = {
  production: false,
  tenantId: "{{TENANT_ID}}",
  apiUrls: {
    identity: "http://localhost:5001",
    tenant: "http://localhost:5002",
    notification: "http://localhost:5004",
    fileManager: "http://localhost:5005",
    translation: "http://localhost:5006",
    ai: "http://localhost:5008",
  },
};
```

### `environments/environment.prod.ts`

```typescript
import { Environment } from "@ihsan/core";

export const environment: Environment = {
  production: true,
  tenantId: "{{TENANT_ID}}",
  apiUrls: {
    identity: "https://identity.{{DOMAIN}}",
    tenant: "https://tenant.{{DOMAIN}}",
    notification: "https://notification.{{DOMAIN}}",
    fileManager: "https://filemanager.{{DOMAIN}}",
    translation: "https://translation.{{DOMAIN}}",
    ai: "https://ai.{{DOMAIN}}",
  },
};
```

---

### `tsconfig.app.json`

> **Critical for nested apps.** The `rootDir` must go up to the workspace root so shared libs under `libs/` are included.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "rootDir": "../../../",
    "types": []
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts", "src/**/*.test.ts"]
}
```

**Depth rule:**

| App location                          | `rootDir` / `outDir` |
| ------------------------------------- | -------------------- |
| `apps/my-app/` (1 level deep)         | `"../../"`           |
| `apps/domain/my-app/` (2 levels deep) | `"../../../"`        |

---

### `project.json`

```json
{
  "name": "{{PROJECT_NAME}}",
  "$schema": "../../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "prefix": "app",
  "sourceRoot": "apps/{{DOMAIN}}/{{APP_NAME}}/src",
  "tags": [],
  "targets": {
    "build": {
      "executor": "@angular/build:application",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/{{DOMAIN}}/{{APP_NAME}}",
        "browser": "apps/{{DOMAIN}}/{{APP_NAME}}/src/main.ts",
        "tsConfig": "apps/{{DOMAIN}}/{{APP_NAME}}/tsconfig.app.json",
        "inlineStyleLanguage": "scss",
        "polyfills": ["zone.js"],
        "assets": [
          {
            "glob": "**/*",
            "input": "apps/{{DOMAIN}}/{{APP_NAME}}/public"
          }
        ],
        "styles": ["apps/{{DOMAIN}}/{{APP_NAME}}/src/styles.css"]
      },
      "configurations": {
        "production": {
          "fileReplacements": [
            {
              "replace": "apps/{{DOMAIN}}/{{APP_NAME}}/src/environments/environment.ts",
              "with": "apps/{{DOMAIN}}/{{APP_NAME}}/src/environments/environment.prod.ts"
            }
          ],
          "budgets": [
            { "type": "initial", "maximumWarning": "500kb", "maximumError": "1mb" },
            { "type": "anyComponentStyle", "maximumWarning": "4kb", "maximumError": "8kb" }
          ],
          "outputHashing": "all"
        },
        "development": {
          "optimization": false,
          "extractLicenses": false,
          "sourceMap": true
        }
      },
      "defaultConfiguration": "production"
    },
    "serve": {
      "continuous": true,
      "executor": "@angular/build:dev-server",
      "options": {
        "port": {{PORT}}
      },
      "configurations": {
        "production": {
          "buildTarget": "{{PROJECT_NAME}}:build:production"
        },
        "development": {
          "buildTarget": "{{PROJECT_NAME}}:build:development"
        }
      },
      "defaultConfiguration": "development"
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "serve-static": {
      "continuous": true,
      "executor": "@nx/web:file-server",
      "options": {
        "buildTarget": "{{PROJECT_NAME}}:build",
        "staticFilePath": "dist/apps/{{DOMAIN}}/{{APP_NAME}}/browser",
        "spa": true
      }
    }
  }
}
```

---

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{{APP_TITLE}}</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

---

### `styles.css`

Copy verbatim from `apps/nasheed/admin/src/styles.css`. It contains the complete design token system, dark mode, RTL support, Tailwind setup, and scrollbar styles shared by all admin apps.

---

## Validation Checklist

Before declaring the app complete, verify every item:

- [ ] `tenantId` in `environment.ts` set manually — no localStorage, no hardcoded strings in code
- [ ] `tsconfig.app.json` has correct `rootDir` for nesting depth
- [ ] `project.json` has unique `port` under `serve.options`
- [ ] `project.json` `sourceRoot` matches actual folder path
- [ ] Every route in `app.routes.ts` has `resolve: { translations: translationResolver }`
- [ ] `pages.routes.ts` dashboard has `canActivate: [authGuard]`
- [ ] `pages.routes.ts` identity has `canActivate: [authGuard, roleGuard]`
- [ ] `pages.component.ts` identity children include **users, roles, AND claims**
- [ ] `app.ts` reads tenantId from `this._environment.tenantId`
- [ ] `app.html` has only `<router-outlet>` and `<z-toaster>`
- [ ] Login component delegates to `<shared-login>` from `@ihsan/shared`
- [ ] `nx serve {{PROJECT_NAME}}` starts without errors
- [ ] `nx build {{PROJECT_NAME}}` completes without errors

Remember to always verify that the generated application builds successfully and that all core functionality works as expected before considering the task complete.
