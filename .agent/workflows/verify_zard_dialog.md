---
description: Verify if an existing dialog follows the ZardDialog standards based on create_zard_dialog
---

This workflow guides you through verifying an existing dialog implementation to ensure it adheres to the standards defined in the `create_zard_dialog` workflow.

## Verification Checklist

When verifying a dialog, check both the component file (`.ts`) containing the dialog logic and its corresponding template (`.html`). Also verify the component that calls/opens the dialog.

### 1. Invoking the Dialog

Open the file that calls the dialog (where `ZardDialogService` is used) and verify the following:

- [ ] **Import & Injection**: Is `ZardDialogService` imported from `@ihsan/ui` and properly injected?
- [ ] **Creation**: Is `.create()` called with the proper configuration object (e.g., `zContent`, `zData`, `zTitle`)?
- [ ] **Handle Result**: If `zHideFooter: true` is set, the code MUST use `.afterClosed().subscribe(...)` instead of `zOnOk` to handle the closing logic and returned data.

### 2. Dialog Component TypeScript Logic (`.ts`)

Open the dialog's standalone component class and verify the following:

- [ ] **Imports & Injections**:
  - Are `ZardDialogRef` and `Z_MODAL_DATA` imported from `@ihsan/ui` and properly injected?
  - Are required UI components imported if necessary (e.g., `ZardButtonComponent`, `ZardInputDirective`, `ZardFormImports`)?
- [ ] **State Management**: Are Angular `signal`s used for local state (e.g., `isLoading`, `errorMessage`)?
- [ ] **Closing the Dialog (`onCancel`)**: Does the cancellation method call `this._dialogRef.close()`?
- [ ] **Success Handling (CRITICAL)**:
  - There should be **NO** `successMessage` signal.
  - There should be **NO** `setTimeout` delays upon successful submission.
  - A global toast notification should be used for success messages (e.g., `toast.success('...')` from `ngx-sonner`).
  - Upon success, the dialog should be immediately closed using `this._dialogRef.close({ success: true, ...data })`.
- [ ] **Error Handling**: Are errors caught and their messages extracted and saved to a signal (e.g., `errorMessage`) to be displayed inline?

### 3. Dialog Component HTML Structure (`.html`)

Open the dialog's template file and verify the following styling and structure:

- [ ] **Container**: Is the entire content wrapped inside a `<div class="dialog-container">`?
- [ ] **Form Elements**: Are the expected Zard UI directives/components used?
  - `<z-form-field>`
  - `<z-form-control>`
  - `<label z-form-label>`
  - `z-input`, `z-button`
- [ ] **Error Alerts**: Are error messages shown inline?
  ```html
  @if (errorMessage()) {
  <z-alert
    zType="destructive"
    zIcon="circle-alert"
    [zDescription]="errorMessage()!"
  />
  }
  ```
- [ ] **Success Alerts (Anti-pattern Check)**: Ensure there are **NO `<z-alert zType="success">`** tags for success responses.

## Automated Verification Steps

If you are an agent tasked with verifying a dialog, you can follow these steps:

1. **Locate the dialog component files**: Find the `.ts` and `.html` files for the target dialog.
2. **Review Dialog Component (.ts)**: Look at the `onSubmit` (or equivalent) success logic. Replace any `successMessage` logic and `setTimeout` delays with immediate `this._dialogRef.close(...)` and global `toast.success()` from `ngx-sonner`.
3. **Review Dialog HTML (.html)**: Remove any conditionally rendered success alerts (e.g., `@if(successMessage()) { ... }`). Ensure error messages format matches `<z-alert zType="destructive">`.
4. **Locate Invocation**: Find where the dialog is opened. Ensure `.afterClosed()` is used if it hides the footer.
