# Frontend Documentation Index

**Last Updated:** August 16, 2026  
**Purpose:** Central entry point for all Angular frontend documentation

---

## 📚 Quick Navigation

| Category               | Files                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Getting Started**    | [ANGULAR_DESIGN_PATTERN](#angular-design-pattern) • [LIBRARY_STRUCTURE](#library-structure-guide)                                           |
| **UI Components**      | [COMPONENT_USAGE_GUIDE](#component-usage-guide) • [ZARDUI_AI_REFERENCE](#zardui-ai-reference) • [ZARD_ICON_REFERENCE](#zard-icon-reference) • [components.context](#componentscontextmd) |
| **Translation & i18n** | [TRANSLATION_SYSTEM_GUIDE](#translation-system-guide) • [TRANSLATION_FEATURE_GUIDE](#translation-feature-guide)                             |
| **Backup Management** | [BACKUP_FEATURE_GUIDE](#backup-feature-guide)                                                                                                |
| **Dialog & Overlays**  | [DIALOG_DESIGN_GUIDE](#dialog-design-guide)                                                                                                 |
| **Authentication**     | [MULTI_MODE_AUTHENTICATION_GUIDE](#multi-mode-authentication-guide) • [IDENTITY_MODULE_GUIDE](#identity-module-guide) • [PERMISSIONS_GUIDE](#permissions-guide) |
| **Feature Flags**      | [FEATURE_FLAGS_GUIDE](#feature-flags-guide)                                                                                                 |
| **Error Handling**     | [ERROR_HANDLER_USAGE_GUIDE](#error-handler-usage-guide)                                                                                     |
| **HTTP Interceptors**  | [ERROR_HANDLER_USAGE_GUIDE → HTTP Interceptors Reference](#error-handler-usage-guide)                                                       |
| **Design Patterns**    | [PAGE_CONTAINER_DESIGN_PATTERN](#page-container-design-pattern)                                                                             |
| **Real-Time / SignalR** | [REALTIME_NOTIFICATIONS_GUIDE](#realtime-notifications-guide)                                                                              |
| **URL / Routing State** | [URL_QUERY_PARAM_SYNC_GUIDE](#url_query_param_sync_guide)                                                                                   |

---

## 📖 Complete Documentation List

### Core Architecture & Patterns

#### ANGULAR_DESIGN_PATTERN.md

**Purpose:** Complete Angular project structure and design patterns  
**Read When:**

- Starting new Angular development
- Understanding project organization
- Learning component structure conventions
- Setting up new features

**Key Topics:**

- Project structure and folder organization
- Component colocation pattern
- Routing and lazy loading
- State management with signals
- Naming conventions

---

#### LIBRARY_STRUCTURE.md

**Purpose:** Nx monorepo library boundaries — what belongs in `libs/core` vs `libs/ui` vs `libs/shared` vs app-specific/domain libs (`libs/nasheed`, etc.), plus the shared component reference (audio editor dialog, file selector)  
**Read When:**

- Deciding which `libs/` folder a new service, directive, or component belongs in
- Looking up the shared `AudioEditorDialogComponent` or other cross-app shared components
- Understanding why a resolver lives colocated in its feature folder instead of a top-level `resolvers/` folder

**Key Topics:**

- `libs/core` (business logic, services, guards, interceptors) vs `libs/ui` (Zardui wrapper) vs `libs/shared` (reusable components/cross-app features)
- Colocated resolvers per feature
- Shared Component Reference (`AudioEditorDialogComponent`, file selector integration)

---

#### PAGE_CONTAINER_DESIGN_PATTERN.md

**Purpose:** Standard pattern for page layouts and containers  
**Read When:**

- Creating new page components
- Implementing consistent page structure
- Setting up page headers and layouts

**Key Topics:**

- Page header patterns
- Action buttons placement
- Filter sections
- Content area structure

---

### UI Components & Styling

#### COMPONENT_USAGE_GUIDE.md — ⚠️ DEPRECATED

**Do not use.** Predates `ZARDUI_AI_REFERENCE.md` and was never reconciled with it — an August 2026 audit found nearly every example (button/badge variants, card sub-components, select, pagination inputs, dialog-ref API) uses a fictional or superseded Zardui API. The file now only contains a redirect. **Use `ZARDUI_AI_REFERENCE.md` instead** for all Zardui usage.

---

#### ZARDUI_AI_REFERENCE.md

**Purpose:** AI-optimized single-file reference for all Zardui components  
**Read When:**

- Using AI for code generation
- Quick component lookup
- Copy-paste ready examples
- Learning component APIs

**Key Topics:**

- Complete component examples
- TypeScript types and interfaces
- Service-based components
- Composition patterns

---

#### ZARD_ICON_REFERENCE.md

**Purpose:** Complete list of available Zardui icons  
**Read When:**

- Adding icons to UI
- Verifying icon availability
- Finding icon names

**Key Topics:**

- Alphabetical icon list
- Usage examples
- Icon categories

---

#### components.context.md

**Purpose:** Auto-generated, AI-optimized inventory of all 43 Zard UI components (selector, category, inputs, outputs, variants) — the underlying data `COMPONENT_USAGE_GUIDE.md`'s deprecation notice points to as the current component list  
**Read When:**

- Looking up a component's exact input/output signature without opening `ZARDUI_AI_REFERENCE.md`'s full examples
- Verifying a component exists before using its selector (per `Zardui-Strict.instructions.md`'s mandatory icon/selector verification rule)

**Key Topics:**

- Per-component selector, category, forms-compatibility, inputs table, outputs table, variants

---

#### DIALOG_DESIGN_GUIDE.md

**Purpose:** Complete guide for creating dialogs and sheets  
**Read When:**

- Creating modal dialogs
- Implementing side sheets
- Setting up overlays
- Handling RTL in dialogs/sheets

**Key Topics:**

- Dialog service usage
- Sheet component patterns
- RTL support for dialogs/sheets
- Error handling in overlays
- Form validation in dialogs

---

### Translation & Internationalization

#### TRANSLATION_SYSTEM_GUIDE.md

**Purpose:** Complete i18n implementation guide  
**Read When:**

- Adding new translations
- Understanding translation system
- Implementing RTL support
- Using translation pipes

**Key Topics:**

- Translation keys structure
- TranslatePipe usage
- RTL (Right-to-Left) support
- RtlService API
- Global RTL CSS
- Best practices

**Related Files:**

- `apps/admin/src/assets/i18n/en.json` - English translations
- `apps/admin/src/assets/i18n/ar.json` - Arabic translations

---

#### TRANSLATION_FEATURE_GUIDE.md

**Purpose:** Translation Management UI feature documentation  
**Read When:**

- Working on Translation Service integration
- Understanding translation management workflow
- Implementing translation CRUD operations

**Key Topics:**

- Translation keys management
- Translation values (multi-language)
- Import/Export functionality
- Sheet error handling

---

#### TRANSLATION_RESOLVER_PIPE_GUIDE.md

**Purpose:** Advanced translation pipe usage  
**Read When:**

- Implementing complex translations
- Using translation parameters
- Understanding pipe patterns

**Key Topics:**

- Translation with parameters
- Dynamic translations
- Pipe best practices

---

### Backup Management

#### BACKUP_FEATURE_GUIDE.md

**Purpose:** Admin UI for the platform's database backup/restore service
**Read When:**

- Working on the Backup Overview or History pages
- Adding a new known service to the Trigger Backup dialog
- Understanding the Local/Cloud dual-status badge pattern
- Debugging why a database doesn't show up until triggered/synced

**Key Topics:**

- Overview (status table) and History (run log) pages
- Trigger Backup / Restore Backup dialogs, View Run sheet
- BackupService, BackupEventsService
- String-valued enum fields (scope/status/localStatus/cloudStatus) — not numeric

---

### Authentication & Identity

#### MULTI_MODE_AUTHENTICATION_GUIDE.md

**Purpose:** Complete multi-mode authentication implementation  
**Read When:**

- Implementing login functionality
- Adding authentication modes
- Understanding auth flow

**Key Topics:**

- Email/Password authentication
- Email verification code
- Phone verification code
- Auth state management
- Token handling

---

#### IDENTITY_MODULE_GUIDE.md

**Purpose:** Identity module and user management  
**Read When:**

- Working with user management
- Implementing roles/claims
- Understanding identity structure

**Key Topics:**

- User management
- Role-based access
- Claims system
- Identity services

---

#### PERMISSIONS_GUIDE.md

**Purpose:** Permission-claim route guard (`roleGuard`), sidebar visibility, and action-level button gating for a lower-privileged role below the role system (e.g. a "data entry" role that can create/edit but not delete)  
**Read When:**

- Gating any page/action by a Permission claim rather than a full role
- Adding `permissions?: string[]` alongside `roles?: string[]` on a route or sidebar entry
- Hiding a specific button (not a whole page) for a claim-holding user

**Key Topics:**

- `roleGuard` role-OR-permission check (never AND — Admin/SuperAdmin must never need a claim too)
- `UserClass.permissions` (flattened `roles[].claims[]` where `claimType === 'Permission'`)
- `ISidebarPage.permissions` / `ISidebarUser.permissions`
- Action-level gating via a local `computed()` (no directive yet)
- System claims are read-only in the admin UI (`IClaim.isSystemClaim`)

---

### Feature Flags

#### FEATURE_FLAGS_GUIDE.md

**Purpose:** Per-tenant feature flags — `FeatureFlagService`, the `*featureFlag` structural directive, and `featureFlagGuard` route guard  
**Read When:**

- Hiding/showing a block of UI or an entire route behind a tenant's feature flag
- Adding a brand-new flag (backend constant + frontend `FeatureFlags` constant + optional Tenant Configuration sheet UI)
- Debugging why a flag-gated element isn't showing/hiding as expected (default-value semantics)

**Key Topics:**

- `*featureFlag="Flags.X"` directive (with optional `else` template)
- `featureFlagGuard` + `data: { featureFlag, featureFlagRedirect, featureFlagDefault }`
- `FeatureFlagService.isEnabled()` / `isEnabledSignal()`
- `featureFlagResolver` (admin app) vs `APP_INITIALIZER` (fixed-tenant app) loading patterns
- Current flags table (`aiChatEnabled`, `nasheedIngestionEnabled`, `isBackgroundJobPageEnabled`, `isAuditLogPageEnabled`, `nasheedNewLyricsExtractionEnabled`, `autoUploadToExternalStorageEnabled`)

---

### Real-Time / SignalR

#### REALTIME_NOTIFICATIONS_GUIDE.md

**Purpose:** How the frontend connects to the Notification service's SignalR hub, and the convention for feeding a push into app-specific state without toast spam
**Read When:**

- Connecting a new app to the notification hub
- Adding a domain-specific real-time listener (e.g. a feature's events service reacting to a live push)
- Deciding whether a new backend-pushed event should toast or update silently
- Debugging why a notification isn't updating a table, or is popping an unwanted toast

**Key Topics:**

- `BaseSignalrService` / `SignalrService` architecture (`libs/shared`)
- The `"silent": true` payload convention
- Adding a new domain-specific listener (reference: Nasheed ingestion progress)
- Hub URL / environment configuration

---

### URL / Routing State

#### URL_QUERY_PARAM_SYNC_GUIDE.md

**Purpose:** How every list/table page's filters and pagination sync to the URL's query params, so a link to a filtered+paginated view can be shared/bookmarked, and browser back/forward works
**Read When:**

- Creating a new list/table page
- Adding a new filter field to an existing list page
- Debugging why a shared link doesn't reproduce the expected filtered view, or why pagination/back-forward behaves unexpectedly
- Deciding whether a page's data-loading is genuinely server-paginated vs client-side filtered over a resolver-preloaded dataset

**Key Topics:**

- Why `ActivatedRoute.queryParamMap` (not `ngOnInit`) must be the sole fetch trigger, given the default route-reuse strategy
- The shared `@ihsan/core` utility (`updateQueryParams`, `queryParamNumber`, `queryParamBoolean`)
- `replaceUrl` convention (filters vs page changes)
- The client-side-filtered-page variant (resolver-preloaded datasets, server-only fields like `scope`)
- Multi-mount consideration for the shared identity feature lib

---

### Error Handling & HTTP Interceptors

#### ERROR_HANDLER_USAGE_GUIDE.md

**Purpose:** Complete HTTP error handling guide (interceptor + component patterns) + reference for all HTTP interceptors  
**Read When:**

- Implementing error handling in components
- Understanding error interceptor
- Handling API errors
- Displaying error messages
- Adding or modifying HTTP interceptors
- Understanding how `X-Correlation-Id` is propagated from the frontend

**Key Topics:**

- Automatic toast notifications (default behavior)
- Component-level error handling with SKIP_ERROR_TOAST
- extractErrorMessage() utility
- Validation error formatting
- z-alert component usage
- Complete error flow diagrams
- Backend error formats support
- HTTP interceptors reference: `errorInterceptor`, `tokenInterceptor`, `tenantInterceptor`, `correlationIdInterceptor`

---

## 🚫 Deprecated/Obsolete Files

**Note:** The following files have been removed (consolidated into main guides):

- ❌ `FRONTEND_ERROR_INTERCEPTOR_QUICK_REFERENCE.md` - Content merged into ERROR_HANDLER_USAGE_GUIDE.md
- ❌ `ERROR_HANDLER_QUICK_REFERENCE.md` - Content merged into ERROR_HANDLER_USAGE_GUIDE.md
- ❌ `MULTI_MODE_AUTH_QUICK_REFERENCE.md` - Content merged into MULTI_MODE_AUTHENTICATION_GUIDE.md
- ❌ `ERROR_HANDLING_COMPONENT_VS_INTERCEPTOR.md` - Content merged into ERROR_HANDLER_USAGE_GUIDE.md
- ❌ `ERROR_HANDLING_FLOW_DIAGRAM.md` - Content merged into ERROR_HANDLER_USAGE_GUIDE.md
- ❌ `FRONTEND_ERROR_INTERCEPTOR_GUIDE.md` - Content merged into ERROR_HANDLER_USAGE_GUIDE.md
- ❌ `DOCUMENTATION_UPDATE_MULTI_MODE_AUTH_JAN_26_2026.md` - Temporary update log (removed)
- ❌ `DOCUMENTATION_UPDATE_JAN_20_2026.md` - Temporary update log (removed)
- ❌ `DOCUMENTATION_UPDATE_ERROR_HANDLER_JAN_25_2026.md` - Temporary update log (removed)
- ❌ `IMPLEMENTATION_SUMMARY_FRONTEND_ERROR_INTERCEPTOR.md` - Temporary summary (removed)

**Total files removed:** 10  
**Current file count:** 19, plus this index (verified against `Doc/*.md` on disk, August 2026)

---

## 📝 Documentation Guidelines

### Creating New Documentation

**Rules:**

1. ✅ **ONE FILE PER TOPIC** - Never create separate "Guide", "Quick Reference", or "Summary" files
2. ✅ **UPDATE IN PLACE** - Modify existing files, don't create new ones
3. ✅ **NO TEMPORARY DOCS** - No `*_SUMMARY.md`, `*_FIX.md`, `*_MIGRATION.md` files
4. ✅ **UPDATE THIS INDEX** - Add new files to this index immediately

### Documentation Structure

Each documentation file should have:

- Clear title and purpose
- Last updated date
- Table of contents (for long docs)
- Code examples with proper syntax highlighting
- Links to related documentation

---

## 🔍 Quick Lookup Table

| I want to...                     | Read this file                                               |
| -------------------------------- | ------------------------------------------------------------ |
| Add a button                     | ZARDUI_AI_REFERENCE.md → Button                              |
| Create a dialog                  | DIALOG_DESIGN_GUIDE.md                                       |
| Add translation                  | TRANSLATION_SYSTEM_GUIDE.md                                  |
| Handle RTL                       | TRANSLATION_SYSTEM_GUIDE.md → RTL Section                    |
| Use an icon                      | ZARD_ICON_REFERENCE.md                                       |
| Create a form                    | ZARDUI_AI_REFERENCE.md → Form Components                      |
| Handle errors                    | ERROR_HANDLER_USAGE_GUIDE.md                                 |
| Understand HTTP interceptors     | ERROR_HANDLER_USAGE_GUIDE.md → HTTP Interceptors Reference   |
| Implement login                  | MULTI_MODE_AUTHENTICATION_GUIDE.md                           |
| Create a page                    | ANGULAR_DESIGN_PATTERN.md + PAGE_CONTAINER_DESIGN_PATTERN.md |
| Use AI for coding                | ZARDUI_AI_REFERENCE.md                                       |
| Use the audio editor dialog      | LIBRARY_STRUCTURE.md → Shared Component Reference            |
| Add audio editing to file upload | LIBRARY_STRUCTURE.md → AudioEditorDialogComponent            |
| Work on database backups         | BACKUP_FEATURE_GUIDE.md                                      |
| Decide which `libs/` folder something belongs in | LIBRARY_STRUCTURE.md                          |
| Look up a Zardui component's exact inputs/outputs | components.context.md                        |
| Gate a page/button by a Permission claim (not a role) | PERMISSIONS_GUIDE.md                     |
| Hide/show UI or a route by tenant feature flag   | FEATURE_FLAGS_GUIDE.md                        |
| Connect to the SignalR notification hub          | REALTIME_NOTIFICATIONS_GUIDE.md               |
| Sync a list page's filters/pagination to the URL | URL_QUERY_PARAM_SYNC_GUIDE.md                 |

---

## 📌 Related Backend Documentation

For backend (.NET) documentation, see:

- `MicroservicesArchitecture/Doc/DOCUMENTATION_INDEX.md`
- `MicroservicesArchitecture/Doc/README.md`

---

**Maintained by:** Development Team  
**Version:** 1.0
