---
agent: 'agent'
description: 'Verify if an existing table follows the ZardTable design system and standards.'
---

# Verify ZardTable Implementation

Use this workflow to verify a table implementation adheres to the MicroservicesArchitecture standard.

## 1. Verify Imports

- [ ] Component imports the necessary `ZardTable` directives from `@ihsan/ui`:
  - `ZardTableComponent`, `ZardTableHeaderComponent`, `ZardTableBodyComponent`
  - `ZardTableRowComponent`, `ZardTableHeadComponent`, `ZardTableCellComponent`

## 2. Verify HTML Structure

- [ ] **Container**: Table wrapped in `<div class="table-container">`.
- [ ] **Card**: Container inside a `<z-card>`.
- [ ] **States**: Handles `isLoading()` with `z-loader` and empty state with `z-empty`.
- [ ] **Directives**: `<table>` uses `z-table` directive.
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
- [ ] **Media Query**: `@media (max-width: 768px)` block for responsive transformation.

## 5. Conversion Steps (If Verification Fails)

If the table does not match the standard:

1. **Wrap the Table**: Add `table-container` and `table-wrapper` divs.
2. **Add Directives**: Add `z-table` and related directives to table elements.
3. **Add Data Labels**: Add `[attr.data-label]="'key' | translate"` to all `td` elements.
4. **Update SCSS**: Add the standard SCSS from `.github/prompts/create_zard_table.prompt.md`.
5. **Test**: Verify table on desktop and mobile card-view.

## 6. Verify Filters (If Applicable)

- [ ] **Boolean Filter**: Uses `ZardSwitchComponent` instead of `z-select`.
- [ ] **HTML**: Switch wrapped in `<div class="filter-field switch-field">`.
- [ ] **TypeScript**: `isArchived` form control initialized as `boolean` (`false`), not `string`.
- [ ] **SCSS**: `.switch-field` with `width: fit-content` and `align-items: center`.
