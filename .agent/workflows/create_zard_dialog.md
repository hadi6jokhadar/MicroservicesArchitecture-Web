---
description: Create a dialog using ZardDialogService
---

This workflow guides you through creating a dialog using the `ZardDialogService`, based on the implementation in the `translations` feature.

## 1. How to use ZardDialogService

To use the `ZardDialogService`, follow these steps:

1.  **Inject the Service**: Inject `ZardDialogService` into your component where you want to trigger the dialog.
2.  **Create a Dialog Component**: Create a separate standalone component that will serve as the content of the dialog. This component will handle the dialog's internal logic and UI.
3.  **Open the Dialog**: Call the `create()` method of the `ZardDialogService`, passing the necessary configuration options and your dialog component.

Example of injection:

```typescript
import { ZardDialogService } from '@ihsan/ui';

@Component({ ... })
export class MyComponent {
  private readonly _dialogService = inject(ZardDialogService);
  // ...
}
```

## 2. Component Styling & Implementation

The dialog component's styling and structure should follow the pattern established in:
`MicroservicesArchitecture-Web/apps/admin/src/app/features/translation/translations/add-edit-key-dialog`

### HTML Structure (`add-edit-key-dialog.component.html`)

Wrap your content in a `.dialog-container`. Use `z-form-field`, `z-input`, and `z-button` components for consistent styling.

```html
<div class="dialog-container">
  <form [formGroup]="myForm" (ngSubmit)="onSubmit()" class="dialog-form">
    <!-- Form Field Example -->
    <z-form-field zardId="myField" #f="zardId">
      <label z-form-label [for]="f.id()">Label *</label>
      <z-form-control>
        <input z-input [id]="f.id()" type="text" formControlName="myField" />
      </z-form-control>
      <!-- Error Handling -->
      @if (myForm.get('myField')?.hasError('required')) {
      <span z-form-error>Field is required</span>
      }
    </z-form-field>

    <!-- Error Alert -->
    @if (errorMessage()) {
    <z-alert
      zType="destructive"
      zIcon="circle-alert"
      [zDescription]="errorMessage()!"
    />
    }

    <!-- Dialog Actions (Footer) -->
    <div class="dialog-actions">
      <button z-button zType="outline" type="button" (click)="onCancel()">
        Cancel
      </button>
      <button
        z-button
        zType="default"
        type="submit"
        [zLoading]="isLoading()"
        [zDisabled]="myForm.invalid"
      >
        Submit
      </button>
    </div>
  </form>
</div>
```

### TypeScript Logic (`add-edit-key-dialog.component.ts`)

- Inject `ZardDialogRef` to control the dialog (e.g., close it).
- Inject `Z_MODAL_DATA` to receive data passed from the parent component.
- Use `signal`s and `ReactiveFormsModule` for form handling.

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
  // Inject data passed to the dialog
  private readonly _data = inject<{ myData: any }>(Z_MODAL_DATA);

  // Inject reference to the dialog itself
  private readonly _dialogRef = inject(ZardDialogRef);

  readonly isEditMode = signal(!!this._data?.myData);
  readonly isLoading = signal(false);

  // Form setup
  readonly myForm = new FormGroup({
    // ...
  });

  onCancel(): void {
    this._dialogRef.close();
  }

  onSubmit(): void {
    if (this.myForm.invalid) return;

    this.isLoading.set(true);
    // Perform async operation...
    // On success:
    this._dialogRef.close(result);
  }
}
```

## 3. Creating the Dialog

Here is how the dialog is created and opened, using the `.afterClosed()` observable to handle the result, as implemented in `users.component.ts`.

> **Important**: When `zHideFooter` is `true`, the `zOnOk` callback will **not** be triggered because the default OK button is hidden. Use `.afterClosed()` instead.

```typescript
onEditUser(user: IUser): void {
  this._dialogService
    .create({
      // Title and Description (can use translation service)
      zTitle: this._translationService.getCachedTranslation('users.dialog.editTitle'),
      zDescription: this._translationService.getCachedTranslation('users.dialog.editDescription'),

      // The component to render inside the dialog
      zContent: EditUserDialogComponent,

      // Data to pass to the dialog component (available via Z_MODAL_DATA)
      zData: { user, roles: this.roles() },

      // UI Options
      zHideFooter: true,  // Hide default footer to use custom actions in the component
      zClosable: false,   // Disable close button if you want to force action through component
      zWidth: '550px',    // Set specific width
    })
    .afterClosed()
    .subscribe((result: { success: boolean; user: IUser }) => {
      // Handle the result passed to this._dialogRef.close(result)
      if (result?.success && result.user) {
        this.users.update((users) =>
          users.map((u) => (u.id === result.user.id ? result.user : u))
        );
      }
    });
}
```

## 4. API Options

The following options are available when creating a dialog, as documented in:
`MicroservicesArchitecture-Web/libs/ui/src/lib/zard/components/dialog/doc/api.md`

| Property            | Description                                         | Type                                    | Default  |
| :------------------ | :-------------------------------------------------- | :-------------------------------------- | :------- |
| `zAutofocus`        | Sets the autofocus button.                          | `'ok' \| 'cancel' \| 'auto' \| null`    | `'auto'` |
| `zCancelIcon`       | Sets the cancel icon.                               | `string`                                |          |
| `zCancelText`       | Sets the cancel text.                               | `string`                                |          |
| `zClosable`         | Enables closing the dialog.                         | `boolean`                               | `true`   |
| `zContent`          | Sets the dialog content.                            | `string \| TemplateRef<T> \| Type<T>`   |          |
| `zData`             | Sets the data for the dialog.                       | `U`                                     |          |
| `zDescription`      | Sets the dialog description.                        | `string`                                |          |
| `zHideFooter`       | Hides the footer.                                   | `boolean`                               | `false`  |
| `zMaskClosable`     | Enables closing the dialog by clicking on the mask. | `boolean`                               | `true`   |
| `zOkDestructive`    | Marks the OK button as destructive.                 | `boolean`                               | `false`  |
| `zOkDisabled`       | Disables the OK button.                             | `boolean`                               | `false`  |
| `zOkIcon`           | Sets the OK button icon.                            | `string`                                |          |
| `zOkText`           | Sets the OK button text.                            | `string \| null`                        |          |
| `zOnCancel`         | Callback for cancel action.                         | `EventEmitter<T> \| OnClickCallback<T>` | `noopFn` |
| `zOnOk`             | Callback for OK action.                             | `EventEmitter<T> \| OnClickCallback<T>` | `noopFn` |
| `zTitle`            | Sets the dialog title.                              | `string \| TemplateRef<T>`              |          |
| `zViewContainerRef` | View container ref for dynamic component loading.   | `ViewContainerRef`                      |          |
| `zWidth`            | Sets the dialog width.                              | `string`                                |          |
| ------------------- | --------------------------------------------------- | --------------------------------------- | -------- |

> **Note**: `zOnOk` and `zOnCancel` are specifically for the **default footer buttons**. If you set `zHideFooter: true`, you should use the `.afterClosed()` observable on the object returned by `create()` to handle events and data from your custom dialog components.
