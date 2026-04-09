---
agent: 'agent'
description: 'Create a new CRUD page with server-side table, filters, add/edit dialogs, view sheets, and consistent design patterns.'
---

# Create New CRUD Page with Server-Side Functionality

This workflow outlines the process of creating a new feature page with a data table, server-side pagination/filtering, add/edit dialogs, view sheets, and consistent design patterns, using the `Translations` feature as the reference implementation.

**Reference Feature**: `apps/admin/src/app/features/translation/translations/`

## Prerequisites

- Feature module created in `apps/admin/src/app/features/[feature-name]`.
- Backend endpoints ready for CRUD operations.
- `Zard` UI library available.

## Step 1: Create State Management Service

Create a lightweight service to coordinate updates between the main page and dialogs/sheets.

**File:** `apps/admin/src/app/features/[feature-name]/[feature]-events.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class [Feature]EventsService {
  private readonly _dataChanged$ = new Subject<void>();

  readonly dataChanged$ = this._dataChanged$.asObservable();

  notifyDataChanged(): void {
    this._dataChanged$.next();
  }
}
```

## Step 2: Create the Main Table Page

**Reference Files:**

- `apps/admin/src/app/features/translation/translations/translations.component.html`
- `apps/admin/src/app/features/translation/translations/translations.component.ts`
- `apps/admin/src/app/features/translation/translations/translations.component.scss`

### 2.1 Component Logic (.ts)

1. Inject necessary services (`Service`, `DialogService`, `SheetService`, `EventsService`).
2. Define Signals for state: `data`, `isLoading`, `currentPage`, `totalPages`, `totalCount`.
3. Create a Reactive Form for filters.
4. Use `effect()` to handle pagination changes.
5. Subscribe to filter form changes to reset page and reload.
6. Subscribe to `eventsService.dataChanged$` to reload data.

```typescript
// Key Pattern for Loading Data
loadData(): void {
  this.isLoading.set(true);
  const formValue = this.filterForm.getRawValue();

  const query: IGetQuery = {
    pageNumber: this.currentPage(),
    pageSize: this.pageSize,
    searchTerm: formValue.searchTerm || undefined,
  };

  this._service.getData(query).subscribe({
    next: (response) => {
      this.data.set(response.items);
      this.totalPages.set(response.totalPages);
      this.totalCount.set(response.totalCount);
      this.isLoading.set(false);
    },
    error: () => {
      this.isLoading.set(false);
    }
  });
}
```

### 2.2 Template Structure (.html)

1. **Header:** Title, subtitle, and action buttons (Create, Export, Import) using `z-button`.
2. **Filter Card:** `z-card` containing `form` with `z-form-field` inputs.
3. **Table Card:** `z-card` containing:
   - `@if (isLoading())`: `z-loader`.
   - `@else if (empty)`: `z-empty`.
   - `@else`: Result count header, HTML `table` with `z-table` directives, and `z-pagination`.

### 2.3 Styling (.scss)

1. Use CSS variables (`--color-foreground`, `--color-muted`, etc.).
2. Implement responsive design using `@media (max-width: ...)` breakpoints.
3. Use strict class nesting (e.g., `.feature-container > .header > .filter-form`).

## Step 3: Create Add/Edit Dialogs

Create a dialog component that handles both creation and updates.

**Reference Files:** `apps/admin/src/app/features/translation/translations/add-edit-key-dialog/`

### 3.1 Dialog Logic (.ts)

1. Inject `Z_MODAL_DATA` to receive existing item (if edit mode).
2. Inject `ZardDialogRef` to close/submit.
3. Use `signal(!!data)` to determine `isEditMode`.
4. Initialize Reactive Form with data or empty values.
5. In `onSubmit`, condition logic based on `isEditMode`.
6. On success, call `eventsService.notifyDataChanged()` and close dialog.

### 3.2 Dialog Template (.html)

1. Wrap content in `<div class="dialog-container">`.
2. Use `<form class="dialog-form">`.
3. Use `z-form-field` + `z-input` for form controls.
4. Show inline validation errors using `@if (control.hasError && control.touched)`.
5. Use `.dialog-actions` for Cancel/Submit buttons at the bottom.

## Step 4: Create View/Edit Sheet

Create a side sheet for viewing details or managing sub-items.

**Reference Files:** `apps/admin/src/app/features/translation/translations/view-values-sheet/`

### 4.1 Sheet Pattern

1. Opened via `this._sheetService.create({ zContent: Component, zSide: this._rtlService.getSheetSide('right'), ... })` from main page.
2. Template uses `.sheet-header`, `.sheet-content` structure.
3. Can contain its own internal form for adding/editing sub-items without closing the sheet.
4. Updates parent via `eventsService` if changes affect the main table.

## Step 5: Update Translation Files

Add new keys to avoid hardcoded text.

**Files:**

- `apps/admin/src/assets/i18n/en.json`
- `apps/admin/src/assets/i18n/ar.json`

**Structure:**

```json
{
  "[feature]": {
    "title": "Feature Title",
    "table": {
      "col1": "Column 1 Name",
      "actions": "Actions"
    },
    "dialog": {
      "addTitle": "Add Item",
      "editTitle": "Edit Item"
    }
  }
}
```

## Step 6: Add Routing

**File:** `apps/admin/src/app/features/[feature]/[feature].routes.ts`

```typescript
export const featureRoutes: Routes = [
  {
    path: '',
    component: FeatureComponent,
  },
];
```

**Register in Main Routes:** `apps/admin/src/app/pages/pages.routes.ts`

```typescript
{
  path: '[feature-path]',
  loadChildren: () => Promise.resolve(featureRoutes),
  canActivate: [authGuard],
},
```

## Step 7: Add to Sidebar

Add the new navigation item to the sidebar menu.

**File:** `apps/admin/src/app/pages/pages.component.ts`
