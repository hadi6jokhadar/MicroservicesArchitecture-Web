---
name: fe-create-crud-page
description: Create a complete Angular CRUD feature page — events service for state, server-side paginated table, add/edit dialogs, view sheet, i18n keys in en.json and ar.json, and routing registration. Reference implementation is the translation feature. Use this whenever the user asks to create a CRUD page, add a feature page, build a list/table page, scaffold an admin feature, or add a new page with create/edit/delete functionality.
---

# Create New CRUD Page with Server-Side Functionality

**Reference feature:** `apps/admin/src/app/features/translation/translations/`

## Step 1: Create State Management Service

**File:** `apps/admin/src/app/features/[feature-name]/[feature]-events.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class [Feature]EventsService {
  private readonly _[feature]Changed$ = new Subject<void>();
  readonly [feature]Changed$ = this._[feature]Changed$.asObservable();

  notify[Feature]Changed(): void {
    this._[feature]Changed$.next();
  }
}
```

> Name the subject and method after the feature (e.g., `translationKeysChanged$` / `notifyTranslationKeysChanged()`). Avoid generic names like `dataChanged$`.

Also add `takeUntilDestroyed` import to the main component:

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
```

## Step 2: Create the Main Table Page

### TypeScript Logic

1. Inject services (`Service`, `DialogService`, `SheetService`, `EventsService`)
2. Define Signals: `data`, `isLoading`, `currentPage`, `totalPages`, `totalCount`
3. Define `readonly pageSize = 10` as a plain number (not a signal)
4. Create a Reactive Form for filters
5. In `constructor()`:
   - Use `effect()` to watch `currentPage` — but only call `loadData()` when `page > 1` (initial load comes from `ngOnInit`)
   - Subscribe to specific filter controls with `valueChanges.pipe(takeUntilDestroyed())` to reset page and reload
   - Subscribe to `eventsService.[feature]Changed$` with `takeUntilDestroyed()` to reload on external changes
6. Call `loadData()` from `ngOnInit()` for the first load

```typescript
constructor() {
  // Watch page changes — skip page 1 (ngOnInit handles initial load)
  effect(() => {
    const page = this.currentPage();
    if (page > 1) {
      this.loadData();
    }
  });

  // Watch specific filter controls
  this.filterForm.get('searchType')?.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.currentPage.set(1);
      this.loadData();
    });

  // Reload on dialog/sheet success events
  this._eventsService.[feature]Changed$
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.loadData());
}

ngOnInit(): void {
  this.loadData();
}

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
    error: () => { this.isLoading.set(false); }
  });
}
```

### Template Structure

1. **Header**: Title + action buttons (`z-button`) for Create/Export
2. **Filter Card**: `z-card` containing `form` with `z-form-field` inputs
3. **Table Card**: `z-card` containing:
   - `@if (isLoading())`: `z-loader`
   - `@else if (empty)`: `z-empty`
   - `@else`: result count, `table[z-table]` with row actions, `z-pagination`

## Step 3: Create Add/Edit Dialogs

**Reference:** `apps/admin/src/app/features/translation/translations/add-edit-key-dialog/`

1. Inject `Z_MODAL_DATA` (receive existing item for edit mode) and `ZardDialogRef` (close/submit)
2. `isEditMode = signal(!!data)` — determine mode
3. Initialize Reactive Form with data or empty values
4. On success: `eventsService.notifyDataChanged()` then close dialog
5. Success pattern: `toast.success(...)` + immediate `_dialogRef.close({ success: true })` — no inline success alerts, no setTimeout

```html
<div class="dialog-container">
  <form [formGroup]="myForm" (ngSubmit)="onSubmit()" class="dialog-form">
    <z-form-field zardId="name" #f="zardId">
      <label z-form-label [for]="f.id()">{{ 'feature.dialog.nameLabel' | translate }} *</label>
      <z-form-control>
        <input z-input [id]="f.id()" type="text" formControlName="name" />
      </z-form-control>
      @if (myForm.get('name')?.hasError('required') && myForm.get('name')?.touched) {
        <span z-form-error>{{ 'feature.dialog.validation.nameRequired' | translate }}</span>
      }
    </z-form-field>

    @if (errorMessage()) {
      <z-alert zType="destructive" zIcon="circle-alert" [zDescription]="errorMessage()!" />
    }

    <div class="dialog-actions">
      <button z-button zType="outline" type="button" (click)="onCancel()">
        {{ 'common.cancel' | translate }}
      </button>
      <button z-button type="submit" [zLoading]="isLoading()" [zDisabled]="myForm.invalid">
        {{ isEditMode() ? ('common.save' | translate) : ('common.create' | translate) }}
      </button>
    </div>
  </form>
</div>
```

## Step 4: Create View Sheet

**Reference:** `apps/admin/src/app/features/translation/translations/view-values-sheet/`

1. Open via `this._sheetService.create({ zContent: Component, zSide: this._rtlService.getSheetSide('right'), zHideFooter: true, ... })`
2. Template uses `.sheet-header` + `.sheet-content` structure
3. Updates parent via `eventsService` if changes affect the main table

## Step 5: Update Translation Files

Add feature keys to both `apps/admin/src/assets/i18n/en.json` and `ar.json`:

```json
{
  "[feature]": {
    "title": "Feature Title",
    "table": { "col1": "Column 1", "actions": "Actions" },
    "dialog": { "addTitle": "Add Item", "editTitle": "Edit Item" }
  }
}
```

## Step 6: Add Routing

**File:** `apps/admin/src/app/features/[feature]/[feature].routes.ts`

```typescript
export const featureRoutes: Routes = [{ path: '', component: FeatureComponent }];
```

Register in `apps/admin/src/app/pages/pages.routes.ts`:

```typescript
import { authGuard, roleGuard } from '@ihsan/core';

{
  path: '[feature-path]',
  loadChildren: () => Promise.resolve(featureRoutes),
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin', 'SuperAdmin'] }, // adjust roles as required
}
```

## Step 7: Add to Sidebar

Add navigation item in `apps/admin/src/app/pages/pages.component.ts` to `sidebarPages` signal.
