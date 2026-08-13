# Library Structure Guide

## Overview

The MicroservicesArchitecture-Web project uses a **modular library structure** based on **Nx monorepo best practices**. The separation of libraries follows the principle of **separation of concerns** and **clean architecture**.

## Libraries

### 📦 Core Library (`libs/core`)

**Purpose:** Application business logic, state management, and feature-specific services.

**Contains:**

- `services/` — Feature-specific application services (e.g. `navigation-loading.service.ts`, `page-title.service.ts`)
- `guards/` — Route guards for authentication and authorization
- `interceptors/` — HTTP interceptors for request/response handling (`correlation-id`, `localization`, `tenant`)
- `models/` — Data models and interfaces
- `core/` — App shell/root component (`core.ts`) and the `environment.token.ts` DI token used to inject `environment.apiUrls.*` throughout `libs/core`
- `ai-chat/` — AI chat service and related logic
- `ai-settings/` — AI settings management
- `ai-system-prompts/` — AI system prompts handling
- `app-settings/` — Application-wide settings service
- `audit-log/` — Audit log query/service logic
- `background-jobs/` — Background job status/tracking service
- `backup/` — Backup service client (Backup microservice, port 5010)
- `category/` — Category service
- `feature-flags/` — Feature flags directive, guard, and service (see `Doc/FEATURE_FLAGS_GUIDE.md`)
- `identity/` — Identity and authentication services
- `file-manager/` — File management business logic
- `notification/` — Notification services
- `tenant/` — Tenant context and management
- `translation/` — Translation service

**Note on resolvers:** there is no top-level `resolvers/` folder — each resolver is colocated inside its owning feature folder (e.g. `ai-chat/ai-chat.resolver.ts`, `identity/profile.resolver.ts`, `tenant/tenant.resolver.ts`, `translation/translation.resolver.ts`, `backup/backup.resolver.ts`, `feature-flags/feature-flag.resolver.ts`, `ai-settings/ai-settings.resolver.ts`, `ai-system-prompts/ai-system-prompts.resolver.ts`), not grouped separately.

**Key Characteristics:**

- ✅ Independent and self-contained
- ✅ No UI components (pure business logic)
- ✅ Can be tested without Angular dependencies
- ✅ Depends on backend APIs
- ❌ Should NOT depend on `shared` library

**Example Usage:**

```typescript
// In a component
import { AuthService } from '@ihsan/core';

export class LoginComponent {
  private authService = inject(AuthService);
}
```

---

### 🎨 Shared Library (`libs/shared`)

**Purpose:** Reusable UI components, directives, pipes, and utility functions.

**Contains:**

- `components/` — Reusable Angular components
  - `ai-chat/` — AI chat UI component
  - `ai-embedding/` — AI embedding component
  - `login/` — Login form component
  - `file-manager/` — File manager UI with upload, inline audio preview for music files, direct file removal, and close-time preview playback cleanup
    - `audio-editor-dialog/` — Pre-upload dialog: waveform trimming, audio enhancement, WebM/Opus encoding via Web Codecs API
  - `file-selector/` — File selection component
  - `forgot-password/` — Password recovery component
  - `register/` — Registration form component
  - `sidebar/` — Sidebar navigation component
- `directives/` — Custom Angular directives
- `pipes/` — Custom Angular pipes
- `interceptors/` — Shared HTTP interceptors
- `services/` — Shared utility services (not business logic)
- `utils/` — Helper functions and utilities

**Key Characteristics:**

- ✅ Generic and reusable across features
- ✅ Can depend on `core` for business logic
- ✅ Focused on presentation and UI
- ✅ No feature-specific logic
- ✅ Decoupled from business logic

**Example Usage:**

```typescript
// In a standalone component
import { LoginComponent, FileManagerComponent } from '@ihsan/shared';

@Component({
  imports: [LoginComponent, FileManagerComponent],
  // ...
})
export class AuthPageComponent {}
```

---

### 🖼️ UI Library (`libs/ui`)

**Purpose:** The Zardui (`z-*`) design-system wrapper — every low-level, generic, business-logic-free UI primitive used across `apps/admin`, `apps/nasheed/admin`, and `apps/polysnap/admin`. Imported exclusively via `@ihsan/ui`.

**Actual structure (`libs/ui/src/lib/zard/`):**

```
libs/ui/src/lib/zard/
├── components/              ← 44 component folders, one per Zardui primitive
│   ├── accordion/ alert/ alert-dialog/ avatar/ badge/ breadcrumb/
│   ├── button/ button-group/ calendar/ card/ carousel/ checkbox/
│   ├── combobox/ command/ date-picker/ dialog/ divider/ dropdown/
│   ├── empty/ form/ icon/ input/ input-group/ kbd/ layout/ loader/
│   ├── menu/ pagination/ popover/ progress-bar/ radio/ resizable/
│   ├── segmented/ select/ sheet/ skeleton/ slider/ switch/ table/
│   └── tabs/ toast/ toggle/ toggle-group/ tooltip/
├── core/                     ← shared internal wiring (index.ts)
├── services/                 ← cross-component services (e.g. dark-mode.ts)
├── utils/                    ← merge-classes.ts, number.ts helpers
├── index.ts                  ← barrel re-exporting every component
└── zard-quick-ref.md          ← selector + import-path quick reference for all 44 components
```

**Overlay/service-based components** (no host element selector — opened imperatively) each ship their own service + ref type colocated inside their component folder, not in a shared `services/` folder:

| Component      | Service                  | Ref type            |
| --------------- | ------------------------ | -------------------- |
| `dialog/`       | `ZardDialogService`      | `ZardDialogRef`      |
| `sheet/`        | `ZardSheetService`       | `ZardSheetRef`       |
| `alert-dialog/` | `ZardAlertDialogService` | `ZardAlertDialogRef` |
| `dropdown/`     | `ZardDropdownService`    | —                     |

**Icon registry:** `components/icon/icons.ts` exports the `ZARD_ICONS` map (Lucide icons, keyed by kebab-case name) and the derived `ZardIcon` type — see `Doc/ZARD_ICON_REFERENCE.md` for the full list and `.claude/instructions/Zardui-Strict.instructions.md` for the mandatory registration workflow before using a new icon name.

**Reference docs:** `Doc/ZARDUI_AI_REFERENCE.md` (full API per component) and `libs/ui/src/lib/zard/zard-quick-ref.md` (selectors + import paths) — read one of these before using any `z-*` selector.

---

### 🎵 Nasheed Shared Library (`libs/nasheed/shared`)

**Purpose:** App-specific shared library for the Nasheed product (`apps/nasheed/admin`, `apps/nasheed/web`) — business logic, models, and real-time services for songs, artists, ingestion jobs, generation, and search. Unlike `libs/core`/`libs/shared` (used by every app), this library is scoped to Nasheed only.

**Path alias:** `@web-app/nasheed-shared` (see `tsconfig.base.json` — note this does **not** follow the `@ihsan/*` naming convention used by the other libs).

**Contains (`libs/nasheed/shared/src/lib/nasheed-shared/`):**

- `services/` — `SongService`, `ArtistService`, `SearchService`, `IngestionJobService`, `GenerationService` (domain HTTP services, all base their URL on `environment.apiUrls.gateway`) plus `song-events.service.ts` / `artist-events.service.ts` / `ingestion-events.service.ts` (per-feature `dataChanged$` refetch buses that also subscribe to `SignalrService.notificationReceived` from `@ihsan/shared` and filter by the marker constants in `nasheed-realtime.constants.ts` — see `Doc/REALTIME_NOTIFICATIONS_GUIDE.md`)
- `models/` — `song.model.ts`, `artist.model.ts`, `generation.model.ts`, `ingestion-job.model.ts`, `favorite.model.ts`, `rating.model.ts`, `search-result.model.ts`, `paginated-list.model.ts`
- `enums/` — `song-state.enum.ts`, `ingestion-job-status.enum.ts`, `ingestion-job-type.enum.ts`, `search-index-status.enum.ts`
- `interfaces/` — query interfaces for songs, artists, ingestion jobs, and search
- `nasheed-shared.ts` (+ `.html`/`.scss`) — the library's placeholder root component, generated by Nx and not otherwise used

**Example Usage:**

```typescript
import { SongService, SongState } from '@web-app/nasheed-shared';
```

---

## Shared Component Reference

### AudioEditorDialogComponent

**Path:** `libs/shared/src/lib/components/file-manager/audio-editor-dialog/`  
**Selector:** `shared-audio-editor-dialog`  
**Opened by:** `FileManagerComponent` automatically when a user uploads an audio file.

#### Purpose

Pre-upload dialog that lets users trim an audio region and optionally apply audio enhancement before the file is sent to the backend.

#### Features

| Feature                    | Description                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| **Waveform visualization** | Uses WaveSurfer.js to render an interactive waveform of the source file                             |
| **Region trimming**        | Drag on the waveform to select start/end region; only the selected portion is exported              |
| **Mouse wheel zoom**       | Scroll on either waveform to zoom in/out; Reset Zoom button restores the default view               |
| **Audio enhancement**      | Optional toggle — applies +1.2x gain and −18 dB compression via Tone.js                             |
| **Enhanced preview**       | When enhancement is on, a second waveform shows the processed audio for A/B comparison              |
| **Close cleanup**          | Any active playback (original/enhanced) is paused and reset when the dialog closes or is destroyed  |
| **Progress steps**         | Submit shows labelled progress: Preparing → Decoding → Trimming → Enhancing → Encoding → Finalizing |
| **Selection metadata**     | Displays From / To / Length / estimated file size in real time                                      |
| **WebM/Opus encoding**     | Encodes via Web Codecs API + `webm-muxer`; timestamps are integer-arithmetic (no clock drift)       |

#### Encoding Details

- Output format: **WebM/Opus** (`audio/webm`)
- Sample rate: resampled to **48 000 Hz** if needed (Opus optimal rate)
- Bitrate: **192 kbps**
- Frame size: **960 samples** (20 ms standard Opus frame)
- Duration is exact — computed from `(frameOffset / sampleRate)` in microseconds, not from a wall clock
- No edits (no trim + no enhancement) → original `File` is returned unchanged, zero re-encoding cost

#### External Libraries

| Library                                     | Purpose                                                             |
| ------------------------------------------- | ------------------------------------------------------------------- |
| `wavesurfer.js`                             | Waveform rendering and playback                                     |
| `wavesurfer.js/dist/plugins/regions.esm.js` | Drag-to-select region plugin                                        |
| `tone`                                      | Audio enhancement (Gain + Compressor nodes via OfflineAudioContext) |
| `webm-muxer`                                | Mux encoded Opus packets into a WebM container in memory            |

#### Interfaces

```typescript
// Input — pass via zData when opening the dialog
export interface IAudioEditorDialogData {
  file: File;
}

// Output — received from dialogRef.afterClosed()
export interface IAudioEditorDialogResult {
  success: boolean;
  file?: File; // WebM/Opus file, or the original file if no edits were made
}
```

#### How FileManagerComponent Opens It

```typescript
// Triggered automatically for audio file uploads
private async openAudioEditorDialog(file: File): Promise<File | null> {
  const dialogRef = this._dialogService.create({
    zTitle: this._translationService.getCachedTranslation('fileManager.audioEditor.title'),
    zDescription: this._translationService.getCachedTranslation('fileManager.audioEditor.description'),
    zContent: AudioEditorDialogComponent,
    zData: { file } satisfies IAudioEditorDialogData,
    zHideFooter: true,
    zClosable: true,
    zWidth: '760px',
    zCustomClasses: 'z-dialog-max-width-100',
  });

  const result = await firstValueFrom(dialogRef.afterClosed()) as IAudioEditorDialogResult | undefined;
  return result?.success && result.file ? result.file : null;
}
```

#### Translation Keys

All keys are under the `fileManager.audioEditor.*` namespace:

| Key                                                                | Default Value                                               |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| `fileManager.audioEditor.title`                                    | Audio Editor                                                |
| `fileManager.audioEditor.description`                              | Select the audio region and apply enhancement before upload |
| `fileManager.audioEditor.original`                                 | Original                                                    |
| `fileManager.audioEditor.enhancedPreview`                          | Enhanced Preview                                            |
| `fileManager.audioEditor.enhancement`                              | Audio Enhancement                                           |
| `fileManager.audioEditor.enabled` / `.disabled`                    | Enabled / Disabled                                          |
| `fileManager.audioEditor.clearSelection`                           | Clear Selection                                             |
| `fileManager.audioEditor.resetZoom`                                | Reset Zoom                                                  |
| `fileManager.audioEditor.selectionHint`                            | Drag on the waveform to define region from and to.          |
| `fileManager.audioEditor.start` / `.end` / `.length` / `.fileSize` | From / To / Length / File Size                              |
| `fileManager.audioEditor.progress.preparing` … `.finishing`        | Step labels during submit                                   |
| `fileManager.audioEditor.messages.loadFailed`                      | Failed to load waveform…                                    |
| `fileManager.audioEditor.messages.processFailed`                   | Failed to process audio…                                    |

---

## Dependency Flow

The libraries follow a **strict dependency hierarchy**:

```
┌──────────────────────────────────────────┐
│         Application (Apps)               │
│    Uses both Core & Shared               │
└──────────────────────────────────────────┘
           ↑                    ↑
           │                    │
    ┌──────┴────────┐    ┌──────┴─────────┐
    │               │    │                │
┌───┴────┐    ┌─────┴───┐  ┌──────────────┴──┐
│  Core   │    │ Shared  │  │    UI (opt.)   │
│ (Logic) │    │(Reusable)   │ (Generic)      │
└───┬────┘    │Components│  └────────────────┘
    │         │  & Utils │
    └─────────┘
         ↓
    ┌─────────────┐
    │ Nx Core     │
    │ Angular     │
    └─────────────┘
```

**Rules:**

- ✅ `Core` → can only depend on Nx/Angular core
- ✅ `Shared` → can depend on `Core` + Nx/Angular
- ✅ `UI` → can only depend on Nx/Angular
- ❌ `Core` → should NOT depend on `Shared`
- ❌ `Shared` → should NOT depend on application modules

---

## Why NOT Combine Them?

### ❌ What Would Happen If Combined

```
libs/common/src/lib/
├── login-component.ts              ← UI
├── register-component.ts           ← UI
├── auth.service.ts                 ← Business logic
├── file-selector.component.ts      ← UI
├── file-manager.service.ts         ← Business logic  (MIXED!)
├── ai-chat-service.ts              ← Business logic
├── ai-chat-component.ts            ← UI
└── ...                            → CHAOS!
```

**Problems:**
| Problem | Impact |
|---------|--------|
| **Circular Dependencies** | `Core` wants to use `Shared` utilities, `Shared` wants to use `Core` services → circular dependency |
| **Unclear Organization** | Developers don't know where to add new code |
| **Harder Maintenance** | Large files, mixed concerns, difficult refactoring |
| **Reduced Reusability** | Components coupled to business logic can't be reused |
| **Team Scalability** | Teams step on each other's toes |
| **Bundle Size** | Everything gets bundled together, harder to optimize |

---

## Why Separation is Better

| Benefit                   | Explanation                                                                   |
| ------------------------- | ----------------------------------------------------------------------------- |
| **Clear Separation**      | Business logic ≠ UI components. Different purposes.                           |
| **Single Responsibility** | Each library has one reason to change.                                        |
| **Dependency Direction**  | Always flows one way: `App` → `Shared` → `Core` → Framework. No cycles.       |
| **Reusability**           | `Shared` components can be used in multiple `Core` services without coupling. |
| **Testability**           | Business logic in `Core` is easy to unit test without mocking UI.             |
| **Team Independence**     | Backend devs work on `Core`, frontend devs work on `Shared`.                  |
| **Scalability**           | As project grows, boundaries stay clear.                                      |
| **Nx Best Practice**      | Follows official Nx and Angular architecture guidelines.                      |

---

## File Organization Within Each Library

### Core Library Structure

```
libs/core/
├── src/
│   ├── lib/
│   │   ├── ai-chat/
│   │   │   ├── ai-chat.service.ts
│   │   │   ├── ai-chat.resolver.ts
│   │   │   ├── models.ts
│   │   │   └── index.ts
│   │   ├── ai-settings/          ← AI settings service + resolver
│   │   ├── ai-system-prompts/    ← AI system prompts service + resolver
│   │   ├── app-settings/         ← app-wide settings service
│   │   ├── audit-log/            ← audit log query/service logic
│   │   ├── background-jobs/      ← background job status/tracking service
│   │   ├── backup/               ← Backup microservice client + resolver
│   │   ├── category/             ← category service
│   │   ├── core/                 ← app shell component + environment.token.ts
│   │   ├── feature-flags/        ← feature flags directive, guard, service, resolver
│   │   ├── file-manager/         ← file management business logic
│   │   ├── notification/         ← notification services
│   │   ├── tenant/                ← tenant context + resolver
│   │   ├── translation/          ← translation service + resolver
│   │   ├── identity/
│   │   │   ├── auth.service.ts
│   │   │   ├── profile.resolver.ts
│   │   │   └── index.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── index.ts
│   │   ├── interceptors/
│   │   │   ├── correlation-id.interceptor.ts
│   │   │   ├── localization.interceptor.ts
│   │   │   ├── tenant.interceptor.ts
│   │   │   └── index.ts
│   │   ├── models/
│   │   │   └── common.ts
│   │   ├── services/
│   │   │   ├── navigation-loading.service.ts
│   │   │   ├── page-title.service.ts
│   │   │   └── ...
│   │   └── index.ts
│   ├── index.ts          ← Public API
│   └── test-setup.ts
├── project.json
├── tsconfig.json
└── jest.config.ts
```

> There is no separate `resolvers/` folder — resolvers live inside their owning feature folder (see the "Note on resolvers" callout above).

### Shared Library Structure

```
libs/shared/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   ├── login.component.scss
│   │   │   │   └── index.ts
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── sidebar/
│   │   │   ├── ai-chat/
│   │   │   ├── ai-embedding/
│   │   │   ├── file-selector/
│   │   │   ├── file-manager/
│   │   │   │   └── audio-editor-dialog/   ← see "Shared Component Reference" below
│   │   │   └── index.ts
│   │   ├── features/                       ← full cross-app features (shell + pages + dialogs), not just components
│   │   │   └── identity/
│   │   │       ├── identity.routes.ts      ← exported route constant, e.g. `identityRoutes`
│   │   │       ├── identity.component.ts   ← feature shell
│   │   │       ├── users/                  ← list page + add/edit dialogs
│   │   │       ├── roles/                  ← list page + add/edit/manage-claims dialogs
│   │   │       ├── claims/                 ← list page + add/edit dialogs
│   │   │       └── index.ts                ← re-exports the routes
│   │   ├── directives/
│   │   │   ├── highlight.directive.ts
│   │   │   └── index.ts
│   │   ├── pipes/
│   │   │   ├── date-format.pipe.ts
│   │   │   └── index.ts
│   │   ├── interceptors/
│   │   │   ├── error.interceptor.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── logger.service.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts          ← Public API
├── project.json
├── tsconfig.json
└── jest.config.ts
```

> See `.claude/instructions/Angular.instructions.md` section 2a for the rule on when a feature belongs in `features/` vs `components/`, and why files inside `libs/shared` must import sibling lib code via relative paths (not `@ihsan/shared`).

---

## Best Practices

### ✅ DO

- ✅ Keep `Core` completely free of UI components
- ✅ Keep `Shared` components generic and reusable
- ✅ Use barrel exports (`index.ts`) for clean imports
- ✅ Test `Core` services independently
- ✅ Document service interfaces in `Core`
- ✅ Organize `Shared` by component type (components/, directives/, pipes/)
- ✅ Use dependency injection for services

### ❌ DON'T

- ❌ Don't import from `Shared` in `Core` services
- ❌ Don't put feature-specific components in `Shared`
- ❌ Don't add business logic to `Shared` components
- ❌ Don't create deeply nested folder structures
- ❌ Don't export everything; keep public APIs clean
- ❌ Don't mix UI and logic in the same file

---

## Importing from Libraries

### Correct Way (Using Barrel Exports)

```typescript
// ✅ Clean and organized
import { AuthService, AuthGuard } from '@ihsan/core';
import { LoginComponent, RegisterComponent } from '@ihsan/shared';
```

### Why This Works

The `index.ts` (barrel export) in each library acts as a **public API**:

```typescript
// libs/core/src/index.ts
export * from './lib/identity/auth.service';
export * from './lib/guards/auth.guard';
export * from './lib/ai-chat/ai-chat.service';

// libs/shared/src/index.ts
export * from './lib/components/login/login.component';
export * from './lib/components/register/register.component';
```

---

## When to Create a New Library

Add a new library when:

- 📦 Code is **reusable across multiple projects**
- 🎯 Code has a **clear, single purpose**
- 📚 Code is **large enough to warrant its own library** (not just 2-3 files)
- 🔗 Dependencies are **minimal and clear**

**Example:** If you had a "Reports" feature used across multiple apps, create `libs/reports`.

---

## Summary

| Aspect          | Core                     | Shared                        |
| --------------- | ------------------------ | ----------------------------- |
| **Purpose**     | Business logic & state   | Reusable UI & utilities       |
| **Depends On**  | Nx/Angular only          | Core + Nx/Angular             |
| **Contains**    | Services, guards, models | Components, directives, pipes |
| **Coupling**    | Feature-coupled          | Decoupled/generic             |
| **Testing**     | Unit tests               | Component tests               |
| **Reusability** | Feature-specific         | Cross-app                     |

**Bottom Line:** The current structure is **correct and follows best practices**. Maintain this separation to keep the codebase clean, scalable, and maintainable.

---

**Last Updated:** May 2026
