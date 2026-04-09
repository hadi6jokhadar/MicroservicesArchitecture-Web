---
agent: 'agent'
description: 'Create a sheet using ZardSheetService with proper styling, RTL support, and configuration.'
---

# Create Sheet Workflow

This workflow guides you through creating and styling sheets using `ZardSheetService`.

**Reference Feature**: `apps/admin/src/app/features/translation/translations/view-values-sheet/`

## 1. Using ZardSheetService

Inject `ZardSheetService` and `RtlService`, then call `create()`.

```typescript
import { Component, inject } from '@angular/core';
import { ZardSheetService, RtlService } from '@ihsan/ui';
import { MySheetComponent } from './my-sheet/my-sheet.component';

@Component({ ... })
export class MyComponent {
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _rtlService = inject(RtlService);

  openSheet(item: IItem): void {
    this._sheetService.create({
      zContent: MySheetComponent,
      zData: { item },
      zSide: this._rtlService.getSheetSide('right'), // Auto-flips to 'left' in Arabic RTL
      zClosable: false,
      zHideFooter: true,
    });
  }
}
```

## 2. Sheet Component HTML (`my-sheet.component.html`)

```html
<div class="my-sheet">
  <div class="sheet-header">
    <div class="header-content">
      <div class="header-text">
        <h2>{{ 'feature.sheet.title' | translate }}</h2>
      </div>
      <button z-button zType="outline" zSize="sm" (click)="onClose()">
        <z-icon zType="x" />
      </button>
    </div>
  </div>

  <div class="sheet-content">
    <!-- Your content here -->
  </div>
</div>
```

## 3. Sheet Component TypeScript (`my-sheet.component.ts`)

```typescript
import { Component, inject, signal } from '@angular/core';
import { ZardSheetRef, Z_MODAL_DATA } from '@ihsan/ui';

@Component({
  selector: 'app-my-sheet',
  standalone: true,
  templateUrl: './my-sheet.component.html',
  styleUrls: ['./my-sheet.component.scss'],
})
export class MySheetComponent {
  private readonly _data = inject<{ item: IItem }>(Z_MODAL_DATA);
  private readonly _sheetRef = inject(ZardSheetRef);

  readonly item = this._data.item;

  onClose(): void {
    this._sheetRef.close();
  }
}
```

## 4. Sheet Component SCSS (`my-sheet.component.scss`)

```scss
:host {
  display: block;
  height: 100%;

  .my-sheet {
    display: flex;
    flex-direction: column;
    height: 100%;

    .sheet-header {
      padding: 1.5rem;
      border-block-end: 1px solid var(--color-border);
      background-color: var(--color-background);

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }

      h2 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-foreground);
      }
    }

    .sheet-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      max-height: calc(100vh - 125px);
    }
  }
}
```

## 5. Configuration Options

| Option          | Type                                     | Default    | Description                                          |
| :-------------- | :--------------------------------------- | :--------- | :--------------------------------------------------- |
| `zContent`      | `Type \| TemplateRef \| string`          |            | Component, template, or HTML to render               |
| `zData`         | `object`                                 |            | Data passed to the content component                 |
| `zTitle`        | `string \| TemplateRef`                  |            | Sheet title                                          |
| `zSide`         | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'`   | Position on screen — use `RtlService.getSheetSide()` |
| `zWidth`        | `string`                                 |            | Custom width (e.g., `'400px'`)                       |
| `zHeight`       | `string`                                 |            | Custom height (e.g., `'80vh'`)                       |
| `zHideFooter`   | `boolean`                                | `false`    | Hide footer action buttons                           |
| `zClosable`     | `boolean`                                | `true`     | Whether the sheet can be closed                      |
| `zMaskClosable` | `boolean`                                | `true`     | Close on backdrop click                              |
| `zOkText`       | `string \| null`                         | `'OK'`     | OK button text (`null` to hide)                      |
| `zCancelText`   | `string \| null`                         | `'Cancel'` | Cancel button text (`null` to hide)                  |

## 6. Sheet Reference (`ZardSheetRef`)

The `create()` method returns a `ZardSheetRef`:

- `componentInstance`: Reference to the content component instance.
- `close(result?: R)`: Close the sheet programmatically.
