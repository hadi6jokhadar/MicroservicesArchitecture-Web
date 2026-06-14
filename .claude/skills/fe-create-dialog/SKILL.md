---
name: fe-create-dialog
description: Create an Angular dialog component using ZardDialogService — includes TypeScript with signals, reactive forms, HTML template with z-form-field/z-input/z-button, and correct success/error handling (toast not inline alert). Use this whenever the user asks to create a dialog, add a modal, build a popup form, add a create dialog, add an edit dialog, or open a form in an overlay.
---

# Create a Dialog Using ZardDialogService

**Reference feature:** `apps/admin/src/app/features/translation/translations/add-edit-key-dialog/`

## 1. Inject ZardDialogService in Parent

```typescript
import { ZardDialogService } from '@ihsan/ui';

@Component({ ... })
export class MyComponent {
  private readonly _dialogService = inject(ZardDialogService);
}
```

## 2. Dialog Component TypeScript

```typescript
import { Component, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import {
  ZardDialogRef, Z_MODAL_DATA, ZardButtonComponent, ZardInputDirective, ZardFormImports,
  ZardAlertComponent, ZardIdDirective,
} from '@ihsan/ui';
import { TranslatePipe } from '@ihsan/core';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-my-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, ZardButtonComponent, ZardInputDirective, ZardAlertComponent,
    ZardIdDirective, TranslatePipe, ...ZardFormImports],
  templateUrl: './my-dialog.component.html',
  styleUrls: ['./my-dialog.component.scss'],
})
export class MyDialogComponent {
  private readonly _data = inject<{ myData: IMyData }>(Z_MODAL_DATA);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _myService = inject(MyService);

  readonly isEditMode = signal(!!this._data?.myData);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly myForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  onCancel(): void {
    this._dialogRef.close();
  }

  onSubmit(): void {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // ALWAYS pass SKIP_ERROR_TOAST context for HTTP calls inside dialogs
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._myService.create(this.myForm.getRawValue(), context).subscribe({
      next: (result) => {
        toast.success('Action completed successfully');
        this._dialogRef.close({ success: true });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
```

> **Critical:** All HTTP calls inside dialogs MUST include `new HttpContext().set(SKIP_ERROR_TOAST, true)` — the global error interceptor would otherwise show a duplicate toast before the inline `z-alert` renders.

## 3. Dialog Component HTML

> **Success pattern**: `toast.success()` + immediately close. No inline success alerts, no `setTimeout` delays.

```html
<div class="dialog-container">
  <form [formGroup]="myForm" (ngSubmit)="onSubmit()" class="dialog-form">
    <z-form-field zardId="name" #f="zardId">
      <label z-form-label [for]="f.id()">{{ 'feature.dialog.nameLabel' | translate }} *</label>
      <z-form-control>
        <input z-input [id]="f.id()" type="text" formControlName="name" />
      </z-form-control>
      @if (myForm.get('name')?.hasError('required') && myForm.get('name')?.touched) {
        <span z-form-error>{{ 'feature.dialog.validation.nameRequired' | translate }}</span>
      }
    </z-form-field>

    @if (errorMessage()) {
      <z-alert zType="destructive" zIcon="circle-alert" [zDescription]="errorMessage()!" />
    }

    <div class="dialog-actions">
      <button z-button zType="outline" type="button" (click)="onCancel()">
        {{ 'common.cancel' | translate }}
      </button>
      <button z-button type="submit" [zLoading]="isLoading()" [zDisabled]="myForm.invalid">
        {{ isEditMode() ? ('common.save' | translate) : ('common.create' | translate) }}
      </button>
    </div>
  </form>
</div>
```

## 4. Opening the Dialog (Parent)

> When `zHideFooter: true`, use `.afterClosed()` instead of `zOnOk`.

```typescript
onEditItem(item: IItem): void {
  this._dialogService
    .create({
      zTitle: this._translationService.getCachedTranslation('feature.dialog.editTitle'),
      zContent: MyDialogComponent,
      zData: { myData: item },
      zHideFooter: true,
      zClosable: true,
      zWidth: '550px',
    })
    .afterClosed()
    .subscribe((result: { success: boolean }) => {
      if (result?.success) this.loadData();
    });
}
```

## 5. API Options

| Property | Type | Default | Description |
|---|---|---|---|
| `zContent` | `Type<T>` | | Dialog content component |
| `zData` | `U` | | Data passed to the dialog |
| `zTitle` | `string` | | Dialog title |
| `zDescription` | `string` | | Dialog description |
| `zHideFooter` | `boolean` | `false` | Hide default footer buttons |
| `zClosable` | `boolean` | `true` | Enable/disable close button |
| `zWidth` | `string` | | Dialog width (e.g. `'550px'`) |
