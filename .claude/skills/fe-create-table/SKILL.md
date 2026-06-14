---
name: fe-create-table
description: Create an Angular table using ZardTableComponent — correct imports, full HTML structure with loading/empty states, server-side pagination, and standard responsive SCSS with mobile card view. Use this whenever the user asks to create a table, add a data grid, display a list of items, build a tabular view, or show paginated data in Angular.
---

# Create a New Table Using ZardTableComponent

**Reference feature:** `apps/admin/src/app/features/translation/translations/`

## 1. Import ZardTableComponent

```typescript
import {
  ZardTableComponent, ZardTableHeaderComponent, ZardTableBodyComponent,
  ZardTableRowComponent, ZardTableHeadComponent, ZardTableCellComponent,
  ZardTableCaptionComponent,
} from '@ihsan/ui';

@Component({
  imports: [
    ZardTableComponent, ZardTableHeaderComponent, ZardTableBodyComponent,
    ZardTableRowComponent, ZardTableHeadComponent, ZardTableCellComponent,
    ZardTableCaptionComponent,
  ],
})
```

## 2. Full Wrapper Structure (with Loading & Empty States)

```html
<z-card class="table-card">
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
      <div class="table-header">
        <div class="results-info">
          <z-icon zType="list" />
          <span>{{ items().length }} {{ 'common.results' | translate }}</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table z-table class="standard-table">
          <thead z-table-header>
            <tr z-table-row>
              <th z-table-head class="col-name">{{ 'table.name' | translate }}</th>
              <th z-table-head class="col-actions">{{ 'table.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody z-table-body>
            @for (item of items(); track item.id) {
              <tr z-table-row class="standard-row">
                <td z-table-cell class="col-name" [attr.data-label]="'table.name' | translate">
                  {{ item.name }}
                </td>
                <td z-table-cell class="col-actions">
                  <button z-button zType="ghost" zShape="square">
                    <z-icon zType="more-horizontal" />
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="pagination-container">
        <z-pagination [zTotal]="totalPages()" [(zPageIndex)]="currentPage" />
      </div>
    </div>
  }
</z-card>
```

## 3. Table Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `zType` | `'default' \| 'striped' \| 'bordered'` | `'default'` | Visual style |
| `zSize` | `'default' \| 'compact' \| 'comfortable'` | `'default'` | Padding density |

## 4. Standard SCSS

```scss
:host {
  .table-card {
    .loading-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-block: 4rem;
      gap: 1rem;
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
        }
      }

      .table-wrapper { overflow-x: auto; }

      .pagination-container {
        padding-block-start: 1rem;
        border-block-start: 1px solid var(--color-border);
        margin-block-start: 1rem;
        display: flex;
        justify-content: center;
      }
    }
  }

  @media (max-width: 768px) {
    .table-card .table-container .table-wrapper {
      thead { display: none; }

      tbody tr {
        display: grid;
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        margin-block-end: 1rem;
        padding: 0.75rem;
      }

      tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-block: 0.5rem;
        border-block-end: 1px solid var(--color-border);

        &:last-child { border-block-end: none; }

        &::before {
          content: attr(data-label);
          font-weight: 600;
          color: var(--color-foreground);
        }
      }
    }
  }
}
```
