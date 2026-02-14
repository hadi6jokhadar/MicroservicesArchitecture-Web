---
description: Verify if an existing table follows the ZardTable design system and standards.
---

This workflow helps you verify if a table implementation adheres to the MicroservicesArchitecture standard, ensuring consistent design, behavior, and responsiveness.

## 1. Verify Imports

Ensure the component imports the necessary `ZardTable` directives.

- [ ] Open the component file (`.ts`).
- [ ] Check for imports from `@microservices-architecture/ui` (or equivalent path):
  - `ZardTableComponent`
  - `ZardTableHeaderComponent`
  - `ZardTableBodyComponent`
  - `ZardTableRowComponent`
  - `ZardTableHeadComponent`
  - `ZardTableCellComponent`
  - `ZardTableCaptionComponent`

## 2. Verify HTML Structure

Check if the table is wrapped correctly to support the standard layout.

- [ ] **Container**: Is the table wrapped in a `<div class="table-container">`?
- [ ] **Card**: Is the container inside a `<z-card>`?
- [ ] **States**: Are there handling for `isLoading()` and empty states (`z-loader`, `z-empty`)?
- [ ] **Directives**: Does the `<table>` tag use the `z-table` directive?
  - Example: `<table z-table ...>`
- [ ] **Sub-components**: Do internal elements use their directives?
  - `thead[z-table-header]`
  - `tbody[z-table-body]`
  - `tr[z-table-row]`
  - `th[z-table-head]`
  - `td[z-table-cell]`

## 3. Verify Responsive Implementation

The standard table design includes a mobile-optimized view where rows turn into cards and cells stack vertically.

- [ ] **Data Labels**: Do `td` elements have `[attr.data-label]` bound to the translated header name?
  - Example: `<td z-table-cell [attr.data-label]="'tenants.table.name' | translate">...</td>`
- [ ] **Hidden Headers**: Does the SCSS hide the `thead` on screens smaller than 768px?
- [ ] **Card Layout**: Does the SCSS change `tr` (row) display to a card-like layout on mobile?
  - `display: grid` or `flex`
  - `border: 1px solid var(--color-border)`
  - `border-radius: var(--radius)`
  - `margin-bottom: 1rem`
- [ ] **Cell Layout**: Do `td` elements display as flex containers with key-value pairs?
  - `display: flex`
  - `justify-content: space-between`
  - `&::before { content: attr(data-label); ... }`
- [ ] **Action Column**: Is the action column handled specifically (e.g., no label, right-aligned, top border)?

## 4. Verify Styling (SCSS)

Check the component's SCSS file for the standard table styles. Use `create_zard_table.md` as the source of truth for the required SCSS.

- [ ] **Table Wrapper**: Is there a `.table-wrapper` class dealing with `overflow-x: auto`?
- [ ] **Header Styling**: formatting for `.table-header` and `.results-info`?
- [ ] **Hover Effects**: Are relationships defined for hover states (`&:hover`)?
- [ ] **Pagination**: Is the pagination container styled with top border and padding?
- [ ] **Media Query**: Is there a `@media (max-width: 768px)` block handling the responsive transformation?

## 5. Conversion Steps (If Verification Fails)

If the table does not match the standard:

1.  **Wrap the Table**: Add the `table-container` and `table-wrapper` divs around your existing table.
2.  **Add Directives**: Add `z-table` and related directives to your table elements.
3.  **Add Data Labels**: Add `[attr.data-label]="'translation.key' | translate"` (or static `data-label`) to all `td` elements.
4.  **Update SCSS**: Copy the standard SCSS from `create_zard_table.md` into your component's stylesheet.
5.  **Test**: Verify the table looks correct on desktop and transforms to a card-view on mobile.
