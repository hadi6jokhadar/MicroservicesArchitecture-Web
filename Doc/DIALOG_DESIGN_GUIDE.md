# Dialog Component Design Guide

## Overview

This guide explains how to create consistent dialogs using Zardui's Dialog component. All dialogs in the application should follow the same design patterns and structure demonstrated in the test components page.

## RTL (Right-to-Left) Support

**Dialogs automatically support RTL - no configuration needed!**

### How It Works

1. **Global Direction** - When language switches to Arabic, `document.documentElement.dir = 'rtl'` is set in app.ts
2. **CSS Inheritance** - Global CSS rule applies RTL to all dialogs:
   ```css
   [dir='rtl'] [data-slot='dialog'] {
     direction: rtl;
   }
   ```
3. **Automatic Adaptation** - Dialog content (text, buttons, icons) automatically flip to RTL

### Creating RTL-Ready Dialogs

✅ **DO:**

- Use logical CSS properties in dialog content (margin-inline-start, padding-inline-end)
- Use translation keys for all text
- Let the system handle direction automatically

❌ **DON'T:**

- Set `dir` attribute manually on dialogs
- Use physical CSS properties (margin-left, padding-right)
- Try to detect RTL in dialog components

```typescript
// ✅ CORRECT - Dialog automatically inherits RTL
this._dialogService.create({
  zTitle: 'dialog.title' | translate,
  zDescription: 'dialog.description' | translate,
  zContent: MyDialogComponent,
  // No RTL configuration needed!
});
```

## Dialog Service Setup

Dialogs are created using the `ZardDialogService` which provides a programmatic API for creating modal dialogs.

### Import Required Dependencies

```typescript
import { Component, inject, signal } from '@angular/core';
import { ZardDialogService, Z_MODAL_DATA } from '@ihsan/ui';
import { TranslatePipe } from '@ihsan/core';
```

## Creating a Dialog

### Method 1: Service-Based Dialog (Recommended)

This is the standard approach for most dialogs.

```typescript
export class MyComponent {
  private _dialogService = inject(ZardDialogService);

  openDialog(): void {
    this._dialogService.create({
      zTitle: 'dialog.title' | translate, // Translation key for title
      zDescription: 'dialog.description' | translate, // Translation key for description
      zContent: MyDialogComponent, // Component to render in dialog
      zData: { userId: '123' }, // Data passed to dialog component
      zOkText: 'common.save' | translate, // OK button text
      zCancelText: 'common.cancel' | translate, // Cancel button text
      zOnOk: (instance) => {
        console.log('Dialog OK clicked:', instance);
      },
      zOnCancel: () => {
        console.log('Dialog cancelled');
      },
      zWidth: '425px', // Dialog width (optional)
    });
  }
}
```

### Dialog Component Template

The dialog content component receives data via `Z_MODAL_DATA` injection token:

```typescript
// my-dialog.component.ts
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Z_MODAL_DATA, ZardFormImports, ZardButtonComponent } from '@ihsan/ui';
import { TranslatePipe } from '@ihsan/core';

interface IDialogData {
  userId: string;
  name?: string;
}

interface IFormData {
  name: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  selector: 'app-my-dialog',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardButtonComponent,
  ],
  template: `
    <form [formGroup]="form" class="space-y-4">
      <div z-form-field>
        <label z-label for="name">{{ 'dialog.name' | translate }}</label>
        <input
          z-input
          id="name"
          formControlName="name"
          [placeholder]="'dialog.namePlaceholder' | translate"
        />
        @if (form.controls.name.touched &&
        form.controls.name.hasError('required')) {
        <p z-form-message>{{ 'dialog.validation.nameRequired' | translate }}</p>
        }
      </div>

      <div z-form-field>
        <label z-label for="email">{{ 'dialog.email' | translate }}</label>
        <input
          z-input
          id="email"
          type="email"
          formControlName="email"
          [placeholder]="'dialog.emailPlaceholder' | translate"
        />
        @if (form.controls.email.touched &&
        form.controls.email.hasError('required')) {
        <p z-form-message>
          {{ 'dialog.validation.emailRequired' | translate }}
        </p>
        } @if (form.controls.email.touched &&
        form.controls.email.hasError('email')) {
        <p z-form-message>{{ 'dialog.validation.emailInvalid' | translate }}</p>
        }
      </div>
    </form>
  `,
})
export class MyDialogComponent {
  protected readonly data = inject<IDialogData>(Z_MODAL_DATA);

  protected readonly form = new FormGroup<IFormData>({
    name: new FormControl<string>(this.data.name || '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
}
```

## Reference Implementation

### Live Example Location

**File:** `apps/admin/src/app/pages/test-components/test-components.component.ts`

**Method:** `openDialog()` (around line 1020)

```typescript
protected openDialog(): void {
  this._dialogService.create({
    zTitle: 'Edit Profile',
    zDescription: `Make changes to your profile here. Click save when you're done.`,
    zContent: TestComponent,
    zData: {
      name: 'Samuel Rizzon',
      username: '@samuelrizzondev',
      region: 'america',
    } as iDialogData,
    zOkText: 'Save changes',
    zOnOk: (instance) => {
      console.log('Form submitted:', instance);
    },
    zWidth: '425px',
  });
}
```

### Dialog Content Component

**File:** `apps/admin/src/app/pages/test-components/test/test.ts`

This file contains the `TestComponent` which demonstrates:

- Form handling with reactive forms
- Data injection via `Z_MODAL_DATA`
- Proper styling and layout
- Zardui form components integration

## Dialog Design Patterns

### 1. Form Dialog (Most Common)

Used for create/edit operations with form inputs.

**Structure:**

```
Dialog
├── Title (translated)
├── Description (translated)
└── Content
    ├── Form Fields (with translation keys)
    ├── Validation Messages (translated)
    └── Actions (OK/Cancel buttons)
```

**Example Use Cases:**

- Add/Edit User
- Create Translation Key
- Update Settings
- Change Password

### 2. Confirmation Dialog

Used for destructive actions or important confirmations.

```typescript
confirmDelete(): void {
  this._dialogService.create({
    zTitle: 'dialog.confirmDelete.title' | translate,
    zDescription: 'dialog.confirmDelete.description' | translate,
    zOkText: 'common.delete' | translate,
    zCancelText: 'common.cancel' | translate,
    zOnOk: () => {
      this.deleteItem();
    },
    zWidth: '400px',
  });
}
```

### 3. Information Dialog

Used to display read-only information or details.

```typescript
showDetails(item: IItem): void {
  this._dialogService.create({
    zTitle: 'dialog.details.title' | translate,
    zContent: ItemDetailsComponent,
    zData: { item },
    zOkText: 'common.close' | translate,
    zShowCancel: false,  // Hide cancel button
    zWidth: '600px',
  });
}
```

## Dialog Translation Keys

### Standard Key Structure

All dialogs should follow this translation key pattern:

```json
{
  "{feature}.dialog.{action}Title": "Title text",
  "{feature}.dialog.{action}Description": "Description text",
  "{feature}.dialog.{field}Label": "Field label",
  "{feature}.dialog.{field}Placeholder": "Placeholder text",
  "{feature}.dialog.validation.{field}{Error}": "Error message"
}
```

### Example: User Edit Dialog

**en.json:**

```json
{
  "users.dialog.editTitle": "Edit User",
  "users.dialog.editDescription": "Update user information below",
  "users.dialog.nameLabel": "Full Name",
  "users.dialog.namePlaceholder": "Enter full name",
  "users.dialog.emailLabel": "Email Address",
  "users.dialog.emailPlaceholder": "user@example.com",
  "users.dialog.validation.nameRequired": "Name is required",
  "users.dialog.validation.emailRequired": "Email is required",
  "users.dialog.validation.emailInvalid": "Please enter a valid email"
}
```

**ar.json:**

```json
{
  "users.dialog.editTitle": "تعديل المستخدم",
  "users.dialog.editDescription": "قم بتحديث معلومات المستخدم أدناه",
  "users.dialog.nameLabel": "الاسم الكامل",
  "users.dialog.namePlaceholder": "أدخل الاسم الكامل",
  "users.dialog.emailLabel": "عنوان البريد الإلكتروني",
  "users.dialog.emailPlaceholder": "user@example.com",
  "users.dialog.validation.nameRequired": "الاسم مطلوب",
  "users.dialog.validation.emailRequired": "البريد الإلكتروني مطلوب",
  "users.dialog.validation.emailInvalid": "يرجى إدخال بريد إلكتروني صحيح"
}
```

## Styling Guidelines

### Dialog Width

Standard widths for different dialog types:

- **Small** (350px): Simple confirmations
- **Medium** (425px-500px): Single-column forms
- **Large** (600px-800px): Multi-column forms or detailed content
- **Extra Large** (900px+): Complex layouts, tables

### Form Layout

Use Zardui form components for consistent styling:

```html
<div z-form-field>
  <label z-label for="field-id">{{ 'label.key' | translate }}</label>
  <input z-input id="field-id" />
  @if (hasError) {
  <p z-form-message>{{ 'error.key' | translate }}</p>
  }
  <p z-form-description>{{ 'description.key' | translate }}</p>
</div>
```

### Spacing

Use Tailwind spacing utilities:

```html
<form [formGroup]="form" class="space-y-4">
  <!-- Form fields with consistent 1rem spacing -->
</form>
```

## Error Handling in Dialogs

### ⚠️ CRITICAL: NO Toast Notifications in Dialogs

**NEVER** use toast notifications (`toast.success()`, `toast.error()`) inside dialogs or sheets.

### Use Inline Alerts Instead

```typescript
export class MyDialogComponent {
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  onSubmit(): void {
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._service.save(this.form.value, context).subscribe({
      next: () => {
        this.successMessage.set('dialog.success.saved' | translate);
      },
      error: (error) => {
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }
}
```

**Template:**

```html
@if (errorMessage()) {
<z-alert
  zType="destructive"
  zIcon="circle-alert"
  [zDescription]="errorMessage()"
/>
} @if (successMessage()) {
<z-alert
  zType="success"
  zIcon="circle-check"
  [zDescription]="successMessage()"
/>
}
```

## Best Practices

### ✅ DO

- **Always use translation keys** for all text (title, description, labels, buttons)
- Use `ZardDialogService.create()` for programmatic dialogs
- Pass data via `zData` and inject with `Z_MODAL_DATA`
- Use reactive forms with proper validation
- Follow Zardui form component patterns
- Use inline alerts for errors (not toasts)
- Set appropriate dialog width for content
- Provide both OK and Cancel handlers
- Use unique IDs for all form inputs

### ❌ DON'T

- Never hardcode text in dialogs
- Don't use toast notifications inside dialogs
- Don't create custom dialog components (use Zardui)
- Don't use template-driven forms
- Don't forget RTL support (use logical CSS properties)
- Don't make dialogs too wide (max 900px)
- Don't nest dialogs (avoid opening dialogs from dialogs)

## Common Dialog Scenarios

### 1. Create/Add Dialog

```typescript
addUser(): void {
  this._dialogService.create({
    zTitle: 'users.dialog.addTitle' | translate,
    zDescription: 'users.dialog.addDescription' | translate,
    zContent: AddUserDialogComponent,
    zData: {},
    zOkText: 'common.create' | translate,
    zCancelText: 'common.cancel' | translate,
    zOnOk: (instance) => {
      // Handle creation
      this.createUser(instance.form.value);
    },
    zWidth: '500px',
  });
}
```

### 2. Edit Dialog

```typescript
editUser(user: IUser): void {
  this._dialogService.create({
    zTitle: 'users.dialog.editTitle' | translate,
    zDescription: 'users.dialog.editDescription' | translate,
    zContent: EditUserDialogComponent,
    zData: { user },
    zOkText: 'common.save' | translate,
    zCancelText: 'common.cancel' | translate,
    zOnOk: (instance) => {
      // Handle update
      this.updateUser(instance.form.value);
    },
    zWidth: '500px',
  });
}
```

### 3. Delete Confirmation

```typescript
confirmDelete(userId: string): void {
  this._dialogService.create({
    zTitle: 'users.dialog.deleteTitle' | translate,
    zDescription: 'users.dialog.deleteWarning' | translate,
    zOkText: 'common.delete' | translate,
    zCancelText: 'common.cancel' | translate,
    zOnOk: () => {
      this.deleteUser(userId);
    },
    zWidth: '400px',
  });
}
```

## Testing Dialogs

### Manual Testing Checklist

- [ ] Dialog opens and closes correctly
- [ ] All text is translated (no hardcoded strings)
- [ ] Form validation works properly
- [ ] OK button disabled when form invalid
- [ ] Cancel button closes dialog without saving
- [ ] Error messages display correctly (inline alerts)
- [ ] Dialog width appropriate for content
- [ ] RTL layout works correctly in Arabic
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus management (dialog receives focus on open)

### Browser Testing

Test in both languages:

- English (LTR)
- Arabic (RTL)

## Related Components

### Sheet Component

For slide-out panels (alternative to dialogs):

```typescript
import { RtlService } from '@ihsan/core';

export class MyComponent {
  private _sheetService = inject(ZardSheetService);
  private _rtlService = inject(RtlService);

  openSheet(): void {
    this._sheetService.create({
      zTitle: 'sheet.title' | translate,
      zContent: MySheetComponent,
      zData: { id: '123' },
      // Auto-flips position for RTL: 'right' → 'left' in Arabic
      zSide: this._rtlService.getSheetSide('right'),
      zSize: 'default', // 'sm', 'default', 'lg', 'xl', 'full'
      zHideFooter: true,
    });
  }
}
```

**Sheet RTL Support:**

- ✅ **Automatic direction** - Inherits `dir` from document (no configuration needed)
- ✅ **Smart positioning** - Use `RtlService.getSheetSide()` to auto-flip sides
  - LTR: `getSheetSide('right')` → `'right'`
  - RTL: `getSheetSide('right')` → `'left'` (automatically flipped!)
- ✅ **CSS-based flipping** - Global styles.css handles position transitions
- ✅ **Zero component logic** - Sheet components don't need RTL awareness

**When to use Sheet vs Dialog:**

- **Dialog**: Focused tasks, forms requiring attention, confirmations
- **Sheet**: Sidebars, filters, detailed views, multi-step processes

## Reference Files

### Essential Files to Review

1. **Dialog Service Usage:**

   - `apps/admin/src/app/pages/test-components/test-components.component.ts` (line 1020)
   - Method: `openDialog()`

2. **Dialog Content Component:**

   - `apps/admin/src/app/pages/test-components/test/test.ts`
   - Complete example with forms and data injection

3. **Dialog UI Demo:**

   - `apps/admin/src/app/pages/test-components/test-components.component.html` (line 1175)
   - Live demonstration

4. **Zardui Dialog Documentation:**
   - `Doc/COMPONENT_USAGE_GUIDE.md` (Dialog section)
   - Complete API reference

## Quick Reference

### Dialog Service API

| Property       | Type      | Required | Description                            |
| -------------- | --------- | -------- | -------------------------------------- |
| `zTitle`       | string    | Yes      | Dialog title (translation key)         |
| `zDescription` | string    | No       | Dialog description (translation key)   |
| `zContent`     | Component | No       | Content component to render            |
| `zData`        | any       | No       | Data passed to content component       |
| `zOkText`      | string    | No       | OK button text (default: "OK")         |
| `zCancelText`  | string    | No       | Cancel button text (default: "Cancel") |
| `zOnOk`        | function  | No       | Callback when OK clicked               |
| `zOnCancel`    | function  | No       | Callback when Cancel clicked           |
| `zWidth`       | string    | No       | Dialog width (e.g., "425px")           |
| `zShowCancel`  | boolean   | No       | Show cancel button (default: true)     |

---

**Version:** 1.0  
**Last Updated:** February 3, 2026  
**Maintained by:** Development Team
