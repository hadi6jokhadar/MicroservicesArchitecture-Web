# Translation Feature Guide

**Version:** 1.0  
**Date:** January 28, 2026  
**Status:** ✅ Complete

---

## 📋 Overview

Complete frontend implementation of the Translation Management feature with full CRUD operations for translation keys and values. Integrates with the Translation Service backend (localhost:5006) to manage application translations across multiple languages.

---

## 🎯 Features

### Translation Keys Management

- ✅ **List Keys** - Paginated table with search and category filtering
- ✅ **Add Key** - Dialog form to create new translation keys
- ✅ **Edit Key** - Dialog form to update key description (key/category immutable)
- ✅ **Delete Key** - Confirmation dialog with cascade delete warning
- ✅ **View Values** - Side sheet showing all translation values for a key

### Translation Values Management

- ✅ **List Values** - Display all language translations for a key
- ✅ **Add Value** - Inline form to create new language translation
- ✅ **Edit Value** - Inline form to update existing translation
- ✅ **Delete Value** - Confirmation dialog to remove translation value
- ✅ **Global/Tenant** - Visual indicators for global vs tenant-specific translations

---

## 📦 Architecture

### File Structure

```
apps/admin/src/app/features/translation/
├── translations.component.ts          # Main list page
├── translations.component.html
├── translations.component.scss
├── translations.routes.ts             # Lazy-loaded routes
├── translation-events.service.ts      # Event coordination service
├── view-values-sheet/
│   ├── view-values-sheet.component.ts  # Side sheet for values
│   ├── view-values-sheet.component.html
│   └── view-values-sheet.component.scss
└── add-edit-key-dialog/
    ├── add-edit-key-dialog.component.ts  # Dialog for key CRUD
    ├── add-edit-key-dialog.component.html
    └── add-edit-key-dialog.component.scss

libs/core/src/lib/translation/
├── models.ts                    # TypeScript interfaces
├── translation.service.ts       # HTTP service
└── index.ts                     # Public exports
```

### Components

**TranslationsComponent** - Main page

- Paginated table of translation keys
- Search and category filters
- Action dropdowns (View, Edit, Delete)
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

**TranslationEventsService** - Event coordination

- Emits `translationKeysChanged$` after CRUD operations
- Main component subscribes and reloads data
- Clean separation between components

---

## 🔗 Backend Integration

### API Endpoints

| Endpoint                        | Method | Purpose                          | Status |
| ------------------------------- | ------ | -------------------------------- | ------ |
| `/api/translations/keys`        | GET    | Get paginated translation keys   | ✅     |
| `/api/translations/keys`        | POST   | Create translation key           | ✅     |
| `/api/translations/keys`        | PUT    | Update translation key           | ✅     |
| `/api/translations/keys/{id}`   | DELETE | Delete translation key           | ✅     |
| `/api/translations`             | POST   | Set translation value (add/edit) | ✅     |
| `/api/translations/values/{id}` | DELETE | Delete translation value         | ✅     |

### TranslationService

**Location:** `libs/core/src/lib/translation/translation.service.ts`

All methods support optional `HttpContext` for error handling control:

```typescript
getTranslationKeys(query: IGetTranslationKeysQuery): Observable<IPaginatedList<ITranslationKeyDto>>
createTranslationKey(command: ICreateTranslationKeyCommand, context?: HttpContext): Observable<ITranslationKeyDto>
updateTranslationKey(command: IUpdateTranslationKeyCommand, context?: HttpContext): Observable<ITranslationKeyDto>
deleteTranslationKey(id: number): Observable<void>
setTranslation(command: ISetTranslationCommand, context?: HttpContext): Observable<ITranslationValueDto>
deleteTranslationValue(id: number): Observable<void>
getTranslations(query: IGetTranslationsQuery): Observable<IPaginatedList<ITranslationDto>>
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

### Sheet Error Handling (CRITICAL)

**❌ NEVER use toast in sheets/dialogs** - toasts appear at screen edge and may be hidden.

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
  language: FormControl<string>; // Required, 2-5 characters (e.g., en, ar, en-US)
  value: FormControl<string>; // Required
}
```

**Validators:**

- `language`: Required, min 2, max 5 characters
- `value`: Required

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
- ✅ `ZardInputDirective` - Text inputs
- ✅ `ZardLoaderComponent` - Loading spinners
- ✅ `ZardPaginationImports` - Page navigation
- ✅ `ZardSheetService` - View values side panel

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

- ✅ **SKIP_ERROR_TOAST in sheets/dialogs** - Prevents hidden toast notifications
- ✅ **Inline error display** - Use `<z-alert>` for errors/success
- ✅ **extractErrorMessage helper** - Consistent error formatting
- ✅ **Validation errors** - Show backend and frontend validation

### User Experience

- ✅ **Confirmation dialogs** - For destructive actions
- ✅ **Loading states** - Show loaders during operations
- ✅ **Empty states** - Helpful messages when no data
- ✅ **Success feedback** - Green alerts for successful operations
- ✅ **Data reload** - Auto-refresh after CRUD operations

### Code Organization

- ✅ **Colocated components** - All files in same folder
- ✅ **Feature modules** - Translation feature self-contained
- ✅ **Shared services** - TranslationService in @ihsan/core
- ✅ **Reusable models** - Interfaces and classes in @ihsan/core
- ✅ **Event coordination** - TranslationEventsService for component communication

---

## ❌ Common Mistakes to Avoid

### Wrong: Toast in sheets/dialogs

```typescript
// ❌ WRONG - Toast hidden behind sheet
this._service.operation(data).subscribe({
  next: () => toast.success('Success'),
});
```

```typescript
// ✅ CORRECT - Inline success message
const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
this._service.operation(data, context).subscribe({
  next: () => this.successMessage.set('Success'),
});
```

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

### Error Handling

- [ ] Backend validation errors display inline
- [ ] Network errors display inline in sheets/dialogs
- [ ] Toast shows for delete operations in main page
- [ ] No toast shows in sheets/dialogs
- [ ] Success messages use green alert variant
- [ ] Error messages use destructive alert variant

---

## 📚 Related Documentation

### Backend

- **Translation Service**: `MicroservicesArchitecture/Doc/TRANSLATION_SERVICE_GUIDE.md`
- **Backend API**: Swagger at http://localhost:5006/swagger

### Frontend Patterns

- **Error Handling**: [ERROR_HANDLER_USAGE_GUIDE.md](./ERROR_HANDLER_USAGE_GUIDE.md)
- **Zardui Components**: [ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md)
- **Angular Patterns**: `.github/instructions/Angular.instructions.md`
- **Component Guide**: [COMPONENT_USAGE_GUIDE.md](./COMPONENT_USAGE_GUIDE.md)

---

## ✨ Summary

**Complete CRUD implementation for translation management:**

1. ✅ Create Translation Key - Dialog with validation
2. ✅ Read Translation Keys - Paginated list with filters
3. ✅ Update Translation Key - Dialog with validation
4. ✅ Delete Translation Key - With confirmation
5. ✅ Create Translation Value - Inline form in sheet
6. ✅ Update Translation Value - Inline form in sheet
7. ✅ Delete Translation Value - With confirmation

**Key Achievements:**

- ✅ Event-driven architecture with TranslationEventsService
- ✅ No hidden toast messages in sheets/dialogs
- ✅ Green success alerts with proper styling
- ✅ Consistent error handling throughout
- ✅ Data reloads after all operations
- ✅ User-friendly confirmation dialogs
- ✅ Loading states and empty states
- ✅ 100% Zardui components (no custom UI)

---

**Version:** 1.0  
**Last Updated:** January 28, 2026  
**Status:** ✅ Production Ready
