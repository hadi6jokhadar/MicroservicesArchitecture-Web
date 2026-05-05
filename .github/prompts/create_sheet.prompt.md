---
agent: 'agent'
description: 'Create a modern Zard sheet matching the latest shared pattern with RTL support, structured header, card based content, and responsive styling.'
---

# Create Sheet Workflow

This workflow guides you through creating and styling sheets using ZardSheetService.

Reference features:

- apps/admin/src/app/features/translation/translations/view-values-sheet/
- apps/nasheed/admin/src/app/features/songs/view-song-sheet/
- apps/nasheed/admin/src/app/features/ingestion/view-job-sheet/

## 1. Using ZardSheetService

Inject ZardSheetService and RtlService, then call create().

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
      zSide: this._rtlService.getSheetSide('right'), // auto flips in RTL
      zClosable: false,
      zHideFooter: true,
    });
  }
}
```

## 2. Sheet Component HTML (`my-sheet.component.html`)

```html
<div class="sheet-container">
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
    <div class="details-card">
      <div class="detail-group">
        <span class="detail-label">{{ 'common.name' | translate }}</span>
        <span class="detail-value">{{ item.name }}</span>
      </div>

      <div class="detail-group detail-group-last">
        <span class="detail-label">{{ 'common.created' | translate }}</span>
        <span class="detail-value">{{ item.createdAt | date: 'medium' }}</span>
      </div>
    </div>
  </div>
</div>
```

## 3. Sheet Component TypeScript (`my-sheet.component.ts`)

```typescript
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';
import {
  ZardSheetRef,
  Z_SHEET_DATA,
  ZardButtonComponent,
  ZardIconComponent,
} from '@ihsan/ui';

@Component({
  selector: 'app-my-sheet',
  standalone: true,
  imports: [TranslatePipe, ZardButtonComponent, ZardIconComponent],
  templateUrl: './my-sheet.component.html',
  styleUrls: ['./my-sheet.component.scss'],
})
export class MySheetComponent {
  private readonly _data = inject<{ item: IItem }>(Z_SHEET_DATA);
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

  .sheet-container {
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

      .header-text {
        flex: 1;

        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-foreground);
        }
      }
    }

    .sheet-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      max-height: calc(100vh - 125px);

      .details-card {
        background-color: var(--color-muted);
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        padding: 1rem;
      }

      .detail-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.875rem 0;
        border-block-end: 1px solid var(--color-border);

        .detail-label {
          font-weight: 500;
          color: var(--color-muted-foreground);
        }

        .detail-value {
          color: var(--color-foreground);
          font-weight: 500;
          text-align: end;
        }
      }

      .detail-group-last {
        border-block-end: 0;
        padding-block-end: 0;
      }
    }
  }

  @media (max-width: 768px) {
    .sheet-container {
      .sheet-header {
        padding: 1rem;

        .header-text {
          h2 {
            font-size: 1.125rem;
          }
        }
      }

      .sheet-content {
        padding: 1rem;

        .detail-group {
          flex-direction: column;
          align-items: flex-start;

          .detail-value {
            text-align: start;
          }
        }
      }
    }
  }
}
```

## 5. Standard Content Variants

Use one of these blocks inside sheet-content:

- details-card pattern
  Use for key value inspection sheets.
- section-card plus list pattern
  Use for list based sheets such as similar items.
- details-card plus error-group
  Use when showing long diagnostic text with pre blocks.

Example error group:

```html
<div class="detail-group detail-group-last error-group">
  <span class="detail-label">{{ 'common.error' | translate }}</span>
  <pre class="error-message">{{ item.errorMessage }}</pre>
</div>
```

## 5. Configuration Options

| Option        | Type                           | Default | Description                                       |
| :------------ | :----------------------------- | :------ | :------------------------------------------------ |
| zContent      | Type or TemplateRef or string  |         | Component, template, or HTML to render            |
| zData         | object                         |         | Data passed to the content component              |
| zTitle        | string or TemplateRef          |         | Sheet title                                       |
| zSide         | left or right or top or bottom | left    | Position on screen, use RtlService.getSheetSide() |
| zWidth        | string                         |         | Custom width, for example 400px                   |
| zHeight       | string                         |         | Custom height, for example 80vh                   |
| zHideFooter   | boolean                        | false   | Hide footer action buttons                        |
| zClosable     | boolean                        | true    | Whether the sheet can be closed                   |
| zMaskClosable | boolean                        | true    | Close on backdrop click                           |
| zOkText       | string or null                 | OK      | OK button text, null hides it                     |
| zCancelText   | string or null                 | Cancel  | Cancel button text, null hides it                 |

## 6. Sheet Reference (`ZardSheetRef`)

The create() method returns a ZardSheetRef:

- componentInstance: reference to the content component instance.
- close(result?: R): close the sheet programmatically.

## 7. Mandatory Rules

- Use translation keys for all text, never hardcode labels.
- Use logical CSS properties such as border-block-end and padding-inline-start.
- Prefer zType outline for the sheet close button to match current design.
- Keep sheet components standalone and import only needed Zard components.
- For view sheets, prefer a card based details layout with detail-group rows.
