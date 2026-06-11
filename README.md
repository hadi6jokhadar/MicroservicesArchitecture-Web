# MicroservicesArchitecture-Web — Angular 21 Frontend

A signals-first, standalone-component Angular 21 frontend built on an Nx monorepo. Admin dashboard and app interfaces for a multi-tenant SaaS platform — real-time updates, full RTL/Arabic support, and a custom UI component library.

---

## What's Inside

```
apps/
├── admin/    (port 4200)  — Admin dashboard with CRUD pages, reporting, management
└── nasheed/              — Nasheed domain app with audio playback

libs/
├── core/     — Auth guards, HTTP interceptors, global services, pipes
├── nasheed/  — Nasheed-specific shared components
├── shared/   — Reusable components, utilities, directives
└── ui/       — Zardui component wrapper + icon registration
```

---

## Architecture Highlights

**Signals-Only State**
No NgRx, no BehaviorSubject stores. State lives in `signal()` and `computed()` — components are reactive by construction. `effect()` handles side effects. RxJS is limited to HTTP streams.

**Standalone Components**
Zero NgModules. Every component, directive, and pipe is standalone with explicit imports. Lazy-loaded routes use `loadComponent()`.

**Typed Reactive Forms**
All forms use `FormGroup<{...}>` with explicit types — no `any`, no `ngModel`. Validators are composable and localized.

**Zardui UI Library (43+ components)**
Purpose-built component library imported exclusively from `@ihsan/ui`. Covers forms, tables, dialogs, sheets, alerts, toasts, navigation, and more — all RTL-aware and accessibility-first.

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
| Real-Time | SignalR Client |
| Audio | WaveSurfer.js + Tone.js |
| Charts | Chart.js |
| i18n | Custom en/ar translation system |

---

## Running the Frontend

**Prerequisites:** Node.js 20+, npm

```bash
# Install dependencies
npm install

# Start the admin app
npx nx serve admin

# Start the Nasheed app
npx nx serve nasheed
```

Admin app runs at `http://localhost:4200`.

Set your backend base URLs in `apps/admin/src/environments/environment.ts` before running.

---

## Key Features

**Full RTL + Arabic Support**
CSS logical properties are used throughout (`margin-inline-start`, `inset-inline-start`, `text-align: start`). `RtlService` handles dynamic context switching. All UI text is driven by `en.json` / `ar.json` translation files — zero hardcoded strings.

**Real-Time Notifications**
SignalR client connects to the Notification service, subscribing to per-user and per-tenant groups. Toast notifications surface updates instantly without polling.

**Audio Playback (Nasheed)**
WaveSurfer.js renders waveforms, Tone.js handles synthesis, and WebM Muxer enables recording — all integrated into Angular's signal-based component model.

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

---

> Full component API reference: [`Doc/ZARDUI_AI_REFERENCE.md`](Doc/ZARDUI_AI_REFERENCE.md)
> Translation system guide: [`Doc/TRANSLATION_SYSTEM_GUIDE.md`](Doc/TRANSLATION_SYSTEM_GUIDE.md)
