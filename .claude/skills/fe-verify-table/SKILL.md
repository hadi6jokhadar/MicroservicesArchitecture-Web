---
name: fe-verify-table
description: Audit an existing Angular table against ZardTable project standards — checks imports, HTML directive structure, responsive SCSS with mobile card view, data-label attributes, and filter patterns. Use this whenever the user asks to verify, check, audit, review, or fix a table component in Angular, or before considering a table implementation complete.
---

# Verify ZardTable Implementation

Use this workflow to verify a table implementation adheres to the project's standard.

## 1. Verify Imports

- [ ] Component imports the necessary directives from `@ihsan/ui`:
  - `ZardTableComponent`, `ZardTableHeaderComponent`, `ZardTableBodyComponent`
  - `ZardTableRowComponent`, `ZardTableHeadComponent`, `ZardTableCellComponent`

## 2. Verify HTML Structure

- [ ] **Container**: Table wrapped in `<div class="table-container">`.
- [ ] **Card**: Container inside a `<z-card>`.
- [ ] **States**: Handles `isLoading()` with `z-loader` and empty state with `z-empty`.
- [ ] **Directive**: `<table>` uses the `z-table` directive.
- [ ] **Sub-components**: Internal elements use their directives:
  - `thead[z-table-header]`, `tbody[z-table-body]`, `tr[z-table-row]`, `th[z-table-head]`, `td[z-table-cell]`

## 3. Verify Responsive Implementation

- [ ] **Data Labels**: `td` elements have `[attr.data-label]` bound to translated header name.
  ```html
  <td z-table-cell [attr.data-label]="'feature.table.name' | translate">...</td>
  ```
- [ ] **Hidden Headers**: SCSS hides `thead` on screens smaller than 768px.
- [ ] **Card Layout**: SCSS changes `tr` to card-like layout on mobile (`display: grid`, `border`, `border-radius`).
- [ ] **Cell Layout**: `td` elements display as flex with `::before { content: attr(data-label) }`.
- [ ] **Action Column**: Action column handled specially (no label, no border).

## 4. Verify Styling (SCSS)

- [ ] **Table Wrapper**: `.table-wrapper` with `overflow-x: auto`.
- [ ] **Table Header**: `.table-header` and `.results-info` styled.
- [ ] **Pagination**: `.pagination-container` with top border and padding.
- [ ] **Media Query**: `@media (max-width: 768px)` block for responsive card transformation.

## 5. Conversion Steps (If Verification Fails)

If the table does not match the standard:

1. **Wrap the Table**: Add `table-container` and `table-wrapper` divs.
2. **Add Directives**: Add `z-table` and related directives to table elements.
3. **Add Data Labels**: Add `[attr.data-label]="'key' | translate"` to all `td` elements.
4. **Update SCSS**: Apply the standard responsive SCSS from the `fe-create-table` skill.
5. **Test**: Verify the table on desktop and in mobile card-view.

## 6. Verify Filters (If Applicable)

- [ ] **Boolean Filter**: Uses `ZardSwitchComponent` instead of `z-select`.
- [ ] **HTML**: Switch wrapped in `<div class="filter-field switch-field">`.
- [ ] **TypeScript**: `isArchived` form control initialized as `boolean` (`false`), not `string`.
- [ ] **SCSS**: `.switch-field` with `width: fit-content` and `align-items: center`.

## 7. Verify URL Query-Param Sync (MANDATORY for paginated/filtered pages)

Full pattern: `.claude/instructions/Angular.instructions.md` section "2d. URL-Synced List/Filter State". Reference: `apps/admin/src/app/features/translation/translations/translations.component.ts`.

- [ ] **Pagination binding**: `<z-pagination [zTotal]="totalPages()" [zPageIndex]="currentPage()" (zPageIndexChange)="onPageChange($event)" />` — NOT the two-way `[(zPageIndex)]="currentPage"` banana binding.
- [ ] **Sole fetch trigger**: constructor subscribes to `this._route.queryParamMap` (`takeUntilDestroyed()`), calling `restoreFromQueryParams(map)` then `loadData()` — no `ngOnInit()` load call, no `effect()` page-guard.
- [ ] **`restoreFromQueryParams(map: ParamMap)`** patches the filter form with `{ emitEvent: false }` and sets `currentPage` via `queryParamNumber`.
- [ ] **`writeStateToUrl(replaceUrl = true)`** exists and is the terminal call for every existing filter trigger (`valueChanges`, explicit search button, `onClearFilters()`), using `updateQueryParams` from `@ihsan/core`; fields at their default (including `'all'`/`'__all__'` sentinels) are passed as `undefined`.
- [ ] **`onPageChange(page)`** calls `writeStateToUrl(false)` (normal history entry); filter-triggered writes use the default `replaceUrl: true` (no history spam per keystroke).
- [ ] **Client-side-filtered pages** (resolver preloads the full dataset, filtering is local `computed()`s): the `queryParamMap` subscription calls `restoreFromQueryParams()` only, not an unconditional `loadData()` — unless a field is genuinely server-only, in which case `loadData()` fires only when that field's restored value differs from what's already loaded.
