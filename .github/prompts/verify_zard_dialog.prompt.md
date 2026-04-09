---
agent: 'agent'
description: 'Verify if an existing dialog follows the ZardDialog standards.'
---

# Verify ZardDialog Implementation

Use this workflow to audit an existing dialog against the project's dialog standards.

## Verification Checklist

### 1. Invoking the Dialog (Parent Component)

- [ ] **Import & Injection**: `ZardDialogService` imported from `@ihsan/ui` and injected.
- [ ] **Creation**: `.create()` called with proper config (`zContent`, `zData`, `zTitle`).
- [ ] **Result Handling**: If `zHideFooter: true`, code uses `.afterClosed().subscribe(...)` instead of `zOnOk`.

### 2. Dialog Component TypeScript (`.ts`)

- [ ] **Imports & Injections**: `ZardDialogRef` and `Z_MODAL_DATA` imported from `@ihsan/ui` and injected.
- [ ] **State Management**: Angular `signal`s used for `isLoading` and `errorMessage`.
- [ ] **Cancel**: `onCancel()` calls `this._dialogRef.close()`.
- [ ] **Success Handling (CRITICAL)**:
  - [ ] No `successMessage` signal — use `toast.success()` from `ngx-sonner` instead.
  - [ ] No `setTimeout` delays on successful submission.
  - [ ] Dialog immediately closed with `this._dialogRef.close({ success: true, ...data })`.
- [ ] **Error Handling**: Errors caught and message assigned to `errorMessage` signal for inline display.

### 3. Dialog Component HTML (`.html`)

- [ ] **Container**: Content wrapped in `<div class="dialog-container">`.
- [ ] **Form Elements**: Uses Zard UI components:
  - `<z-form-field>`, `<z-form-control>`, `<label z-form-label>`, `z-input`, `z-button`
- [ ] **Error Alert**: Errors shown inline with:
  ```html
  @if (errorMessage()) {
  <z-alert
    zType="destructive"
    zIcon="circle-alert"
    [zDescription]="errorMessage()!"
  />
  }
  ```
- [ ] **No Success Alert**: There are **no** `<z-alert zType="success">` or `zType="default"` tags for success — success uses `toast.success()` only.

## Automated Fix Steps

If you are an agent tasked with fixing a dialog:

1. **Locate dialog files**: Find the `.ts` and `.html` files for the target dialog.
2. **Fix success logic** (`.ts`): Replace any `successMessage` signal and `setTimeout` with `toast.success()` and immediate `this._dialogRef.close(...)`.
3. **Fix HTML**: Remove any conditionally rendered success `z-alert` blocks. Ensure error alerts use `zType="destructive"`.
4. **Fix invocation**: Find where the dialog is opened — ensure `.afterClosed()` is used when `zHideFooter: true`.
