---
description: Create a sheet using ZardSheetService with proper styling and configuration
---

# Create Sheet Workflow

This workflow guides you through creating and styling sheets using `ZardSheetService` in the MicroservicesArchitecture-Web application.

## 1. Using ZardSheetService

To create a sheet, inject `ZardSheetService` and call its `create` method.

### Basic Usage

```typescript
import { Component, inject } from "@angular/core";
import { ZardSheetService } from "@ihsan/ui";
import { MySheetComponent } from "./my-sheet/my-sheet.component";

@Component({
  // ...
})
export class MyComponent {
  private readonly _sheetService = inject(ZardSheetService);

  openSheet() {
    this._sheetService.create({
      zContent: MySheetComponent,
      zData: { id: 123 }, // Pass data to the sheet component
      zTitle: "My Sheet Title",
      // ... configuration options
    });
  }
}
```

## 2. Styling (Based on `view-values-sheet`)

The styling should follow the patterns established in `apps/admin/src/app/features/translation/translations/view-values-sheet`.

### HTML Structure (`view-values-sheet.component.html`)

The sheet content should generally follow this structure:

```html
<div class="view-values-sheet">
  <!-- Header -->
  <div class="sheet-header">
    <div class="header-content">
      <div class="header-text">
        <h2>{{ 'title.key' | translate }}</h2>
        <!-- Optional extra info -->
      </div>
      <button z-button zType="outline" zSize="sm" (click)="onClose()">
        <z-icon zType="x" />
      </button>
    </div>
  </div>

  <!-- Content -->
  <div class="sheet-content">
    <!-- Your content here -->
  </div>

  <!-- Optional Footer (if not using service footer) -->
  <!-- <div class="sheet-footer"> ... </div> -->
</div>
```

### SCSS Pattern (`view-values-sheet.component.scss`)

Use CSS variables for consistency and SCSS nesting for structure.

```scss
:host {
  display: block;
  height: 100%;

  .view-values-sheet {
    display: flex;
    flex-direction: column;
    height: 100%;

    // Sheet Header
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

      // ... typography styles
    }

    // Sheet Content
    .sheet-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      max-height: calc(100vh - 125px); // Adjust based on header height
    }
  }
}
```

## 3. Implementation Example (from `translations.component.ts`)

Here is how the sheet is created in `apps/admin/src/app/features/translation/translations/translations.component.ts`:

```typescript
// ... imports
import { ZardSheetService, RtlService } from '@ihsan/ui';
import { ViewValuesSheetComponent } from './view-values-sheet/view-values-sheet.component';

// ... component
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _rtlService = inject(RtlService);

  onViewValues(translationKey: ITranslationKeyDto): void {
    this._sheetService.create({
      zContent: ViewValuesSheetComponent,
      zData: { translationKey }, // Passing data to component
      zSide: this._rtlService.getSheetSide('right'), // Dynamic side based on RTL
      zClosable: false, // Prevent backdrop click closing (optional)
      zHideFooter: true, // We implement our own footer/actions inside the component
    });
  }
```

## 4. API Capabilities (from `api.md`)

When configuring the sheet, you can use the following options from `ZardSheetOptions`:

### Configuration Options

| Option           | Type                                     | Default    | Description                                        |
| :--------------- | :--------------------------------------- | :--------- | :------------------------------------------------- |
| `zTitle`         | `string \| TemplateRef`                  | -          | Sheet title text or template.                      |
| `zDescription`   | `string`                                 | -          | Sheet description/body text.                       |
| `zContent`       | `string \| TemplateRef \| Type`          | -          | Custom content component, template, or HTML.       |
| `zSide`          | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'`   | Position of the sheet on screen.                   |
| `zWidth`         | `string`                                 | -          | Custom width (e.g., '400px', '50%').               |
| `zHeight`        | `string`                                 | -          | Custom height (e.g., '80vh', '500px').             |
| `zOkText`        | `string \| null`                         | `'OK'`     | OK button text, `null` to hide button.             |
| `zCancelText`    | `string \| null`                         | `'Cancel'` | Cancel button text, `null` to hide button.         |
| `zOkDestructive` | `boolean`                                | `false`    | Whether OK button should have destructive styling. |
| `zHideFooter`    | `boolean`                                | `false`    | Whether to hide the footer with action buttons.    |
| `zMaskClosable`  | `boolean`                                | `true`     | Whether clicking outside closes the sheet.         |
| `zClosable`      | `boolean`                                | `true`     | Whether sheet can be closed.                       |
| `zData`          | `object`                                 | -          | Data to pass to custom content components.         |

### Sheet Reference (`ZardSheetRef`)

The `create()` method returns a `ZardSheetRef` object.

- `componentInstance`: Reference to the content component instance.
- `close(result?: R)`: Method to close the sheet programmatically.

### Events (via Component Outputs)

If using the default footer buttons (i.e., `zHideFooter` is false), the `ZardSheetComponent` emits:

- `okTriggered`: When OK button is clicked.
- `cancelTriggered`: When Cancel button is clicked.

These are typically handled via callbacks `zOnOk` and `zOnCancel` in the options.
