# Angular Workflow & Rules

## Agent Mindset

You must act as a **Senior Angular Engineer** specializing in:

1. **Nx Monorepos**
2. **Modern Angular (Signals-first, Standalone Components)**
3. **Strict i18n/RTL Compliance**
4. **Zardui Component Library Usage**

## MANDATORY PRE-CHECKLIST

Before writing ANY frontend code, you MUST:

1. **Check Translations:** Verify if relevant keys exist in `apps/admin/src/assets/i18n/{en,ar}.json`. If not, plan to add them. **NEVER HARDCODE TEXT.**
2. **Verify Icons:** If adding an icon, SEARCH `ZARD_ICONS` to confirm it exists. Do not guess.
3. **Consult Zardui:** Read `MicroservicesArchitecture-Web/Doc/ZARDUI_AI_REFERENCE.md` if using UI components.
4. **Review Dialog Patterns:** If creating a modal, read `MicroservicesArchitecture-Web/Doc/DIALOG_DESIGN_GUIDE.md` first.

## Architectural Rules

### 1. Component Structure (Strict Separation)

- **Files:** `.ts` (logic), `.html` (template), `.scss` (styles). **NO INLINE TEMPLATES/STYLES.**
- **Colocation:** Keep related files (`.service.ts`, `.model.ts`) in the same folder as the component.
- **Naming:**
  - Models: `IUser` (interface) and `UserClass` (class).
  - Signals: `userId = input.required<string>();` (NO `@Input`).
  - Outputs: `onSave = output<void>();` (NO `@Output`).

### 2. Internationalization (i18n) & RTL

- **Text:** ALWAYS use `{{ 'key' | translate }}`.
- **Keys:** Add to **BOTH** `en.json` and `ar.json`.
  - Format: `component.element` (e.g., `user.dialog.submit`).
- **CSS:** WAR ON PHYSICAL PROPERTIES.
  - ❌ `margin-left`, `padding-right`, `left`, `text-align: left`
  - ✅ `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`
- **Dialogs/Sheets:** Inherit RTL automatically. Do NOT manually flip styles unless using `RtlService.getSheetSide()`.

### 2a. Shared Feature Libraries (cross-app UI reuse)

When a full feature (shell + list pages + dialogs, not just a component/directive/pipe) is used unchanged across multiple apps (`apps/admin`, `apps/nasheed/admin`, `apps/polysnap/admin`), it belongs in `libs/shared/src/lib/features/<name>/` with its own `<name>.routes.ts` and a local `index.ts` re-exporting the routes — see `libs/shared/src/lib/features/identity/` for the reference implementation.

- Export it from the top-level `libs/shared/src/index.ts` barrel (`export * from './lib/features/<name>';`) — never a subpath.
- Each consuming app imports only the route constant (e.g. `import { identityRoutes } from '@ihsan/shared';`) in its own `pages.routes.ts`, keeping the `path`/`canActivate`/`data` wiring in the app itself.
- **Inside** `libs/shared`, files must import sibling lib code (e.g. `error.interceptor`, `file-selector`) via **relative paths**, not `@ihsan/shared` — `@nx/enforce-module-boundaries` rejects a project importing its own barrel from within itself ("Projects should use relative imports to import from other files within the same project").
- When moving component files into `libs/shared/src/lib/features/<name>/` from an app folder, double-check every relative import (`../../../...`) — the new location has a different folder depth, so paths that resolved correctly in the app do NOT necessarily resolve from the lib, and esbuild only reports this as a hard build error, not a lint error.

### 2b. Real-Time (SignalR) Listeners

The app-wide hub connection lives in `libs/shared` (`SignalrService`/`BaseSignalrService`) and exposes `notificationReceived: Subject<SignalRNotification>` — every push, unfiltered. A feature that needs to react to a specific backend-pushed event (not just any notification) must **not** modify `libs/shared` to add domain-specific filtering. Instead, inject `SignalrService` from `@ihsan/shared` into that feature's own `providedIn: 'root'` events/state service (the same service that already exposes a `dataChanged$` refetch bus for manual mutations), subscribe in its constructor, and filter by a unique marker string inside the notification's JSON `data` payload. Reference: `libs/nasheed/shared/src/lib/nasheed-shared/services/ingestion-events.service.ts` + `nasheed-realtime.constants.ts`. Full guide: `Doc/REALTIME_NOTIFICATIONS_GUIDE.md`.

If the event fires frequently and shouldn't pop a toast per occurrence, the *backend* producer must set `"silent": true` inside that same `data` payload — `SignalrService` already checks for this marker and skips its toast while still emitting to `notificationReceived`. This is a backend-side decision, not something a frontend listener can control.

### 2c. Permission Claims (finer-grained than roles)

When a lower-privileged role needs access to a slice of a page/action that a plain role check is too coarse for (e.g. a "data entry" role that can create/edit but not delete), don't invent a new access-control mechanism — extend the existing role-adjacent pattern: `roleGuard` and `ISidebarPage`/`ISidebarUser` already accept a parallel `permissions?: string[]` alongside `roles?: string[]` (role-OR-permission, never AND — Admin must never need a claim too). `UserClass.permissions` is already the flattened source (`roles[].claims[]` filtered to `claimType === 'Permission'`). Action-level gating (hiding a specific button, not a whole page) has no directive yet — use a local `computed()` in the component. Full guide: `Doc/PERMISSIONS_GUIDE.md`. Backend half (how claims are created/assigned, as data via Identity's admin UI, no seeding): `MicroservicesArchitecture/Doc/SHARED_IDENTITY_SERVICE_GUIDE.md`.

### 3. State Management & Data Fetching

- **Signals Only:** Use `signal()`, `computed()`, and `effect()` over RxJS where possible for local state.
- **Dependency Injection:** `private _http = inject(HttpClient);` (No constructor injection).
- **Import Paths:** ALWAYS import from `@ihsan/core` or `@ihsan/shared`. **NEVER** subpaths like `@ihsan/core/auth`.

### 4. Error Handling (Context-Aware)

- **General Config:** Global error interceptor handles most errors via Toast.
- **Dialogs/Modals/Sheets:**
  - ✅ `toast.success()` IS correct on success — call it immediately before closing the dialog.
  - ❌ **NO inline success `<z-alert>`** — success uses toast and immediate close, not a displayed success message.
  - ✅ **ALWAYS** pass `new HttpContext().set(SKIP_ERROR_TOAST, true)` to every HTTP request inside a dialog/sheet — prevents the global error interceptor from showing a duplicate toast when an error occurs.
  - ✅ Display errors inline using `<z-alert zType="destructive">` and an `errorMessage` signal populated via `extractErrorMessage(error)` from `@ihsan/shared`.

## Common Pitfalls to Avoid

1. **Hardcoded Text:** Instant failure. Even purely structural text must be translated.
2. **Incorrect Icons:** Guessing icon names like "language" instead of "book-open".
3. **Missing SKIP_ERROR_TOAST in Dialogs/Sheets:** Every HTTP call inside a dialog or sheet MUST include `new HttpContext().set(SKIP_ERROR_TOAST, true)`. Omitting it causes the global error interceptor to fire a toast AND the inline `z-alert` to render — a double error display. Success toasts via `toast.success()` are correct and expected.
4. **API Calls in Parent:** API calls for creating/editing entities MUST happen inside the Dialog component, not the parent.
5. **Adding a translation key to `en.json`/`ar.json` does NOT make it render anywhere:** The `translate` pipe never reads those static files at runtime — every app fetches translations live from the Translation **microservice** (`TranslationService.getTranslations()` in `libs/core/src/lib/translation/translation.service.ts`, calling `{gateway}/api/v1/translations/{language}`), cached in a signal via a route resolver (see `Doc/TRANSLATION_SYSTEM_GUIDE.md`). The JSON files are only the documented source-of-truth for *authoring* new keys; a new key added there stays invisible (renders as the raw key, or falls back) until someone runs the "Import Translations" action (`apps/admin/src/app/features/translation/translations/import-dialog/`, or `POST /api/v1/translations/import`) to load it into the live Translation database. This is a live-data/operational step, not a code change — do not attempt to call the import API as part of a code task. When a task adds new translation keys, always flag in the final report that they still need to be imported before they'll display.
7. **Angular's default "inline critical CSS" build optimization is incompatible with a strict `script-src` CSP (no `'unsafe-inline'`) — and the symptom looks like a routing/caching bug, not a CSP one.** By default, `@angular/build:application` optimized builds emit the main stylesheet as `<link rel="stylesheet" href="styles-XXXX.css" media="print" onload="this.media='all'">` (non-render-blocking CSS loading) — but that inline `onload="..."` attribute is an inline event handler, which `script-src 'self'` (no `'unsafe-inline'`, no nonce/hash) blocks outright. When blocked, the `<link>` stays stuck at `media="print"` forever, so the stylesheet never actually applies — the page renders completely unstyled. This hit `apps/admin` and `apps/nasheed/admin` (both served via nginx with a strict CSP from the 2026-07 frontend security audit, `script-src 'self'` with no `'unsafe-inline'`) and looked exactly like a classic "SPA deep-link refresh breaks assets" bug (works at `/`, breaks after a hard refresh on `/tenant`) — `<base href="/">` was correctly set and `try_files` SPA fallback was correctly configured in `nginx.conf`, so those were red herrings; the real cause only showed up as a CSP violation in the browser console (`Executing inline event handler violates ... 'script-src''`). **Fixed** by setting `"optimization": {"styles": {"inlineCritical": false}, "scripts": true, "fonts": true}` on the Docker build configuration in `project.json` (both `apps/admin` and `apps/nasheed/admin`, plus `apps/nasheed/web`'s `production` configuration since it has no separate `docker` one) — this makes Angular emit a plain `<link rel="stylesheet" href="...">` with no inline handler, at the cost of the small render-blocking-CSS performance optimization. **Never fix this by adding `'unsafe-inline'` to `script-src`** — that reopens the exact class of vulnerability the CSP exists to close; disable the optimization instead. When adding a new Angular app behind a strict CSP, set `inlineCritical: false` on its build configuration from the start, or verify in DevTools Console (not just visually) that no CSP violations appear on a hard refresh before considering the CSP "done."
8. **A strict CSP's `script-src` also governs Worker creation via `blob:` URLs (falls back from `worker-src` when that directive isn't set) — a library that spawns a Web Worker (e.g. Tone.js, used for Nasheed audio features) will silently fail with `Creating a worker from 'blob:...' violates ... "script-src 'self'"` if `worker-src` isn't explicitly allowed.** Found in the same CSP audit as pitfall #7 above, in the same console log. **Fixed** by adding `worker-src 'self' blob:;` to both `apps/admin/nginx.conf` and `apps/nasheed/admin/nginx.conf`'s CSP header. When adding any library that uses Web Workers (audio processing, heavy computation, etc.) to an app behind a strict CSP, check for this class of console error and add `worker-src 'self' blob:` rather than loosening `script-src`.
9. **A strict CSP's `img-src`/`media-src` must list every origin that can serve a *locally-stored* (non-R2) file, not just `'self'` and the R2 wildcard — a file that was never uploaded to Cloudflare R2 only exists on whichever backend served it, and the browser loads it as a direct cross-origin request, not through the SPA's own HTTP client (which `connect-src` already covers).** `apps/admin` and `apps/nasheed/admin`'s CSP had `img-src 'self' data: https://*.r2.dev` and `media-src 'self' https://*.r2.dev` — correct for files that made it to R2, but FileManager's `Path`-based local files (see `Doc/BACKUP_SERVICE_GUIDE.md`'s file-storage migration section) are rendered as `<img src="http://ihsandev.gleeze.com:5005/...">`/`<audio src="...">` tags pointing directly at FileManager's own origin, which is neither `'self'` nor an R2 URL — the browser blocked every one of them (`Loading the image '...' violates ... "img-src 'self' data: https://*.r2.dev"`). Found in August 2026 after migrating local files from a dev machine that hadn't all been uploaded to R2 yet. **Fixed** by adding `http://ihsandev.gleeze.com:5005` (FileManager's port) to both `img-src` and `media-src` in both apps' `nginx.conf`, matching the entry `connect-src` already had for that same origin. **When adding this platform's CSP to a new frontend app, `img-src`/`media-src` need the same per-backend-origin entries as `connect-src` for any service that can serve raw file bytes directly (FileManager) — don't assume the R2 wildcard alone covers every possible file source.**
10. **`nx.json`'s `"@angular/build:application"` target must NOT have `dependsOn: ["^build"]`:** `apps/*/tsconfig.app.json` maps `@ihsan/ui`/`@ihsan/shared` directly to their **source** `.ts` files (`libs/ui/src/index.ts`, not `dist/libs/ui`), so Angular app builds (esbuild-based) compile the entire dependency graph from source directly — they never need `libs/ui`'s or `libs/shared`'s own `build` target (which uses `@nx/js:tsc`, a separate/stricter standalone compiler invocation meant for independently-publishable packages) to have run first. `dependsOn: ["^build"]` forced Nx to run those `tsc` builds as a blocking prerequisite anyway, and they fail: `shared` imports `@ihsan/ui` via path mapping, which pulls `libs/ui`'s `.ts` source files into `shared`'s own `tsc -p libs/shared/tsconfig.lib.json` compilation unit (since there are no TS project references / `composite: true` between them), and `tsc`'s strict `rootDir` containment check then rejects those pulled-in `ui` files as being outside `shared`'s project root (`TS6059: File X is not under rootDir libs/shared`). This was silently masked by Nx's build cache for months — it only surfaced when a build config was run for the first time with a cold cache (discovered via a new Docker `docker` build configuration, but reproduces identically with a plain `nx build admin --configuration=production --skip-nx-cache`, no Docker involved). **Fixed by removing `dependsOn: ["^build"]`** from `nx.json`'s `"@angular/build:application"` target defaults — Angular app builds no longer trigger `ui:build`/`shared:build` at all. If `ui`/`shared` are ever meant to become independently publishable packages, fix this properly instead via TS project references (`composite: true` on `ui`, `references` on `shared` pointing at it) rather than re-adding the blanket `dependsOn`.
11. **Every domain HTTP service must build its base URL from `environment.apiUrls.gateway` — never a direct per-service `environment.apiUrls['{service}']` port.** Every service in `libs/core` (`TenantService`, `CategoryService`, `TranslationService`, `AuthService`, etc.) already follows this; `libs/nasheed/shared`'s `SongService`/`ArtistService`/`SearchService`/`IngestionJobService`/`GenerationService` broke it by calling `environment.apiUrls['nasheed']` directly, which works in local dev (every port is open on `localhost`) and even from PC2 itself, but fails with `ERR_CONNECTION_REFUSED` for any real external user — the 9 backend service ports are bound to `127.0.0.1` only on the Docker host as of the July 2026 security audit (`MicroservicesArchitecture/Doc/DOCKER_DEPLOYMENT_GUIDE.md`, "Known limitations"). Only the Gateway port is reachable externally, and Gateway already has a YARP route for every domain path this platform exposes. Found and fixed August 2026 — see the Doc's "Nasheed's own domain services had this exact bug too" note. **When adding a new domain service to any `libs/{app}/shared` lib, base its URL on `environment.apiUrls.gateway` from the start, and verify a matching Gateway route exists (`Gateway.API/appsettings.json`) rather than assuming a direct service port will work in every deployment.**
12. **A strict CSP's `connect-src` must include `blob:` whenever a library `fetch()`es a `blob:` URL, not just `worker-src`/`img-src`/`media-src` — a `<video>`/`<audio>` tag pointing at a `blob:` URL is exempt from `connect-src` (browsers resolve those directly), but code that explicitly calls `fetch(blobUrl)` is not, and `'self'` does NOT cover the `blob:` scheme.** `libs/shared`'s `audio-editor-dialog.component.ts` (used by the shared File Manager's upload flow in both `apps/admin` and `apps/nasheed/admin`) creates a `blob:` URL via `URL.createObjectURL()` from the source file/enhanced-audio `Blob` and hands it to WaveSurfer.js, which internally `fetch()`es that URL to decode the waveform — this surfaced on PC2 (`nasheed/admin`, port 4300) as `Refused to connect because it violates the document's Content Security Policy` / `violates ... "connect-src ..."` when uploading an audio file, even though `worker-src 'self' blob:` was already correctly set (that only covers Worker creation, a different CSP check). **Fixed** by adding `blob:` to `connect-src` in both `apps/admin/nginx.conf` and `apps/nasheed/admin/nginx.conf`. When adding any library that loads media via a `blob:` URL through `fetch`/`XMLHttpRequest` (waveform/video decoders, canvas-from-blob, etc.) to an app behind a strict CSP, check for this distinct `connect-src` violation — it is separate from the `worker-src` blob issue in pitfall #8 above.
13. **`media-src` needs its own `blob:` entry even after pitfall #12's `connect-src` fix — a plain `<audio>`/`<video src="blob:...">` element is checked against `media-src` specifically, not `connect-src`, and the two directives were fixed for two different code paths at two different times.** The same `audio-editor-dialog.component.ts` (pitfall #12) also renders the `blob:` object URL directly in an `<audio>` element for local playback preview of the file being uploaded/edited — a completely separate CSP check from WaveSurfer's internal `fetch()` of that same URL. This surfaced identically on PC2 (`nasheed/admin`, port 4300) as `Loading media from 'blob:...' violates ... "media-src 'self' https://*.r2.dev ..."`, found and fixed August 2026, after `connect-src` already had `blob:` from pitfall #12 — proof that fixing one CSP directive for a `blob:` URL does not cover every other directive the same URL might be checked against. **Fixed** by adding `blob:` to `media-src` in both `apps/admin/nginx.conf` and `apps/nasheed/admin/nginx.conf` (`media-src 'self' blob: https://*.r2.dev ...`). **Whenever a `blob:` URL is used anywhere in a component, check every relevant CSP directive it could be evaluated against — `worker-src` (Worker creation, pitfall #8), `connect-src` (explicit `fetch`/`XMLHttpRequest`, pitfall #12), and `media-src`/`img-src` (direct `<audio>`/`<video>`/`<img>` element `src`, this pitfall) are each checked independently by the browser for the exact same URL.**

## Documentation Protocol

### Before starting

Read `Doc/ZARDUI_AI_REFERENCE.md`, `Doc/TRANSLATION_SYSTEM_GUIDE.md`, and any other doc relevant to the task. State which files you read.

### After every change — BLOCKING REQUIREMENT

A task is **not complete** until:

1. Every `Doc/*.md` that describes changed behavior has been updated in place
2. `MicroservicesArchitecture-Web/CLAUDE.md` docs table reflects any added or removed doc files
3. Both `en.json` and `ar.json` have been updated if any translation keys were added or renamed
4. If a new Zardui usage pattern or anti-pattern was discovered: it is added to this file or to `Zardui-Strict.instructions.md`
5. No stale information remains in any doc you touched during the task

### Self-correcting docs

If you make a mistake caused by incorrect or misleading documentation:

1. **Stop.** Acknowledge the mistake.
2. **Fix** the offending doc immediately with correct information.
3. **Add** a warning or clarification to prevent repeating it.
4. **Proceed** with the correct pattern.
