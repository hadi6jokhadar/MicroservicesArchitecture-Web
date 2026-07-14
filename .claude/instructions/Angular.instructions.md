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
5. **`nx.json`'s `"@angular/build:application"` target must NOT have `dependsOn: ["^build"]`:** `apps/*/tsconfig.app.json` maps `@ihsan/ui`/`@ihsan/shared` directly to their **source** `.ts` files (`libs/ui/src/index.ts`, not `dist/libs/ui`), so Angular app builds (esbuild-based) compile the entire dependency graph from source directly — they never need `libs/ui`'s or `libs/shared`'s own `build` target (which uses `@nx/js:tsc`, a separate/stricter standalone compiler invocation meant for independently-publishable packages) to have run first. `dependsOn: ["^build"]` forced Nx to run those `tsc` builds as a blocking prerequisite anyway, and they fail: `shared` imports `@ihsan/ui` via path mapping, which pulls `libs/ui`'s `.ts` source files into `shared`'s own `tsc -p libs/shared/tsconfig.lib.json` compilation unit (since there are no TS project references / `composite: true` between them), and `tsc`'s strict `rootDir` containment check then rejects those pulled-in `ui` files as being outside `shared`'s project root (`TS6059: File X is not under rootDir libs/shared`). This was silently masked by Nx's build cache for months — it only surfaced when a build config was run for the first time with a cold cache (discovered via a new Docker `docker` build configuration, but reproduces identically with a plain `nx build admin --configuration=production --skip-nx-cache`, no Docker involved). **Fixed by removing `dependsOn: ["^build"]`** from `nx.json`'s `"@angular/build:application"` target defaults — Angular app builds no longer trigger `ui:build`/`shared:build` at all. If `ui`/`shared` are ever meant to become independently publishable packages, fix this properly instead via TS project references (`composite: true` on `ui`, `references` on `shared` pointing at it) rather than re-adding the blanket `dependsOn`.

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
