---
name: fe-create-sheet
description: Create an Angular sheet (slide-over side panel) using ZardSheetService — covers both form sheets (with or without z-tab-group) with pinned actions and scrollable form area, plus read-only detail view sheets. Use this whenever the user asks to create a sheet, add a side panel, build a detail view panel, create a slide-over, show details in a drawer, or open content in a side overlay.
---

# Create Sheet Workflow

Reference implementations:
- **With `z-tab-group`**: `apps/admin/src/app/features/tenant/tenant-configuration-sheet/`
- **Without `z-tab-group`**: `apps/admin/src/app/features/ai-system-prompts/ai-system-prompts/ai-system-prompt-response-format-sheet/`
- **Read-only view**: `apps/admin/src/app/features/translation/translations/view-values-sheet/`

---

## Core Layout Principle (ALWAYS apply for form sheets)

The entire sheet must **never scroll as a whole**. Only the form area scrolls. Actions (Cancel / Save) stay pinned at the bottom.

This requires the flex chain to propagate from `:host` down to the scrollable container:

```
:host (display: flex, height: 100%)
  └── .{feature}-sheet (flex-direction: column, height: 100%)
        └── .sheet-content (flex: 1, min-height: 0)
              └── .edit-form-container (flex: 1, min-height: 0) ← muted bg wrapper
                    ├── .edit-form (flex: 1, min-height: 0, overflow-y: auto) ← ONLY this scrolls
                    └── .form-actions (flex-shrink: 0) ← always visible at bottom
```

> `min-height: 0` is required on every flex ancestor — without it, flex children will not shrink below their content size and the form will overflow instead of scroll.

---

## Standard SCSS Template (both variants share this base)

```scss
:host {
  display: flex;          // NOT display: block — required for height propagation
  flex-direction: column;
  height: 100%;

  .{feature}-sheet {
    display: flex;
    flex-direction: column;
    height: 100%;

    .sheet-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      padding: 1.5rem;

      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
      }

      .edit-form-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        background-color: var(--color-muted);
        border-radius: var(--radius);
        padding: 0.5rem;
        gap: 1rem;

        .edit-form {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow-y: auto;   // THE scrollable zone — everything above/below stays fixed
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
          flex-shrink: 0;                              // never pushed off screen
          padding-block-start: 1rem;
          border-block-start: 1px solid var(--color-border);
        }
      }
    }
  }
}
```

---

## Variant A — Without `z-tab-group`

Form fields go directly inside `.edit-form`. The `overflow-y: auto` on `.edit-form` handles all scrolling.

### HTML

```html
<div class="{feature}-sheet">
  <div class="sheet-content">
    @if (isLoading()) {
      <div class="loading"><z-loader /></div>
    } @else {
      <div class="edit-form-container">
        <div class="edit-form">
          <z-form [formGroup]="form">
            <z-form-field>
              <z-label>{{ 'feature.field.label' | translate }}</z-label>
              <input z-input formControlName="name" />
            </z-form-field>
            <!-- more fields -->
          </z-form>

          @if (errorMessage()) {
            <z-alert zType="destructive">{{ errorMessage() }}</z-alert>
          }
        </div>

        <div class="form-actions">
          <button z-button zType="outline" zSize="default" type="button"
            (click)="onCancel()" [disabled]="isSaving()"
            id="cancel-{feature}-btn">
            {{ 'common.cancel' | translate }}
          </button>
          <button z-button zType="default" zSize="default" type="button"
            (click)="onSubmit()" [disabled]="isSaving()" [zLoading]="isSaving()"
            id="save-{feature}-btn">
            {{ 'common.save' | translate }}
          </button>
        </div>
      </div>
    }
  </div>
</div>
```

### SCSS additions (inside `.edit-form`)

No additional sizing needed — the form grows with content and scrolls naturally.

---

## Variant B — With `z-tab-group`

Tabs go inside `.edit-form`. Actions stay outside in `.form-actions`. Each tab's content area gets a **fixed `40vh` height** to create a consistent, predictable scroll zone.

### HTML

```html
<div class="{feature}-sheet">
  <div class="sheet-content">
    @if (isLoading()) {
      <div class="loading"><z-loader /></div>
    } @else {
      <div class="edit-form-container">
        <div class="edit-form">
          <z-tab-group class="{feature}-tabs">

            <z-tab [label]="'feature.tabs.first' | translate">
              <div class="tab-scroll-area">
                <!-- tab 1 content -->
              </div>
            </z-tab>

            <z-tab [label]="'feature.tabs.second' | translate">
              <div class="tab-scroll-area">
                <!-- tab 2 content -->
              </div>
            </z-tab>

          </z-tab-group>

          @if (errorMessage()) {
            <z-alert zType="destructive">{{ errorMessage() }}</z-alert>
          }
        </div>

        <div class="form-actions">
          <button z-button zType="outline" zSize="default" type="button"
            (click)="onCancel()" [disabled]="isSaving()"
            id="cancel-{feature}-btn">
            {{ 'common.cancel' | translate }}
          </button>
          <button z-button zType="default" zSize="default" type="button"
            (click)="onSubmit()" [disabled]="isSaving()" [zLoading]="isSaving()"
            id="save-{feature}-btn">
            {{ 'common.save' | translate }}
          </button>
        </div>
      </div>
    }
  </div>
</div>
```

### SCSS additions (inside `.edit-form`)

```scss
.{feature}-tabs {
  flex: 1;
  min-height: 0;

  .tab-scroll-area {
    height: 40vh;       // standard tab content height — use 40vh on ALL sheets
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-inline-end: 0.25rem;
  }
}
```

> **Always use `40vh` for tab content areas.** This keeps all sheets visually consistent.
> Do not use `max-height: calc(100vh - Npx)` magic numbers — they break when the sheet header changes.

---

## Variant C — Read-only View Sheet (no form, no actions)

For sheets that only display data (no editable form or save button).

### HTML

```html
<div class="{feature}-sheet">
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
        <span class="detail-value">{{ item().name }}</span>
      </div>
      <div class="detail-group detail-group-last">
        <span class="detail-label">{{ 'common.createdAt' | translate }}</span>
        <span class="detail-value">{{ item().createdAt | date: 'medium' }}</span>
      </div>
    </div>
  </div>
</div>
```

### SCSS (view sheet)

```scss
:host {
  display: block;
  height: 100%;

  .{feature}-sheet {
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
    .{feature}-sheet {
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

---

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

## 2. Sheet Component TypeScript

```typescript
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, HttpContext } from '@angular/forms';
import { TranslatePipe } from '@ihsan/core';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import { ZardSheetRef, Z_SHEET_DATA, ZardButtonComponent, ZardIconComponent, ZardLoaderComponent, ZardAlertComponent } from '@ihsan/ui';
import { HttpClient } from '@angular/common/http';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-my-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ReactiveFormsModule, ZardButtonComponent, ZardIconComponent, ZardLoaderComponent, ZardAlertComponent],
  templateUrl: './my-sheet.component.html',
  styleUrl: './my-sheet.component.scss',
})
export class MySheetComponent {
  private readonly _data = inject<{ item: IItem }>(Z_SHEET_DATA);
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _http = inject(HttpClient);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = new FormGroup({
    name: new FormControl(this._data.item.name, [Validators.required]),
  });

  onCancel(): void {
    this._sheetRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.errorMessage.set(null);

    this._http.put(`/api/v1/feature/${this._data.item.id}`, this.form.value, {
      context: new HttpContext().set(SKIP_ERROR_TOAST, true),
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        toast.success('Feature saved');
        this._sheetRef.close();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }
}
```

---

## Sizing Cheat Sheet

| Context | Value | Why |
|---|---|---|
| `:host` height (form sheets) | `height: 100%` | Sheet panel controls total height |
| `:host` display (form sheets) | `display: flex` | Required to propagate flex height chain |
| `:host` display (view sheets) | `display: block` | View sheets use max-height scroll instead |
| Tab content area | `height: 40vh` | Standard — use on every sheet with tabs |
| Form container scroll | `overflow-y: auto` on `.edit-form` | Only form scrolls, not the whole sheet |
| Actions row | `flex-shrink: 0` | Keeps buttons pinned at bottom |
| Inner layer | `min-height: 0` on every flex ancestor | Prevents overflow, allows shrink |

---

## Configuration Options

| Option | Default | Description |
|---|---|---|
| `zSide` | `left` | Position — use `RtlService.getSheetSide('right')` |
| `zHideFooter` | `false` | Hide footer action buttons |
| `zClosable` | `true` | Whether sheet can be closed |
| `zMaskClosable` | `true` | Close on backdrop click |
| `zWidth` | — | Custom width (e.g. `'500px'`) |

---

## Mandatory Rules

- `:host` must be `display: flex` on form sheets (Variant A/B), `display: block` on view sheets (Variant C)
- Always use `min-height: 0` on every flex ancestor of the scrollable zone
- Tab content areas always use `height: 40vh` — never `max-height: calc(100vh - Npx)`
- All text must use translation keys — never hardcode labels
- Use CSS logical properties (`border-block-end`, `padding-inline-start`)
- Always pass `new HttpContext().set(SKIP_ERROR_TOAST, true)` for HTTP calls inside sheets
- Import `SKIP_ERROR_TOAST, extractErrorMessage` from `@ihsan/shared`
- Close button uses `zType="outline"` and `zSize="sm"`
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on every sheet component
