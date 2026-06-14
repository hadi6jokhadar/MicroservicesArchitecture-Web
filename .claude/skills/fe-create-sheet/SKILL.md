---
name: fe-create-sheet
description: Create an Angular sheet (slide-over side panel) using ZardSheetService — RTL-aware positioning, structured header/content layout, standard SCSS with responsive design, and TypeScript injection pattern. Use this whenever the user asks to create a sheet, add a side panel, build a detail view panel, create a slide-over, show details in a drawer, or open content in a side overlay.
---

# Create Sheet Workflow

Reference features:
- `apps/admin/src/app/features/translation/translations/view-values-sheet/`
- `apps/nasheed/admin/src/app/features/songs/view-song-sheet/`

## 1. Open the Sheet (Parent Component)

```typescript
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
      zSide: this._rtlService.getSheetSide('right'), // auto-flips in RTL
      zClosable: false,
      zHideFooter: true,
    });
  }
}
```

## 2. Sheet Component HTML

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

## 3. Sheet Component TypeScript

```typescript
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';
import { ZardSheetRef, Z_SHEET_DATA, ZardButtonComponent, ZardIconComponent } from '@ihsan/ui';

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

## 4. Standard SCSS

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

      .header-text h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-foreground);
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

        .detail-label { font-weight: 500; color: var(--color-muted-foreground); }
        .detail-value { color: var(--color-foreground); font-weight: 500; text-align: end; }
      }

      .detail-group-last { border-block-end: 0; padding-block-end: 0; }
    }
  }

  @media (max-width: 768px) {
    .sheet-container {
      .sheet-header { padding: 1rem; }
      .sheet-content {
        padding: 1rem;
        .detail-group { flex-direction: column; align-items: flex-start; }
        .detail-group .detail-value { text-align: start; }
      }
    }
  }
}
```

## 5. Content Variants

- **details-card**: Key-value inspection (default pattern above)
- **section-card + list**: For list-based sheets
- **details-card + error-group**: For diagnostic text with `<pre>` blocks:

```html
<div class="detail-group detail-group-last error-group">
  <span class="detail-label">{{ 'common.error' | translate }}</span>
  <pre class="error-message">{{ item.errorMessage }}</pre>
</div>
```

## 6. Configuration Options

| Option | Default | Description |
|---|---|---|
| `zSide` | `left` | Position — use `RtlService.getSheetSide('right')` |
| `zHideFooter` | `false` | Hide footer action buttons |
| `zClosable` | `true` | Whether sheet can be closed |
| `zMaskClosable` | `true` | Close on backdrop click |
| `zWidth` | — | Custom width (e.g. `'400px'`) |

## 7. Mandatory Rules

- Use translation keys for all text — never hardcode labels
- Use CSS logical properties (`border-block-end`, `padding-inline-start`)
- `zType="outline"` for the close button to match current design
- Keep sheet components standalone — import only needed Zard components
- Always pass `new HttpContext().set(SKIP_ERROR_TOAST, true)` for HTTP calls inside sheets (same as dialogs)
- Import `SKIP_ERROR_TOAST, extractErrorMessage` from `@ihsan/shared`

## 8. Success Handling in Sheets vs Dialogs

Sheets **stay open** after a successful sub-action (e.g. saving a value within the sheet), so they may use an inline `successMessage` signal with `<z-alert>` rather than closing immediately. This differs from dialogs which always close on success.

```typescript
readonly successMessage = signal<string | null>(null);

// In the success callback:
this.successMessage.set('Value saved successfully');
this._eventsService.notify[Feature]Changed(); // notify parent table to reload
// Do NOT close the sheet — the user may want to perform another action
```

Dialogs always close immediately on success with `toast.success()`. Sheets may show inline success and remain open.
