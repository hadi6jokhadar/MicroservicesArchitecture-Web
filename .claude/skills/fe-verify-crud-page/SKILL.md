---
name: fe-verify-crud-page
description: Audit an existing Angular CRUD feature page against project standards — checks events service, signal-based state, table structure, dialog patterns, sheet patterns, i18n completeness in both en.json and ar.json, and routing configuration. Use this whenever the user asks to verify, audit, review, check, or validate an Angular CRUD page, feature page, or admin page against project standards.
---

# CRUD Page Verification Workflow

Use this workflow to audit an existing CRUD page against the project's frontend standards.

## 1. Load Standards

Read the `fe-create-crud-page` skill before proceeding to understand the reference patterns.

## 2. Analyze Target Page

The user should provide the path to the feature/page to verify (e.g., `apps/admin/src/app/features/translation`).

1. **Explore the Structure**: Map the feature's directory — components (list/table, dialogs, sheets), services, and routes.
2. **Sample Key Files**: Inspect the main page component (`.ts`, `.html`), the events service, and the routing file.

## 3. Verification Checklist

### Feature Structure & State

- [ ] **Events Service**: Exists (e.g., `[Feature]EventsService`) and provided in `root`.
- [ ] **Reactivity**: Exposes a `dataChanged$` observable used to trigger data reloads.

### Main Page Component (List/Table)

- [ ] **State Management**: Uses Signals for `data`, `isLoading`, `currentPage`, and `totalCount`.
- [ ] **Filter Form**: Uses a `FormGroup` for search/filters.
- [ ] **Pagination**: Uses `effect()` or subscription to `currentPage` to trigger `loadData()`.
- [ ] **Template Structure**:
  - [ ] Header with title and action buttons (`z-button`) for Create/Export.
  - [ ] Filters and Table wrapped in `z-card`.
  - [ ] `z-loader` for loading state; `z-empty` for empty state.
  - [ ] `z-pagination` component for paging.

### Add/Edit Dialogs

- [ ] **Injection**: Injects `Z_MODAL_DATA` and `ZardDialogRef`.
- [ ] **Mode Detection**: Logic distinguishes between Create and Edit modes.
- [ ] **Validation**: Reactive Forms with `z-form-field`, `z-input`, and `z-form-error`.
- [ ] **Submission**:
  - [ ] Calls distinct API methods for Create vs Update.
  - [ ] Calls `eventsService.notifyDataChanged()` on success.
  - [ ] Closes dialog with `dialogRef.close()`.

### View/Action Sheets

- [ ] **Usage**: Opened via `ZardSheetService`.
- [ ] **Structure**: Uses `.sheet-header` and `.sheet-content` classes.
- [ ] **Updates**: Notifies parent via `eventsService` on success.

### Internationalization (i18n)

- [ ] **JSON Files**: Feature keys added to `src/assets/i18n/{en,ar}.json`.
- [ ] **Usage**: No hardcoded text — uses `| translate` pipe throughout.

### Routing & Navigation

- [ ] **Lazy Loading**: Feature routes defined in `[feature].routes.ts`.
- [ ] **Main Routes**: Lazy-loaded in `pages.routes.ts` with `authGuard`.
- [ ] **Sidebar**: Navigation item added in `pages.component.ts`.

## 4. Report Results

Generate a verification report:

- **Compliant**: List areas that follow the standard correctly.
- **Violations**: List specific files or patterns that deviate from the standard.
- **Recommendations**: Explain how to fix each violation to align with the standard.
