# MicroservicesArchitecture-Web — Angular 21 Frontend

A signals-first, standalone-component Angular 21 frontend built on an Nx monorepo. Admin dashboards for a multi-tenant SaaS platform — real-time updates, full RTL/Arabic support, feature flags, and a custom UI component library.

---

## What's Inside

```
apps/
├── admin/            (port 4200) — Main platform admin: identity, tenant, category,
│                                   translation, notification, audit log, backup, AI chat/settings
├── nasheed/
│   ├── admin/        (port 4300) — Nasheed (audio) domain admin: artists, songs, ingestion, search
│   └── web/          (port 4301) — Scaffold only, not yet implemented
└── polysnap/
    └── admin/        (port 4302) — PolySnap proof-of-concept: freehand map-shape → polygon detection

libs/
├── core/     — Auth guards, HTTP interceptors, and one subfolder per backend domain
│               (identity, tenant, notification, translation, category, file-manager,
│               backup, audit-log, background-jobs, app-settings, feature-flags, ai-*)
├── shared/   — Reusable components, directives, pipes, interceptors, utils, and
│               libs/shared/src/lib/features/ — full shared features (e.g. identity)
│               reused unchanged across multiple apps
├── nasheed/shared/ — Nasheed-specific shared components/services (also home of the
│               reference real-time listener pattern, see Key Features below)
└── ui/       — Zardui component wrapper + icon registration
```

`apps/nasheed/` and `apps/polysnap/` each contain multiple Nx projects, not a single flat app.

---

## Architecture Highlights

**Signals-Only State**
No NgRx, no BehaviorSubject stores. State lives in `signal()` and `computed()` — components are reactive by construction. `effect()` handles side effects. RxJS is limited to HTTP streams.

**Standalone Components**
Zero NgModules. Every component, directive, and pipe is standalone with explicit imports. Lazy-loaded routes use `loadComponent()`.

**Typed Reactive Forms**
All forms use `FormGroup<{...}>` with explicit types — no `any`, no `ngModel`. Validators are composable and localized.

**Zardui UI Library (44 components)**
Purpose-built component library imported exclusively from `@ihsan/ui`. Covers forms, tables, dialogs, sheets, alerts, toasts, navigation, and more — all RTL-aware and accessibility-first.

**Shared Feature Libraries**
A full feature (shell + list pages + dialogs, not just a component) that's reused unchanged across apps lives in `libs/shared/src/lib/features/<name>/` — e.g. `identity`, consumed by `admin`, `nasheed-admin`, and `polysnap-admin` alike via a single exported route constant.

**Feature Flags**
Per-tenant feature flags drive what functionality is visible/enabled in a given app, via a service, structural directive, route guard, and resolver in `libs/core/src/lib/feature-flags/`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21.1 |
| Language | TypeScript 5.9 (strict, no `any`) |
| Monorepo | Nx 22.3 |
| UI Library | Zardui (@ihsan/ui) |
| Icons | Lucide Angular |
| Styling | TailwindCSS 4 + SCSS |
| State | Angular Signals |
| Real-Time | SignalR Client 10 |
| RxJS | 7.8 (HTTP streams only) |
| Audio | WaveSurfer.js + Tone.js |
| Charts | Chart.js |
| Maps (PolySnap) | Leaflet + Turf.js + html2canvas-pro |
| i18n | Custom en/ar translation system |

---

## Running the Frontend

**Prerequisites:** Node.js 20+, npm

```bash
# Install dependencies
npm install

# Start the main admin app
npx nx serve admin

# Start the Nasheed admin app
npx nx serve nasheed-admin

# Start the PolySnap admin app (proof-of-concept)
npx nx serve polysnap-admin
```

| App | URL |
|---|---|
| admin | `http://localhost:4200` |
| nasheed-admin | `http://localhost:4300` |
| polysnap-admin | `http://localhost:4302` |

Set your backend base URLs in each app's `src/environments/environment.ts` before running.

---

## Key Features

**Full RTL + Arabic Support**
CSS logical properties are used throughout (`margin-inline-start`, `inset-inline-start`, `text-align: start`). `RtlService` handles dynamic context switching. All UI text is driven by translation keys fetched live from the Translation microservice — zero hardcoded strings.

**Real-Time Notifications**
`SignalrService`/`BaseSignalrService` (`libs/shared`) hold the app-wide SignalR connection and expose every push via `notificationReceived`. A domain feature that needs to react to one specific event injects `SignalrService` into its own state service and filters by a marker in the payload, rather than modifying the shared connection — see [`Doc/REALTIME_NOTIFICATIONS_GUIDE.md`](Doc/REALTIME_NOTIFICATIONS_GUIDE.md) and the reference implementation in `libs/nasheed/shared`.

**Feature Flags**
Tenant-driven flags gate features at the service, directive, guard, or route-resolver level — see [`Doc/FEATURE_FLAGS_GUIDE.md`](Doc/FEATURE_FLAGS_GUIDE.md).

**Audio Playback (Nasheed)**
WaveSurfer.js renders waveforms, Tone.js handles synthesis, and WebM Muxer enables recording — all integrated into Angular's signal-based component model.

**Spatial Polygon Detection (PolySnap)**
A proof-of-concept using Leaflet for map rendering, `html2canvas-pro` for pixel capture, and Turf.js for geometry — see [`../Doc/POLYSNAP_PROJECT_OVERVIEW.md`](../Doc/POLYSNAP_PROJECT_OVERVIEW.md).

**Error Handling Convention**
- Transient results → `z-toast` (ngx-sonner)
- Page-level messages → `z-alert`
- Destructive confirmations → `ZardAlertDialogService.confirm()`
- Form errors → inline via `z-form` error slot

---

## Component Patterns

Every CRUD page follows a consistent structure:

1. **State service** — typed signals, HTTP calls, pagination state
2. **Table** — `z-table` with server-side pagination and filters
3. **Add/Edit dialog** — `ZardDialogService` with typed `FormGroup`
4. **View sheet** — `ZardSheetService` for detail panels
5. **i18n** — every key in both `en.json` and `ar.json`

Live demos of every Zardui component pattern live in `apps/admin/src/app/pages/test-components/`.

---

## Documentation

| File | Purpose |
|---|---|
| [`Doc/DOCUMENTATION_INDEX.md`](Doc/DOCUMENTATION_INDEX.md) | Full documentation index |
| [`Doc/ZARDUI_AI_REFERENCE.md`](Doc/ZARDUI_AI_REFERENCE.md) | Complete Zardui component API reference |
| [`Doc/TRANSLATION_SYSTEM_GUIDE.md`](Doc/TRANSLATION_SYSTEM_GUIDE.md) | Translation + RTL support |
| [`Doc/DIALOG_DESIGN_GUIDE.md`](Doc/DIALOG_DESIGN_GUIDE.md) | Dialog component patterns |
| [`Doc/FEATURE_FLAGS_GUIDE.md`](Doc/FEATURE_FLAGS_GUIDE.md) | Feature flags directive, guard, and service |
| [`Doc/REALTIME_NOTIFICATIONS_GUIDE.md`](Doc/REALTIME_NOTIFICATIONS_GUIDE.md) | SignalR connection pattern and domain listener extension |
