---
description: Create a new table using ZardTableComponent with standard styling and functionality.
---

This workflow guides you through creating a new table using `ZardTableComponent`, applying default styling based on the Translations feature design, and wrapping it correctly for consistency.

## 1. Import ZardTableComponent

Ensure you import the necessary `ZardTable` components in your module or standalone component.

```typescript
import {
  ZardTableComponent,
  ZardTableHeaderComponent,
  ZardTableBodyComponent,
  ZardTableRowComponent,
  ZardTableHeadComponent,
  ZardTableCellComponent,
  ZardTableCaptionComponent,
} from '@microservices-architecture/ui'; // Adjust import path as needed

// ...
imports: [
  // ...
  ZardTableComponent,
  ZardTableHeaderComponent,
  ZardTableBodyComponent,
  ZardTableRowComponent,
  ZardTableHeadComponent,
  ZardTableCellComponent,
  ZardTableCaptionComponent,
];
```

## 2. Basic Usage & Structure

Use the `z-table` directives on standard HTML table elements.

```html
<table z-table>
  <caption z-table-caption>
    List of Items
  </caption>
  <thead z-table-header>
    <tr z-table-row>
      <th z-table-head>Name</th>
      <th z-table-head>Status</th>
      <th z-table-head class="text-right">Amount</th>
    </tr>
  </thead>
  <tbody z-table-body>
    @for (item of items; track item.id) {
    <tr z-table-row>
      <td z-table-cell>{{ item.name }}</td>
      <td z-table-cell>{{ item.status }}</td>
      <td z-table-cell class="text-right">{{ item.amount }}</td>
    </tr>
    }
  </tbody>
</table>
```

## 3. Customize & Change Styles

The `z-table` component supports customization via input properties and standard CSS classes.

### Inputs

| Input   | Type                                      | Default     | Description                                              |
| :------ | :---------------------------------------- | :---------- | :------------------------------------------------------- |
| `zType` | `'default' \| 'striped' \| 'bordered'`    | `'default'` | Controls the visual style of the table rows and borders. |
| `zSize` | `'default' \| 'compact' \| 'comfortable'` | `'default'` | Controls the padding and density of the table.           |

### Example Customization

```html
<table z-table zType="striped" zSize="compact" class="my-custom-table">
  <!-- ... content ... -->
</table>
```

## 4. Default Styling (Based on Translations Feature)

To match the default styling found in the Translations feature (`apps/admin/src/app/features/translation/translations/translations.component.scss`), use the following SCSS structure. This ensures responsive design and consistent aesthetics.

### HTML Structure (Table Container Wrapper)

Wrap your table in a `table-container` div, typically within a `z-card`. This wrapper handles responsive scrolling and layout.

```html
<z-card class="table-card">
  <!-- Loading & Empty States (Optional but recommended) -->
  @if (isLoading()) {
  <div class="loading-container">
    <z-loader zSize="lg" />
    <p>{{ 'common.loading' | translate }}</p>
  </div>
  } @else if (items().length === 0) {
  <div class="empty-container">
    <z-empty zIcon="search" [zTitle]="'common.noResults' | translate" />
  </div>
  } @else {
  <div class="table-container">
    <!-- Table Header (Counts, Actions) -->
    <div class="table-header">
      <div class="results-info">
        <z-icon zType="list" />
        <span>{{ items().length }} items</span>
      </div>
    </div>

    <!-- Table Wrapper for Scroll -->
    <div class="table-wrapper">
      <table z-table class="standard-table">
        <thead z-table-header>
          <tr z-table-row>
            <th z-table-head class="col-name">
              {{ 'table.name' | translate }}
            </th>
            <th z-table-head class="col-actions">
              {{ 'table.actions' | translate }}
            </th>
          </tr>
        </thead>
        <tbody z-table-body>
          @for (item of items(); track item.id) {
          <tr z-table-row class="standard-row">
            <!-- Note: Use [attr.data-label] for translated mobile headers -->
            <td
              z-table-cell
              class="col-name"
              [attr.data-label]="'table.name' | translate"
            >
              {{ item.name }}
            </td>
            <td z-table-cell class="col-actions">
              <button z-button zType="ghost" zSize="icon">
                <z-icon zType="more-horizontal" />
              </button>
            </td>
          </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <z-pagination [zTotal]="totalPages()" [(zPageIndex)]="currentPage" />
    </div>
  </div>
  }
</z-card>
```

### SCSS Styling

Add the following SCSS to your component's stylesheet to replicate the Translations table design, including responsive mobile behavior.

```scss
// Table Card Layout
.table-card {
  .loading-container,
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-block: 4rem;
    gap: 1rem;

    p {
      margin: 0;
      color: var(--color-muted-foreground);
    }
  }

  .table-container {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-block-end: 1rem;
      border-block-end: 1px solid var(--color-border);
      margin-block-end: 1rem;

      .results-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-muted-foreground);
        font-size: 0.875rem;

        z-icon {
          color: var(--color-primary);
        }
      }
    }

    .table-wrapper {
      overflow-x: auto;
      border-radius: var(--radius);
      border: 1px solid var(--color-border);

      .standard-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;

        thead {
          background-color: var(--color-muted);
          border-block-end: 1px solid var(--color-border);

          th {
            white-space: nowrap;
            font-weight: 600;
            color: var(--color-foreground);
            padding-block: 0.75rem;
            padding-inline: 1rem;
            text-align: left;

            // Define column widths here if needed
            &.col-actions {
              width: 8%;
              text-align: center;
            }
          }
        }

        tbody {
          .standard-row {
            border-block-end: 1px solid var(--color-border);
            transition: background-color 0.2s ease;

            &:hover {
              background-color: var(--color-muted);
            }

            &:last-child {
              border-block-end: none;
            }

            td {
              vertical-align: middle;
              padding-block: 1rem;
              padding-inline: 1rem;
            }
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      padding-block-start: 1.5rem;
      margin-block-start: 1.5rem;
      border-block-start: 1px solid var(--color-border);
    }
  }
}

// Responsive Design (Mobile Stack)
@media (max-width: 768px) {
  .table-card .table-container {
    .table-wrapper {
      border: none;
      overflow: visible;

      .standard-table {
        thead {
          display: none; // Hide headers on mobile
        }

        tbody {
          .standard-row {
            display: grid;
            grid-template-columns: 1fr; // Stack cells
            gap: 0.75rem;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius);
            background: var(--color-card);

            td {
              padding: 0 !important;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: none;

              // Use data-label attribute for mobile headers
              &::before {
                content: attr(data-label);
                font-weight: 600;
                color: var(--color-muted-foreground);
                font-size: 0.875rem;
              }

              &.col-actions {
                justify-content: flex-end;
                padding-top: 0.5rem !important;
                border-top: 1px solid var(--color-border);
                margin-top: 0.5rem;

                &::before {
                  content: none;
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## 5. Adding an Archived Filter (Toggle Switch)

When implementing an "Archived" filter for the table, always use the `ZardSwitchComponent` instead of a select dropdown.

### HTML

Wrap the `z-switch` in a `.switch-field` specifically styled container.

```html
<div class="filter-field switch-field">
  <z-switch formControlName="isArchived">
    {{ 'translations.archived' | translate }}
  </z-switch>
</div>
```

### SCSS Styling

Ensure you have the `.switch-field` CSS nested in your `.filter-field` definition within the page component styling so it fits nicely in the filter row layout:

```scss
.filter-field {
  width: 100%;

  &.switch-field {
    width: fit-content;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding-bottom: 0.5rem;
  }
}
```

### Component Logic (.ts)

Import the `ZardSwitchComponent` and ensure the `formControl` is typed and initialized as a `boolean`. Note: ensure the backend payload processes the boolean accordingly.

```typescript
// Import the switch component
import { ZardSwitchComponent } from '@microservices-architecture/ui';

// Forms
readonly filterForm = new FormGroup({
  // ... other filters
  isArchived: new FormControl<boolean>(false, { nonNullable: true }),
});
```
