---
agent: 'agent'
description: 'Create a dialog using ZardDialogService with proper styling, form handling, and error/success patterns.'
---

# Create a Dialog Using ZardDialogService

This workflow guides you through creating a dialog using `ZardDialogService`, based on the implementation in the `translations` feature.

**Reference Feature**: `apps/admin/src/app/features/translation/translations/add-edit-key-dialog/`

## 1. How to Use ZardDialogService

1. **Inject the Service**: Inject `ZardDialogService` into your component where you want to trigger the dialog.
2. **Create a Dialog Component**: Create a separate standalone component for the dialog content.
3. **Open the Dialog**: Call the `create()` method with configuration options.

```typescript
import { ZardDialogService } from '@ihsan/ui';

@Component({ ... })
export class MyComponent {
  private readonly _dialogService = inject(ZardDialogService);
}
```

## 2. Dialog Component TypeScript (`my-dialog.component.ts`)

- Inject `ZardDialogRef` to control the dialog (close it).
- Inject `Z_MODAL_DATA` to receive data passed from the parent.
- Use `signal`s for `isLoading` and `errorMessage`.
- Use `ReactiveFormsModule` for form handling.

```typescript
import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import {
  ZardDialogRef,
  Z_MODAL_DATA,
  ZardButtonComponent,
  ZardInputDirective,
  ZardFormImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-my-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ...ZardFormImports,
  ],
  templateUrl: './my-dialog.component.html',
  styleUrls: ['./my-dialog.component.scss'],
})
export class MyDialogComponent {
  private readonly _data = inject<{ myData: any }>(Z_MODAL_DATA);
  private readonly _dialogRef = inject(ZardDialogRef);

  readonly isEditMode = signal(!!this._data?.myData);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly myForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  onCancel(): void {
    this._dialogRef.close();
  }

  onSubmit(): void {
    if (this.myForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    // Perform async operation...
    // On success:
    toast.success('Action completed successfully');
    this._dialogRef.close({ success: true });
  }
}
```

## 3. Dialog Component HTML (`my-dialog.component.html`)

Wrap content in `.dialog-container`. Use Zard form components for consistent styling.

> **Success pattern**: Do NOT use inline success alerts or `setTimeout` delays. Use `toast.success()` and immediately close the dialog.

```html
<div class="dialog-container">
  <form [formGroup]="myForm" (ngSubmit)="onSubmit()" class="dialog-form">
    <z-form-field zardId="name" #f="zardId">
      <label z-form-label [for]="f.id()"
        >{{ 'feature.dialog.nameLabel' | translate }} *</label
      >
      <z-form-control>
        <input z-input [id]="f.id()" type="text" formControlName="name" />
      </z-form-control>
      @if (myForm.get('name')?.hasError('required') &&
      myForm.get('name')?.touched) {
      <span z-form-error
        >{{ 'feature.dialog.validation.nameRequired' | translate }}</span
      >
      }
    </z-form-field>

    @if (errorMessage()) {
    <z-alert
      zType="destructive"
      zIcon="circle-alert"
      [zDescription]="errorMessage()!"
    />
    }

    <div class="dialog-actions">
      <button z-button zType="outline" type="button" (click)="onCancel()">
        {{ 'common.cancel' | translate }}
      </button>
      <button
        z-button
        zType="default"
        type="submit"
        [zLoading]="isLoading()"
        [zDisabled]="myForm.invalid"
      >
        {{ isEditMode() ? ('common.save' | translate) : ('common.create' |
        translate) }}
      </button>
    </div>
  </form>
</div>
```

## 4. Opening the Dialog (Parent Component)

> **Important**: When `zHideFooter: true` is set, use `.afterClosed()` instead of `zOnOk` to handle dialog results.

```typescript
onEditItem(item: IItem): void {
  this._dialogService
    .create({
      zTitle: this._translationService.getCachedTranslation('feature.dialog.editTitle'),
      zDescription: this._translationService.getCachedTranslation('feature.dialog.editDescription'),
      zContent: MyDialogComponent,
      zData: { myData: item },
      zHideFooter: true,
      zClosable: true,
      zWidth: '550px',
    })
    .afterClosed()
    .subscribe((result: { success: boolean }) => {
      if (result?.success) {
        this.loadData();
      }
    });
}
```

## 5. API Options

| Property       | Type                                  | Default | Description                   |
| :------------- | :------------------------------------ | :------ | :---------------------------- |
| `zContent`     | `string \| TemplateRef<T> \| Type<T>` |         | Dialog content component      |
| `zData`        | `U`                                   |         | Data passed to the dialog     |
| `zTitle`       | `string`                              |         | Dialog title                  |
| `zDescription` | `string`                              |         | Dialog description            |
| `zHideFooter`  | `boolean`                             | `false` | Hide default footer buttons   |
| `zClosable`    | `boolean`                             | `true`  | Enable/disable close button   |
| `zWidth`       | `string`                              |         | Dialog width (e.g. `'550px'`) |
| `zCancelText`  | `string`                              |         | Cancel button text            |
| `zOkText`      | `string`                              |         | OK button text                |
