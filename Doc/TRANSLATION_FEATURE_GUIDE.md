# Translation Feature Guide

**Version:** 1.1
**Date:** January 28, 2026 (last audited August 13, 2026)
**Status:** ✅ Complete

---

## 📋 Overview

Complete frontend implementation of the Translation Management feature with full CRUD operations for translation keys and values. Integrates with the Translation Service backend (localhost:5006) to manage application translations across multiple languages.

---

## 🎯 Features

### Translation Keys Management

- ✅ **List Keys** - Paginated table with search, category, tenant, and archived-status filtering
- ✅ **Add Key** - Dialog form to create new translation keys
- ✅ **Edit Key** - Dialog form to update key description (key/category immutable)
- ✅ **Archive / Unarchive Key** - Confirmation dialog toggling `isArchived` (soft alternative to hard delete)
- ✅ **Delete Key** - Confirmation dialog with cascade delete warning
- ✅ **View Values** - Side sheet showing all translation values for a key

### Translation Values Management

- ✅ **List Values** - Display all language translations for a key
- ✅ **Add Value** - Inline form to create new language translation
- ✅ **Edit Value** - Inline form to update existing translation
- ✅ **Delete Value** - Confirmation dialog to remove translation value
- ✅ **Global/Tenant** - Visual indicators for global vs tenant-specific translations

### Import / Export

- ✅ **Export Translations** - Dialog to download a language's (optionally category-filtered) translations as a `.json` file
- ✅ **Import Translations (multi-file)** - Dialog supporting drag-and-drop or browse selection of **multiple** `.json` files at once; each file gets its own auto-detected language (from the filename, e.g. `en.json` → `en`) with an overridable per-file language selector, a shared "category for new keys" field, tenant-scoped key detection/preview, and parallel per-file import with individual success/failure outcomes

---

## 📦 Architecture

### File Structure

```
apps/admin/src/app/features/translation/
├── translation.routes.ts               # Lazy-loaded routes (single '' path → TranslationsComponent)
├── translation-events.service.ts       # Event coordination service
└── translations/
    ├── translations.component.ts       # Main list page
    ├── translations.component.html
    ├── translations.component.scss
    ├── add-edit-key-dialog/
    │   ├── add-edit-key-dialog.component.ts   # Dialog for key create/update
    │   ├── add-edit-key-dialog.component.html
    │   └── add-edit-key-dialog.component.scss
    ├── view-values-sheet/
    │   ├── view-values-sheet.component.ts     # Side sheet for values (add/edit/delete)
    │   ├── view-values-sheet.component.html
    │   └── view-values-sheet.component.scss
    ├── export-dialog/
    │   ├── export-dialog.component.ts         # Download translations as .json
    │   ├── export-dialog.component.html
    │   └── export-dialog.component.scss
    └── import-dialog/
        ├── import-dialog.component.ts         # Multi-file drag/drop .json import
        ├── import-dialog.component.html
        └── import-dialog.component.scss

libs/core/src/lib/translation/
├── models.ts                    # TypeScript interfaces (DTOs, commands, queries)
├── translation.service.ts       # HTTP service (admin CRUD + import + public getTranslations)
├── translation.resolver.ts      # Route resolver — preloads/caches translations
├── translate.pipe.ts            # `| translate` pipe — reads the cache only
├── rtl.service.ts               # RtlService — RTL direction helpers
└── index.ts                     # Public exports (barrel)
```

### Components

**TranslationsComponent** - Main page

- Paginated table of translation keys
- Search and category filters
- Action dropdowns (View Values, Edit, Archive/Unarchive, Delete)
- Export/Import buttons opening their respective dialogs
- Archived-only filter switch (`z-switch`)
- Pagination controls

**AddEditKeyDialogComponent** - Create/Update dialog

- Dual mode: Create vs Edit
- Form validation (required key, category, optional description)
- Disables key/category fields in edit mode
- Inline error display with SKIP_ERROR_TOAST

**ViewValuesSheetComponent** - Translation values sheet

- List all values for a translation key
- Inline add/edit form for values
- Delete with confirmation
- Success/error messages inline (no toast)

**ExportDialogComponent** - Download translations dialog

- Form: required language selector + optional category filter
- Calls the same public `getTranslations(language, category)` used by the resolver, then serializes the response's `translations` map to a downloaded `.json` file (`translations_{language}[_{category}].json`)
- Success/cancel via toast + dialog close (no inline alert)

**ImportDialogComponent** - Multi-file translations import dialog

- Accepts **multiple** `.json` files at once via a drag-and-drop drop zone (`sharedDragDropFiles` directive from `@ihsan/shared`) or a "browse" button (`<input type="file" multiple accept=".json">`)
- Each selected file gets its own row: file name, a per-file language `z-select` (defaults to the language auto-detected from the filename stem, e.g. `en.json` → `en`), and a remove button
- Previews tenant-scoped keys per file by scanning the JSON for keys matching a `#tenantId#` prefix pattern, shown as an info `z-alert` listing detected tenant IDs before import runs
- One shared "category for new keys" text field applies to every file in the batch
- On submit, reads every file's JSON client-side and imports them **in parallel** (`forkJoin`) via `TranslationService.importTranslations()`; files that fail (invalid JSON or a backend error) stay in the list with an inline error so the user can retry just those, while succeeded files are removed and their created-key/updated-value counts are summed into a single success toast
- Dialog only closes automatically once **all** files succeed

**TranslationEventsService** - Event coordination

- Emits `translationKeysChanged$` after CRUD operations
- Main component subscribes and reloads data
- Clean separation between components

---

## 🔗 Backend Integration

### API Endpoints

All admin/CRUD calls go through the Gateway, versioned, at `{gateway}/api/v1/translations/...` (never a hardcoded per-service port — see root `CLAUDE.md`'s Cross-Stack Communication Rules). `{gateway}` = `environment.apiUrls.gateway`.

| Endpoint                                        | Method | Purpose                                                            | Status |
| ------------------------------------------------ | ------ | ------------------------------------------------------------------- | ------ |
| `/api/v1/translations/{language}`               | GET    | Get translations for a language (public, used by resolver/export)   | ✅     |
| `/api/v1/translations/keys`                     | GET    | Get paginated translation keys                                     | ✅     |
| `/api/v1/translations/keys`                     | POST   | Create translation key                                             | ✅     |
| `/api/v1/translations/keys/{id}`                | PUT    | Update translation key (description only)                         | ✅     |
| `/api/v1/translations/keys/{id}`                | DELETE | Delete translation key (cascades values)                           | ✅     |
| `/api/v1/translations/keys/{id}/toggle-archive` | PATCH  | Toggle a key's archived status                                     | ✅     |
| `/api/v1/translations/values`                   | POST   | Set translation value (add/edit)                                  | ✅     |
| `/api/v1/translations/values/{id}`              | DELETE | Delete translation value                                           | ✅     |
| `/api/v1/translations/import`                   | POST   | Bulk-import a JSON translations map                                | ✅     |

### TranslationService

**Location:** `libs/core/src/lib/translation/translation.service.ts`

Mutating methods (`create`/`update`/`setTranslation`/`importTranslations`) accept an optional `HttpContext` — every dialog/sheet call site passes `new HttpContext().set(SKIP_ERROR_TOAST, true)` per this repo's error-handling convention:

```typescript
getTranslations(language: string, category?: string): Observable<ITranslationsDto>
getCachedTranslations(): Record<string, string>
getCachedTranslation(key: string, defaultValue?: string, params?: Record<string, unknown>): string
getCurrentLanguage(): string
getCurrentLanguageSignal(): Signal<string>
setTranslations(translations: Record<string, string>, language: string): void
getTranslationKeys(query: IGetTranslationKeysQuery): Observable<IPaginatedList<ITranslationKeyDto>>
toggleArchive(id: number): Observable<ITranslationKeyDto>
createTranslationKey(command: ICreateTranslationKeyCommand, context?: HttpContext): Observable<ITranslationKeyDto>
updateTranslationKey(command: IUpdateTranslationKeyCommand, context?: HttpContext): Observable<ITranslationKeyDto>
deleteTranslationKey(id: number): Observable<boolean>
setTranslation(command: ISetTranslationCommand, context?: HttpContext): Observable<ITranslationValueDto>
deleteTranslationValue(id: number): Observable<boolean>
importTranslations(command: IImportTranslationsCommand, context?: HttpContext): Observable<IImportTranslationsResult>
```

---

## 🎨 UI Patterns

### Event-Driven Data Refresh

Uses **TranslationEventsService** for component coordination:

```typescript
// In dialog component (after successful operation)
this._translationEvents.notifyTranslationKeysChanged();
this._dialogRef.close(result);

// In main component (constructor)
this._translationEvents.translationKeysChanged$
  .pipe(takeUntilDestroyed())
  .subscribe(() => {
    this.loadTranslationKeys();
  });
```

**Benefits:**

- No tight coupling between components
- Dialog handles its own state
- Parent reacts to events automatically
- Clean separation of concerns

### Dialog Pattern (Add/Edit Key)

```typescript
// Open dialog - no callbacks needed
this._dialogService.create({
  zContent: AddEditKeyDialogComponent,
  zData: { translationKey }, // Pass data for edit mode
});

// Dialog notifies via TranslationEventsService on success
this._translationEvents.notifyTranslationKeysChanged();
this._dialogRef.close(result);
```

### Alert Confirmation (Delete Operations)

```typescript
this._alertDialogService.confirm({
  zTitle: 'Delete Translation Key',
  zDescription: `Are you sure?`,
  zOkText: 'Delete',
  zCancelText: 'Cancel',
  zOkDestructive: true,
  zOnOk: () => {
    // Execute delete operation
    this._service.deleteTranslationKey(id).subscribe({
      next: () => toast.success('Deleted successfully'),
      error: () => toast.error('Failed to delete'),
    });
  },
});
```

### Sheet Success/Error Handling (CRITICAL — sheets only, not dialogs)

**❌ NEVER use a toast for the success case in a sheet that stays open across repeated actions (like `ViewValuesSheetComponent`)** - toasts appear at screen edge and may be hidden or missed between successive add/edit/delete actions in the same sheet session; use an inline `<z-alert>` instead.

> This project's monorepo-wide convention (`MicroservicesArchitecture-Web/.claude/instructions/Angular.instructions.md`) is that **dialogs** *do* use `toast.success()` immediately before closing — see `AddEditKeyDialogComponent`, `ExportDialogComponent`, and `ImportDialogComponent`, all of which call `toast.success(...)` on success. The rule below is specific to `ViewValuesSheetComponent`, which stays open across multiple value add/edit/delete operations and therefore needs a persistent inline message rather than a transient toast. `SKIP_ERROR_TOAST` is still used in both dialogs and sheets — that part is about suppressing the *global error interceptor's* toast so it doesn't double up with the component's own error display, independent of how success is shown.

```typescript
const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

this._service.setTranslation(data, context).subscribe({
  next: (result) => {
    this.successMessage.set('Translation value added successfully');
    // Update local state
  },
  error: (error) => {
    this.errorMessage.set(extractErrorMessage(error));
  },
});
```

**Template:**

```html
@if (successMessage()) {
<z-alert
  zType="success"
  zIcon="circle-check"
  [zDescription]="successMessage()"
/>
} @if (errorMessage()) {
<z-alert
  zType="destructive"
  zIcon="circle-alert"
  [zDescription]="errorMessage()"
/>
}
```

---

## 📝 Form Validation

### Add/Edit Key Form

```typescript
interface IAddEditKeyForm {
  key: FormControl<string>; // Required, disabled in edit mode
  category: FormControl<string>; // Required, disabled in edit mode
  description: FormControl<string>; // Optional
}
```

**Validators:**

- `key`: Required, max 200 chars, disabled in edit mode
- `category`: Required, max 100 chars, disabled in edit mode
- `description`: Optional, max 500 chars

**Edit Mode Behavior:**

- Key and category are immutable (disabled fields)
- Only description can be updated
- Backend enforces this constraint

### Add/Edit Value Form

```typescript
interface IEditValueForm {
  language: FormControl<string>; // Required — no length restriction enforced client-side
  value: FormControl<string>; // Required
  tenantId: FormControl<string>; // Optional — empty string means a global (non-tenant) translation
}
```

**Validators:**

- `language`: Required (no min/max length validator)
- `value`: Required
- `tenantId`: No validators — left empty for a global translation, or set to scope the value to one tenant

---

## 🔄 Data Flow

### Add Translation Key

1. User clicks "Add Key" button
2. Dialog opens with empty form
3. User fills key, category, description
4. On submit:
   - Skip toast (`SKIP_ERROR_TOAST`)
   - Call `createTranslationKey(command, context)`
   - On success:
     - Notify `TranslationEventsService`
     - Close dialog with result
   - On error: Show inline error in dialog
5. Main component receives event, reloads keys

### Edit Translation Key

1. User clicks "Edit" in dropdown
2. Dialog opens with pre-filled form (key/category disabled)
3. User updates description
4. On submit:
   - Skip toast (`SKIP_ERROR_TOAST`)
   - Call `updateTranslationKey(command, context)`
   - On success:
     - Notify `TranslationEventsService`
     - Close dialog with result
   - On error: Show inline error in dialog
5. Main component receives event, reloads keys

### Archive / Unarchive Translation Key

1. User clicks "Archive" or "Unarchive" in dropdown (label/dialog text depends on current `isArchived` state)
2. Confirmation dialog shows (destructive styling only when archiving, not unarchiving)
3. On confirm (`zOnOk` callback):
   - Call `toggleArchive(id)`
   - On success: Show toast, reload keys
   - On error: Show error toast

### Delete Translation Key

1. User clicks "Delete" in dropdown
2. Confirmation dialog shows warning about cascade delete
3. On confirm (`zOnOk` callback):
   - Call `deleteTranslationKey(id)`
   - On success: Show toast, reload keys
   - On error: Show error toast

### Add/Edit Translation Value

1. User opens "View Values" sheet
2. User clicks "Add Value" or "Edit" button
3. Inline form appears
4. User fills language and value
5. On submit:
   - Skip toast (`SKIP_ERROR_TOAST`)
   - Call `setTranslation(command, context)`
   - On success: Show inline success, update values signal
   - On error: Show inline error
6. Form closes, success message persists

### Delete Translation Value

1. User opens "View Values" sheet
2. User clicks "Delete" in dropdown
3. Confirmation dialog shows
4. On confirm (`zOnOk` callback):
   - Call `deleteTranslationValue(id)`
   - On success: Show inline success, remove from values signal
   - On error: Show inline error

### Export Translations

1. User clicks "Export" button on the main page
2. Dialog opens with a required language selector and an optional category filter
3. On submit:
   - Call `getTranslations(language, category)`
   - On success: Serialize `translations` to JSON, trigger a browser download (`translations_{language}[_{category}].json`), show success toast, close dialog
   - On error: Show error toast (dialog stays open)

### Import Translations (multi-file)

1. User clicks "Import" button on the main page
2. Dialog opens; user drags one or more `.json` files onto the drop zone, or browses and multi-selects files
3. Each added file appears as a row with its filename, an editable language selector (pre-filled from the filename), and a remove button; the dialog also previews any `#tenantId#`-prefixed keys it detects in each file
4. User optionally overrides the shared "category for new keys" field (default `General`)
5. On submit:
   - Skip toast (`SKIP_ERROR_TOAST`)
   - Read every file's JSON client-side, then call `importTranslations(command, context)` for **each file in parallel** (`forkJoin`)
   - Per file, on success: file is removed from the list and its `createdKeys`/`updatedValues` counts are accumulated
   - Per file, on failure: file stays in the list with its own inline error message (invalid JSON parses to a friendly "Invalid JSON file" message; backend errors use `extractErrorMessage`)
   - Once all `forkJoin` results resolve: if at least one file succeeded, notify `TranslationEventsService` and show one aggregated success toast (`"{{files}} file(s) imported: {{created}} keys created, {{updated}} values updated"`); if every file succeeded, close the dialog — otherwise leave it open showing only the failed files for retry
6. Main component receives the change event, reloads keys

---

## 🎨 Zardui Components Used

- ✅ `ZardAlertComponent` - Error/success messages (with custom success variant)
- ✅ `ZardAlertDialogService` - Delete confirmations
- ✅ `ZardBadgeComponent` - Category, language, tenant badges
- ✅ `ZardButtonComponent` - All action buttons
- ✅ `ZardCardComponent` - Content containers
- ✅ `ZardDialogService` - Add/Edit key dialogs
- ✅ `ZardDropdownImports` - Action menus
- ✅ `ZardEmptyComponent` - Empty state when no data
- ✅ `ZardFormImports` - Form fields, labels, validation errors
- ✅ `ZardIconComponent` - All icons
- ✅ `ZardIdDirective` - Unique `id`/`for` pairing on form fields (`zardId` template ref)
- ✅ `ZardInputDirective` - Text inputs
- ✅ `ZardLoaderComponent` - Loading spinners
- ✅ `ZardPaginationImports` - Page navigation
- ✅ `ZardSelectImports` - Language dropdowns (export dialog, per-file import language override)
- ✅ `ZardSheetService` - View values side panel
- ✅ `ZardSwitchComponent` - Archived-only filter toggle on the main page
- ✅ `DragDropFilesDirective` (`sharedDragDropFiles`, from `@ihsan/shared`, not Zardui) - Multi-file drag-and-drop zone in the import dialog

### Custom Success Alert Variant

Extended alert component with green success styling:

```typescript
// libs/ui/src/lib/zard/components/alert/alert.variants.ts
success: 'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100
          border-green-200 dark:border-green-800'

// libs/ui/src/lib/zard/components/alert/alert.component.ts
if (this.zType() === 'success') {
  return 'circle-check';  // Auto icon
}
```

---

## 🚀 Quick Start

### 1. Start Backend (Translation API)

```powershell
cd MicroservicesArchitecture\src\Services\Translation\Translation.API
dotnet run
```

✅ API: http://localhost:5006  
✅ Swagger: http://localhost:5006/swagger

### 2. Start Frontend (Admin App)

```powershell
cd MicroservicesArchitecture-Web
nx run admin:serve --configuration=development
```

✅ App: http://localhost:4200

### 3. Navigate to Translation Page

1. Login to http://localhost:4200
2. Click **Translation** in sidebar (System Group)

---

## ✅ Best Practices Applied

### Angular Patterns

- ✅ **Signals-only** - No `@Input()` or `@Output()` decorators
- ✅ **Inject pattern** - `private readonly _service = inject(Service)`
- ✅ **Typed forms** - `FormGroup<IMyForm>` with explicit interfaces
- ✅ **Manual mapping** - Static `MapFrom()` methods in DTOs
- ✅ **Standalone components** - No NgModules
- ✅ **Reactive forms** - No `[(ngModel)]`

### Error Handling

- ✅ **SKIP_ERROR_TOAST in sheets/dialogs** - Prevents the global error interceptor from duplicating the component's own inline error/toast
- ✅ **Inline error display** - Use `<z-alert zType="destructive">` for errors in both dialogs and sheets
- ✅ **Inline success display (sheets only)** - `ViewValuesSheetComponent` uses a green `<z-alert>` for success since it stays open across actions; dialogs use `toast.success()` + close instead (see "Sheet Success/Error Handling" above)
- ✅ **extractErrorMessage helper** - Consistent error formatting
- ✅ **Validation errors** - Show backend and frontend validation

### User Experience

- ✅ **Confirmation dialogs** - For destructive actions
- ✅ **Loading states** - Show loaders during operations
- ✅ **Empty states** - Helpful messages when no data
- ✅ **Success feedback** - Toast on dialog success; green inline alert on sheet success
- ✅ **Data reload** - Auto-refresh after CRUD operations

### Code Organization

- ✅ **Colocated components** - All files in same folder
- ✅ **Feature modules** - Translation feature self-contained
- ✅ **Shared services** - TranslationService in @ihsan/core
- ✅ **Reusable models** - Interfaces and classes in @ihsan/core
- ✅ **Event coordination** - TranslationEventsService for component communication

---

## ❌ Common Mistakes to Avoid

### Wrong: Toast for success in a sheet that stays open (e.g. `ViewValuesSheetComponent`)

```typescript
// ❌ WRONG in a sheet - Toast hidden behind sheet / missed between actions
this._service.operation(data).subscribe({
  next: () => toast.success('Success'),
});
```

```typescript
// ✅ CORRECT in a sheet - Inline success message
const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
this._service.operation(data, context).subscribe({
  next: () => this.successMessage.set('Success'),
});
```

> This applies to sheets specifically. Dialogs in this feature (`AddEditKeyDialogComponent`, `ExportDialogComponent`, `ImportDialogComponent`) correctly use `toast.success(...)` immediately before closing — that is the current project-wide convention for dialogs, not a mistake to avoid.

### Wrong: Tight coupling with callbacks

```typescript
// ❌ WRONG - Tight coupling
this._dialogService.create({
  zOnOk: () => this.loadData(),
});
```

```typescript
// ✅ CORRECT - Event-driven
this._translationEvents.translationKeysChanged$
  .pipe(takeUntilDestroyed())
  .subscribe(() => this.loadData());
```

### Wrong: Trying to subscribe to dialog

```typescript
// ❌ WRONG - No subscribe method on dialog ref
this._dialogService.create({ ... }).subscribe(...);
```

```typescript
// ✅ CORRECT - Use event service
this._dialogService.create({ zContent: MyDialog });
// Dialog will notify via TranslationEventsService
```

### Wrong: Alert confirmation with subscribe

```typescript
// ❌ WRONG - No subscribe method on alert dialog ref
this._alertDialogService.confirm({ ... }).subscribe(...);
```

```typescript
// ✅ CORRECT - Use zOnOk callback
this._alertDialogService.confirm({
  zOnOk: () => {
    this._service.delete(id);
  },
});
```

---

## 🔍 Testing Checklist

### Translation Keys

- [ ] List translation keys loads on page load
- [ ] Search filter works correctly
- [ ] Category filter works correctly
- [ ] Pagination works (if >10 keys)
- [ ] Add key creates new translation key
- [ ] Edit key updates description only
- [ ] Delete key shows confirmation
- [ ] Delete key removes key and all values
- [ ] Data reloads after add/edit/delete

### Translation Values

- [ ] View values sheet opens correctly
- [ ] All values display for a key
- [ ] Add value creates new language translation
- [ ] Edit value updates existing translation
- [ ] Delete value shows confirmation
- [ ] Delete value removes translation
- [ ] Success/error messages show inline
- [ ] Form closes after successful add/edit
- [ ] Global/Tenant badges display correctly

### Import / Export

- [ ] Export dialog downloads a `.json` file for the selected language
- [ ] Export with a category filter downloads only that category's translations
- [ ] Import accepts multiple files at once (drag-and-drop and multi-select browse)
- [ ] Import auto-detects each file's language from its filename, overridable per file
- [ ] Import previews detected `#tenantId#`-prefixed keys before submit
- [ ] Import processes all selected files in parallel and reports an aggregated success toast
- [ ] A failing file (invalid JSON or backend error) stays in the list with its own inline error while other files still succeed
- [ ] Import dialog closes only once every file has succeeded
- [ ] Data reloads after a successful import

### Error Handling

- [ ] Backend validation errors display inline
- [ ] Network errors display inline in sheets and in dialogs
- [ ] Toast shows for delete/archive operations in main page and for dialog success (add/edit key, export, import)
- [ ] No toast shows for the success case inside `ViewValuesSheetComponent` (inline alert only)
- [ ] Success messages use green alert variant (sheet) or toast (dialog)
- [ ] Error messages use destructive alert variant

---

## 📚 Related Documentation

### Backend

- **Translation Service**: `MicroservicesArchitecture/Doc/TRANSLATION_SERVICE_GUIDE.md`
- **Backend API**: Swagger at http://localhost:5006/swagger

### Frontend Patterns

- **Error Handling**: [ERROR_HANDLER_USAGE_GUIDE.md](./ERROR_HANDLER_USAGE_GUIDE.md)
- **Zardui Components**: [ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md)
- **Angular Patterns**: `.claude/instructions/Angular.instructions.md`
- **Component Guide**: [COMPONENT_USAGE_GUIDE.md](./COMPONENT_USAGE_GUIDE.md)
- **Translation System / RTL**: [TRANSLATION_SYSTEM_GUIDE.md](./TRANSLATION_SYSTEM_GUIDE.md)
- **Resolver & Pipe**: [TRANSLATION_RESOLVER_PIPE_GUIDE.md](./TRANSLATION_RESOLVER_PIPE_GUIDE.md)

---

## ✨ Summary

**Complete CRUD + import/export implementation for translation management:**

1. ✅ Create Translation Key - Dialog with validation
2. ✅ Read Translation Keys - Paginated list with filters (search, category, tenant, archived)
3. ✅ Update Translation Key - Dialog with validation
4. ✅ Archive / Unarchive Translation Key - Soft-delete alternative with confirmation
5. ✅ Delete Translation Key - With confirmation
6. ✅ Create Translation Value - Inline form in sheet
7. ✅ Update Translation Value - Inline form in sheet
8. ✅ Delete Translation Value - With confirmation
9. ✅ Export Translations - Download a language/category as `.json`
10. ✅ Import Translations - Multi-file drag-and-drop import with per-file language and parallel processing

**Key Achievements:**

- ✅ Event-driven architecture with TranslationEventsService
- ✅ Toast-on-success for dialogs; inline success alert for the long-lived values sheet
- ✅ Green success alerts with proper styling
- ✅ Consistent error handling throughout
- ✅ Data reloads after all operations
- ✅ User-friendly confirmation dialogs
- ✅ Loading states and empty states
- ✅ 100% Zardui components (no custom UI)

---

**Version:** 1.1
**Last Updated:** August 13, 2026
**Status:** ✅ Production Ready

### Changelog

- **1.1 (Aug 13, 2026):** Audited the whole feature against current source (`apps/admin/src/app/features/translation/`, `libs/core/src/lib/translation/`) and corrected several stale/missing items: file structure (actual nested `translations/` folder, `export-dialog/`, `import-dialog/`, `translation.routes.ts` not `translations.routes.ts`); documented the Archive/Unarchive key action (`toggleArchive`), Export dialog, and the multi-file Import dialog (per-file language auto-detection, tenant-key preview, parallel `forkJoin` import, partial-failure retry) that were missing entirely; fixed the API endpoints table to the real versioned Gateway paths (`/api/v1/translations/...`) and added the missing `toggle-archive` and `import` endpoints; corrected `TranslationService`'s method list/signatures (`getTranslations(language, category?)` not a query object; deletes return `Observable<boolean>` not `void`); fixed the Add/Edit Value form's validators (no length restriction on `language`; added the undocumented `tenantId` field); clarified that dialogs use `toast.success()` + close while only the values sheet uses an inline success alert (previous wording blanket-banned toast in "sheets/dialogs," which no longer matches `AddEditKeyDialogComponent`/`ExportDialogComponent`/`ImportDialogComponent`); fixed a dead `.github/instructions/Angular.instructions.md` link to the real `.claude/instructions/Angular.instructions.md` path.
