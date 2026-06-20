# Feature Flags — Frontend Guide

Feature flags are stored per-tenant inside `TenantConfiguration.featureFlags` (a `Record<string, boolean>` JSON blob). The frontend exposes them through `FeatureFlagService`, a structural directive (`*featureFlag`), and a route guard — all importable from `@ihsan/core`.

> **Backend guide:** `MicroservicesArchitecture/Doc/FEATURE_FLAGS_GUIDE.md`

---

## Quick Reference

| Need | What to use |
|---|---|
| Hide/show a block in HTML | `*featureFlag="'flagName'"` directive |
| Guard a route | `featureFlagGuard` + `data: { featureFlag: '...' }` |
| Read a flag in TypeScript | `FeatureFlagService.isEnabled(flagName)` |
| Reactive signal for a flag | `FeatureFlagService.isEnabledSignal(flagName)` |
| Load flags at app startup (admin app) | `featureFlagResolver` on the root route (already configured) |

---

## Flag Constants

Always use the constants from `@ihsan/core` — never inline strings:

```typescript
import { FeatureFlags } from '@ihsan/core';

FeatureFlags.AiChatEnabled          // 'aiChatEnabled'
FeatureFlags.NasheedIngestionEnabled // 'nasheedIngestionEnabled'
```

---

## Loading Flags at App Startup

Flags are loaded automatically — you do not need to call `setFlags()` manually in components. The mechanism differs by app type:

### Admin app (multi-tenant — `apps/admin`)

Flags are loaded via `featureFlagResolver` (wired in `app.routes.ts`) plus a reactive `FeatureFlagLoaderService` that reloads after login/logout.

**`featureFlagResolver`** — runs on every route activation at startup. Import from `@ihsan/core` and add to the route's `resolve` map:

```typescript
import { featureFlagResolver, translationResolver } from '@ihsan/core';

// In appRoutes:
{
  path: '',
  component: PagesComponent,
  resolve: { translations: translationResolver, featureFlags: featureFlagResolver },
}
```

**Tenant ID resolution order (inside `featureFlagResolver`):**
1. `environment.tenantId` — set for per-tenant apps (e.g. Nasheed).
2. `AuthService.getTenantId()` — reads `localStorage`. Populated by a tenant-selection flow or per-tenant init.
3. Neither found → calls `GET /api/v1/tenant/feature-flags` with no `tenantId` param → backend returns system defaults.

**`FeatureFlagLoaderService`** — a root-level service whose constructor `effect()` watches `AuthService.currentUser()` and reloads flags after login/logout. It is injected automatically; no manual registration needed.

**Backend endpoint:** `GET /api/v1/tenant/feature-flags?tenantId={optional}` — public, no auth required. Returns `Record<string, boolean>`.

### Per-tenant app (e.g. Nasheed)

The tenant ID is fixed in `environment.tenantId`, so use a simpler initializer:

```typescript
import { APP_INITIALIZER } from '@angular/core';
import { TenantService, FeatureFlagService, ENVIRONMENT } from '@ihsan/core';
import { tap } from 'rxjs';

// In appConfig.providers:
{
  provide: APP_INITIALIZER,
  useFactory: (tenantService: TenantService, flagService: FeatureFlagService, env: IEnvironment) =>
    () => tenantService
      .getTenantConfig(env.tenantId)
      .pipe(tap((config) => flagService.setFlags(config.data?.featureFlags))),
  deps: [TenantService, FeatureFlagService, ENVIRONMENT],
  multi: true,
},
```

---

## HTML Directive — `*featureFlag`

Import `FeatureFlagDirective` from `@ihsan/core` and add it to the component's `imports` array.

```typescript
import { FeatureFlagDirective, FeatureFlags } from '@ihsan/core';

@Component({
  standalone: true,
  imports: [FeatureFlagDirective],
})
export class MyComponent {
  readonly Flags = FeatureFlags;
}
```

### Basic usage

```html
<button *featureFlag="Flags.AiChatEnabled" z-button (click)="openChat()">
  AI Chat
</button>
```

### With `else` template

```html
<div *featureFlag="Flags.AiChatEnabled; else chatDisabled">
  <app-ai-chat />
</div>

<ng-template #chatDisabled>
  <z-alert zType="info">AI Chat is not enabled for your account.</z-alert>
</ng-template>
```

### Default value

By default, `isEnabled()` returns `true` when the flag is absent (preserves existing behavior for tenants with no flags configured). To require an explicit `true` (treat absence as disabled):

```html
<!-- Show only when explicitly enabled (absence = disabled) -->
<div *featureFlag="Flags.NasheedIngestionEnabled">
  <app-ingestion-panel />
</div>
```

The service's `defaultValue` is `true` — to override it, use the service directly in TypeScript and pass `false`:

```typescript
readonly isIngestionVisible = this._flags.isEnabledSignal(
  FeatureFlags.NasheedIngestionEnabled,
  false // absence = disabled
);
```

---

## Route Guard — `featureFlagGuard`

Protect a route so it redirects when the flag is disabled.

### Route definition

```typescript
import { featureFlagGuard, FeatureFlags } from '@ihsan/core';

{
  path: 'ai-chat',
  loadComponent: () => import('./ai-chat/ai-chat.component'),
  canActivate: [authGuard, featureFlagGuard],
  data: {
    featureFlag: FeatureFlags.AiChatEnabled,
    featureFlagRedirect: '/dashboard',   // optional — defaults to '/'
    featureFlagDefault: true,            // optional — defaults to true
  },
},
```

### Guard behavior

| Scenario | Result |
|---|---|
| `featureFlag` not set in `data` | Always allows navigation |
| Flag is `true` in tenant config | Allows navigation |
| Flag is `false` in tenant config | Redirects to `featureFlagRedirect` (default `/`) |
| Flag absent in config | Uses `featureFlagDefault` (default `true`) |

---

## Service API — `FeatureFlagService`

```typescript
import { FeatureFlagService, FeatureFlags } from '@ihsan/core';

@Component({ ... })
export class MyComponent {
  private readonly _flags = inject(FeatureFlagService);

  // Synchronous boolean check (use inside methods/computed)
  isAiEnabled = this._flags.isEnabled(FeatureFlags.AiChatEnabled);

  // Reactive computed signal (use in templates or effects)
  aiEnabled = this._flags.isEnabledSignal(FeatureFlags.AiChatEnabled);

  // Populate flags after fetching tenant config
  init(config: ITenantConfig): void {
    this._flags.setFlags(config.data?.featureFlags);
  }
}
```

Template with reactive signal:

```html
@if (aiEnabled()) {
  <app-ai-chat />
}
```

---

## Adding a New Flag

1. **Backend:** Add the constant to `IhsanDev.Shared.Application/Constants/FeatureFlags.cs` and guard the feature (see backend guide).
2. **Frontend:** Add to `FeatureFlags` constant in `libs/core/src/lib/feature-flags/feature-flags.constants.ts`:

```typescript
export const FeatureFlags = {
  AiChatEnabled: 'aiChatEnabled',
  NasheedIngestionEnabled: 'nasheedIngestionEnabled',
  MyNewFeature: 'myNewFeature',   // ← add here
} as const;
```

3. **Admin UI:** Add a `z-switch` row in `tenant-configuration-sheet.component.ts` — the `knownFlags` array drives the UI automatically (see the component).

---

## Current Flags

| Constant | Key | Default | Guarded in |
|---|---|---|---|
| `FeatureFlags.AiChatEnabled` | `aiChatEnabled` | `true` | `GenerateLyricsCommandHandler` |
| `FeatureFlags.NasheedIngestionEnabled` | `nasheedIngestionEnabled` | `true` | `NasheedIngestionWorker` |
| `FeatureFlags.IsBackgroundJobPageEnabled` | `isBackgroundJobPageEnabled` | `true` | Sidebar items (jobs group) |
| `FeatureFlags.IsAuditLogPageEnabled` | `isAuditLogPageEnabled` | `true` | Sidebar item + `/audit-log` route guard |

---

## What NOT to Do

| ❌ Wrong | ✅ Correct |
|---|---|
| `*featureFlag="'aiChatEnabled'"` (inline string) | `*featureFlag="Flags.AiChatEnabled"` |
| Call `getTenantConfig()` per-component just to check a flag | Call `setFlags()` once at app init; read synchronously |
| Use `@if` with direct service call in template expression | Use `isEnabledSignal()` for reactive template checks |
| Implement your own flag logic in a component | Always use `FeatureFlagService` |
