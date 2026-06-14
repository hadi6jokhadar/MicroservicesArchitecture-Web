---
name: fe-verify-dialog
description: Audit an existing Angular dialog component against ZardDialog project standards — checks injection pattern, signal-based state, success handling (toast not inline alert), error display, and HTML structure. Use this whenever the user asks to verify, check, audit, review, or fix a dialog component, modal, or popup form in Angular.
---

# Verify ZardDialog Implementation

Use this workflow to audit an existing dialog against the project's dialog standards.

## Verification Checklist

### 1. Invoking the Dialog (Parent Component)

- [ ] **Import & Injection**: `ZardDialogService` imported from `@ihsan/ui` and injected.
- [ ] **Creation**: `.create()` called with proper config (`zContent`, `zData`, `zTitle`).
- [ ] **Result Handling**: When `zHideFooter: true`, code uses `.afterClosed().subscribe(...)` instead of `zOnOk`.

### 2. Dialog Component TypeScript (`.ts`)

- [ ] **Imports & Injections**: `ZardDialogRef` and `Z_MODAL_DATA` imported from `@ihsan/ui` and injected.
- [ ] **State Management**: Angular `signal`s used for `isLoading` and `errorMessage`.
- [ ] **Cancel**: `onCancel()` calls `this._dialogRef.close()`.
- [ ] **HTTP Context (CRITICAL)**: All HTTP calls inside the dialog pass `new HttpContext().set(SKIP_ERROR_TOAST, true)` — prevents the global error interceptor from firing a duplicate toast before the inline `z-alert` renders.
  ```typescript
  import { HttpContext } from '@angular/common/http';
  import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
  const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
  this._service.create(data, context).subscribe({ ... });
  ```
- [ ] **Success Handling (CRITICAL)**:
  - [ ] No `successMessage` signal — `toast.success()` from `ngx-sonner` used instead.
  - [ ] No `setTimeout` delays after successful submission.
  - [ ] Dialog immediately closed with `this._dialogRef.close({ success: true, ...data })`.
- [ ] **Error Handling**: Errors caught via `extractErrorMessage(error)` from `@ihsan/shared` and assigned to `errorMessage` signal for inline display.

### 3. Dialog Component HTML (`.html`)

- [ ] **Container**: Content wrapped in `<div class="dialog-container">`.
- [ ] **Form Elements**: Uses Zardui components: `<z-form-field>`, `<z-form-control>`, `<label z-form-label>`, `z-input`, `z-button`.
- [ ] **Error Alert**: Errors shown inline:
  ```html
  @if (errorMessage()) {
    <z-alert zType="destructive" zIcon="circle-alert" [zDescription]="errorMessage()!" />
  }
  ```
- [ ] **No Success Alert**: No `<z-alert zType="success">` or `zType="default"` for success — success uses `toast.success()` only.

## Fix Steps (If Violations Found)

1. **Locate dialog files**: Find the `.ts` and `.html` files for the target dialog.
2. **Fix success logic** (`.ts`): Replace any `successMessage` signal and `setTimeout` with `toast.success()` and immediate `this._dialogRef.close(...)`.
3. **Fix HTML**: Remove any conditionally rendered success `z-alert` blocks. Ensure error alerts use `zType="destructive"`.
4. **Fix invocation**: Find where the dialog is opened — ensure `.afterClosed()` is used when `zHideFooter: true`.
