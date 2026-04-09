---
agent: 'agent'
description: 'Verify if a page follows the CRUD page creation standards and patterns.'
---

# CRUD Page Verification Workflow

Use this workflow to audit an existing CRUD page against the project's frontend standards.

## 1. Load Standards

First, read the architectural standards defined in the `create_crud_page` prompt:
`.github/prompts/create_crud_page.prompt.md`

## 2. Analyze Target Page

The user should provide the path to the feature/page they want verified (e.g., `apps/admin/src/app/features/translation`).

1. **Explore the Structure**: Map out the feature's directory, looking for components (list/table, dialogs, sheets), services, and routes.
2. **Sample Key Files**: Inspect the main page component (`.ts`, `.html`), the events service, and the routing file.

## 3. Verification Checklist

### Feature Structure & State

- [ ] **Events Service**: Must exist (e.g., `[Feature]EventsService`) and be provided in `root`.
- [ ] **Reactivity**: Must expose a `dataChanged$` observable used to trigger data reloads.

### Main Page Component (List/Table)

- [ ] **State Management**: Must use Signals for `data`, `isLoading`, `currentPage`, and `totalCount`.
- [ ] **Filter Form**: Must use a `FormGroup` for search/filters.
- [ ] **Pagination**: Must use `effect()` or subscription to `currentPage` to trigger `loadData()`.
- [ ] **Template Structure**:
  - [ ] **Header**: Title and action buttons (`z-button`) for Create/Export.
  - [ ] **Cards**: Filters and Table wrapped in `z-card`.
  - [ ] **States**: Uses `z-loader` for loading and `z-empty` for empty states.
  - [ ] **Pagination**: Uses `z-pagination` component.

### Add/Edit Dialogs

- [ ] **Injection**: Must inject `Z_MODAL_DATA` and `ZardDialogRef`.
- [ ] **Mode Detection**: Logic to distinguish between Create and Edit modes.
- [ ] **Validation**: Uses Reactive Forms with `z-form-field`, `z-input`, and `z-form-error`.
- [ ] **Submission**:
  - [ ] Calls distinct API methods for Create vs Update.
  - [ ] Calls `eventsService.notifyDataChanged()` on success.
  - [ ] Closes dialog with `dialogRef.close()`.

### View/Action Sheets

- [ ] **Usage**: Opened via `ZardSheetService`.
- [ ] **Structure**: Uses `.sheet-header` and `.sheet-content` classes.
- [ ] **Updates**: If valid, notifies parent via `eventsService`.

### Internationalization (i18n)

- [ ] **JSON Files**: Feature keys added to `src/assets/i18n/{en,ar}.json`.
- [ ] **Usage**: No hardcoded text strings; uses `| translate` pipe.

### Routing & Navigation

- [ ] **Lazy Loading**: Feature routes defined in `[feature].routes.ts`.
- [ ] **Main Routes**: Lazy-loaded in `pages.routes.ts` with `authGuard`.
- [ ] **Sidebar**: Navigation item added in `pages.component.ts`.

## 4. Report Results

Generate a verification report for the user:

- **✅ Compliant**: List areas that follow the standard perfectly.
- **❌ Violations**: List specific files or patterns that deviate from the standard.
- **⚠️ Recommendations**: Suggest how to fix the violations to align with the standard patterns.
