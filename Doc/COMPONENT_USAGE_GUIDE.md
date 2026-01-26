# Zardui Component Usage Guide

**Last Updated:** January 20, 2026  
**Zardui Package:** `@zardui/angular` | **Local Wrapper:** `@ihsan/ui`

## � Quick Start: AI-Optimized Reference

**NEW**: For AI-assisted development, use the comprehensive single-file reference:

### 📄 [ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md)

**Complete AI-optimized guide with:**

- ✅ All 43 components with complete examples
- ✅ Import patterns and best practices
- ✅ Form integration patterns
- ✅ Service-based components (Dialog, Sheet, Alert Dialog)
- ✅ Variant system reference
- ✅ Component composition patterns
- ✅ Quick decision tree for component selection
- ✅ Common patterns & recipes
- ✅ TypeScript types and interfaces
- ✅ 100% accuracy for AI code generation

**Use this file to:**

- Generate code with AI assistants
- Learn component APIs quickly
- Find the right component for your needs
- Get copy-paste ready examples
- Understand best practices

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Available Components](#available-components)
4. [Live Demos & Documentation](#live-demos--documentation)
5. [Best Practices](#best-practices)

---

## Overview

This project uses **Zardui** as its primary UI component library. **ALL UI components MUST use Zardui** - creating custom UI components that duplicate Zardui functionality is **FORBIDDEN**.

### Why Zardui?

- ✅ **Comprehensive**: 43 production-ready components
- ✅ **Consistent**: Unified design system
- ✅ **Accessible**: WCAG 2.1 compliant
- ✅ **Modern**: Built for Angular signals and standalone components
- ✅ **Customizable**: Variant-based styling system

---

## Live Demos & Documentation

### Interactive Component Demos

All components have live, interactive demos:

- **Test Page:** `apps/admin/src/app/pages/test-components/`
- **Run:** `nx run admin:serve --configuration=development`
- **URL:** http://localhost:4200/test-components

### Complete Documentation Suite

**Comprehensive documentation available:**

| File                                                                                 | Purpose                                | Best For                                       |
| ------------------------------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------- |
| **[ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md)**                               | **AI-optimized single-file reference** | **AI code generation, quick lookup, learning** |
| [README.md](../apps/admin/src/app/pages/test-components/README.md)                   | Detailed usage guide (43 components)   | Manual development, detailed examples          |
| [API_REFERENCE.md](../apps/admin/src/app/pages/test-components/API_REFERENCE.md)     | Complete API & method reference        | Technical reference, method signatures         |
| [COMPONENT_INDEX.md](../apps/admin/src/app/pages/test-components/COMPONENT_INDEX.md) | Quick navigation index                 | Finding components, URL navigation             |

**Features:**

- ✨ Alphabetically sorted components
- ✨ AI-friendly structure for better code assistance
- ✨ Copy-paste ready examples
- ✨ Complete TypeScript type definitions
- ✨ Quick navigation with HTML anchors
- ✨ Category-based browsing

---

## Installation

### Adding New Components

```bash
# From workspace root
install-zardui-components.bat
```

This installs all components to `libs/ui/src/lib/zard/components/`.

### Importing Components

```typescript
// ✅ CORRECT - Import from local wrapper
import {
  ZardButtonComponent,
  ZardInputDirective,
  ZardDialogService,
} from '@ihsan/ui';

// ❌ WRONG - Don't import directly from package
import { ZardButtonComponent } from '@zardui/angular';
```

---

## Available Components

### Complete Component List (43 Components)

| Category         | Components                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**       | Accordion, Card, Divider, Resizable, Sheet, Tabs                                                                                               |
| **Navigation**   | Breadcrumb, Menu, Pagination, Segmented                                                                                                        |
| **Forms**        | Button, Button Group, Calendar, Checkbox, Combobox, Date Picker, Form, Input, Input Group, Radio, Select, Slider, Switch, Toggle, Toggle Group |
| **Data Display** | Avatar, Badge, Empty, Icon, Kbd, Progress Bar, Skeleton, Table                                                                                 |
| **Feedback**     | Alert, Alert Dialog, Dialog, Loader, Popover, Toast, Tooltip                                                                                   |
| **Advanced**     | Carousel, Command, Dropdown                                                                                                                    |

**For detailed component documentation, examples, and API reference:**  
👉 **[ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md)** - Complete AI-optimized guide

---

## Quick Examples

### Basic Button

```typescript
import { Component } from '@angular/core';
import { ZardButtonComponent } from '@ihsan/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ZardButtonComponent],
  template: `
    <button z-button zType="primary" zSize="md" (click)="handleClick()">
      Click Me
    </button>
  `,
})
export class ExampleComponent {
  handleClick() {
    console.log('Button clicked!');
  }
}
```

### Form with Input (Updated Pattern)

```typescript
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ZardInputDirective,
  ZardButtonComponent,
  ZardFormImports,
} from '@ihsan/ui';

interface ILoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardInputDirective,
    ZardButtonComponent,
    ZardFormImports,
  ],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <z-form-field>
        <label z-form-label for="email">Email</label>
        <input z-input zId="email" formControlName="email" type="email" />
        @if (emailControl?.hasError('required') && emailControl?.touched) {
        <span z-form-error>Email is required</span>
        } @if (emailControl?.hasError('email') && emailControl?.touched) {
        <span z-form-error>Please enter a valid email address</span>
        }
      </z-form-field>

      <z-form-field>
        <label z-form-label for="password">Password</label>
        <input
          z-input
          zId="password"
          formControlName="password"
          type="password"
        />
        @if (passwordControl?.hasError('required') && passwordControl?.touched)
        {
        <span z-form-error>Password is required</span>
        }
      </z-form-field>

      <button
        z-button
        zType="default"
        type="submit"
        [zLoading]="isLoading()"
        [zDisabled]="isLoading()"
      >
        Login
      </button>
    </form>
  `,
})
export class LoginComponent {
  readonly isLoading = signal(false);

  readonly loginForm = new FormGroup<ILoginForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    this.isLoading.set(true);
    const formValue = this.loginForm.getRawValue();
    console.log('Login:', formValue);
    // Call auth service here
  }
}
```

### Dialog

```typescript
import { Component, inject } from '@angular/core';
import { ZardDialogService, ZardButtonComponent } from '@ihsan/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ZardButtonComponent],
  template: `<button z-button (click)="openDialog()">Open Dialog</button>`,
})
export class ExampleComponent {
  private _dialogService = inject(ZardDialogService);

  openDialog() {
    this._dialogService.open(MyDialogComponent, {
      data: { userId: 123 },
      zSize: 'md',
      zTitle: 'User Details',
    });
  }
}
```

### Toast Notifications

```typescript
import { Component } from '@angular/core';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-example',
  standalone: true,
  template: `<button (click)="showToast()">Show Toast</button>`,
})
export class ExampleComponent {
  showToast() {
    toast.success('Operation completed successfully!');
    toast.error('Something went wrong!');
    toast.info('New update available');
    toast.warning('This action cannot be undone');
  }
}
```

---

## Best Practices

### ✅ DO

- **Always use Zardui components** for UI elements
- **Import from `@ihsan/ui`** (not `@zardui/angular`)
- **Use signals** for reactive state (`input()`, `output()`)
- **Use `inject()`** for dependency injection
- **Provide unique IDs** for all form elements
- **Use typed forms** with `FormGroup<T>`
- **Follow variant naming** (`zType`, `zSize`, `zShape`)
- **Compose components** instead of creating custom ones

### ❌ DON'T

- Create custom UI components that Zardui provides
- Import directly from `@zardui/angular`
- Use `@Input()` or `@Output()` decorators
- Use `any` type
- Hardcode styles when variants exist
- Create wrapper components unnecessarily

### Component Selection Guide

**Need a button?** → `ZardButtonComponent`

**Need input?** → `ZardInputDirective`

**Need dropdown?**

- Searchable → `ZardComboboxComponent`
- Simple → `ZardSelectComponent`
- Actions → `ZardDropdownImports`

**Need modal?**

- Full modal → `ZardDialogService`
- Side panel → `ZardSheetService`
- Confirmation → `ZardAlertDialogService`

**Need notification?**

- Toast → `toast` from ngx-sonner
- Persistent → `ZardAlertComponent`

**For complete component reference with all examples:**  
👉 **[ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md)**

---

## Additional Resources

- **AI Reference:** [ZARDUI_AI_REFERENCE.md](./ZARDUI_AI_REFERENCE.md) - Complete AI-optimized guide
- **Live Demos:** http://localhost:4200/test-components
- **Component Index:** [COMPONENT_INDEX.md](../apps/admin/src/app/pages/test-components/COMPONENT_INDEX.md)
- **API Reference:** [API_REFERENCE.md](../apps/admin/src/app/pages/test-components/API_REFERENCE.md)
- **Lucide Icons:** https://lucide.dev/icons/
- **Zardui Docs:** https://zardui.com

---

**Last Updated:** January 20, 2026  
**Version:** 2.0 - Streamlined with AI Reference

```typescript
import { Component } from '@angular/core';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-example',
  standalone: true,
  template: `<button (click)="showToast()">Show Toast</button>`,
})
export class ExampleComponent {
  showToast() {
    // Success toast
    toast.success('Operation completed successfully!');

    // Error toast
    toast.error('Something went wrong!');

    // Info toast
    toast.info('New update available');

    // Warning toast
    toast.warning('This action cannot be undone');

    // Default toast with description
    toast('Event has been created', {
      description: 'Sunday, December 03, 2023 at 9:00 AM',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo'),
      },
    });
  }
}
```

**Important:** There is NO `ZardToastService`. Use the `toast` function from `ngx-sonner` directly.

---

## Component Catalog

### 🔘 Accordion

**Purpose:** Collapsible content sections

**Variants:**

- Basic (single item open)
- Multiple (multiple items open)
- Non-collapsible (at least one always open)

**Usage:**

```html
<z-accordion>
  <z-accordion-item value="item-1">
    <z-accordion-trigger>Section 1</z-accordion-trigger>
    <z-accordion-content>Content for section 1</z-accordion-content>
  </z-accordion-item>
</z-accordion>
```

**Demo:** `ZardDemoAccordionBasicComponent`

---

### 🚨 Alert

**Purpose:** Display important messages

**Variants:** `info`, `success`, `warning`, `error`

**Usage:**

```html
<z-alert zType="success">
  <z-alert-title>Success!</z-alert-title>
  <z-alert-description>Your changes have been saved.</z-alert-description>
</z-alert>
```

**Demo:** `ZardDemoAlertBasicComponent`

---

### ⚠️ Alert Dialog

**Purpose:** Modal confirmation dialogs

**Usage:**

```typescript
import { ZardAlertDialogService } from '@ihsan/ui';

private _alertDialog = inject(ZardAlertDialogService);

confirmDelete() {
  this._alertDialog.open({
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  }).closed.subscribe(confirmed => {
    if (confirmed) {
      // Delete logic
    }
  });
}
```

**Demo:** `ZardDemoAlertDialogDefaultComponent`

---

### 👤 Avatar

**Purpose:** User profile images

**Variants:**

- Sizes: `xs`, `sm`, `md`, `lg`, `xl`
- Shapes: `circle`, `square`
- Status indicators

**Usage:**

```html
<z-avatar
  [src]="user.avatarUrl"
  [alt]="user.name"
  zSize="md"
  zStatus="online"
/>

<z-avatar-group [max]="3">
  <z-avatar *ngFor="let user of users" [src]="user.avatarUrl" />
</z-avatar-group>
```

**Demo:** `ZardDemoAvatarBasicComponent`, `ZardDemoAvatarStatusComponent`

---

### 🏷️ Badge

**Purpose:** Status indicators, counts, labels

**Variants:** `default`, `primary`, `success`, `warning`, `error`, `outline`

**Usage:**

```html
<z-badge zType="success">Active</z-badge>
<z-badge zType="error" [count]="unreadCount" />
```

**Demo:** `ZardDemoBadgeDefaultComponent`

---

### 🍞 Breadcrumb

**Purpose:** Navigation hierarchy

**Usage:**

```html
<z-breadcrumb>
  <z-breadcrumb-item>
    <a routerLink="/home">Home</a>
  </z-breadcrumb-item>
  <z-breadcrumb-item>
    <a routerLink="/users">Users</a>
  </z-breadcrumb-item>
  <z-breadcrumb-item>Profile</z-breadcrumb-item>
</z-breadcrumb>
```

**Demo:** `ZardDemoBreadcrumbDefaultComponent`, `ZardDemoBreadcrumbSeparatorComponent`

---

### 🔘 Button

**Purpose:** Primary user actions

**Variants:**

- **Types:** `primary`, `secondary`, `outline`, `ghost`, `link`, `destructive`
- **Sizes:** `xs`, `sm`, `md`, `lg`, `xl`
- **Shapes:** `default`, `circle`, `square`

**Usage:**

```html
<button z-button zType="primary" zSize="md" (click)="save()">
  Save Changes
</button>

<button z-button zType="outline" [zLoading]="isLoading" [disabled]="isLoading">
  <z-icon name="save" />
  Save
</button>
```

**Demo:** `ZardDemoButtonDefaultComponent`, `ZardDemoButtonLoadingComponent`

---

### 🔘 Button Group

**Purpose:** Related button collections

**Usage:**

```html
<z-button-group>
  <button z-button>Left</button>
  <button z-button>Middle</button>
  <button z-button>Right</button>
</z-button-group>
```

**Demo:** `ZardDemoButtonGroupDefaultComponent`, `ZardDemoButtonGroupOrientationComponent`

---

### 📅 Calendar

**Purpose:** Date selection

**Modes:** Single, Range, Multiple

**Usage:**

```html
<z-calendar
  [(ngModel)]="selectedDate"
  [minDate]="minDate"
  [maxDate]="maxDate"
/>
```

**Demo:** `ZardDemoCalendarDefaultComponent`, `ZardDemoCalendarRangeComponent`

---

### 🃏 Card

**Purpose:** Content container

**Usage:**

```html
<z-card>
  <z-card-header>
    <z-card-title>Card Title</z-card-title>
    <z-card-description>Card description</z-card-description>
  </z-card-header>
  <z-card-content> Main content here </z-card-content>
  <z-card-footer>
    <button z-button>Action</button>
  </z-card-footer>
</z-card>
```

**Demo:** `ZardDemoCardDefaultComponent`

---

### 🎠 Carousel

**Purpose:** Image/content slider

**Features:** Auto-play, navigation arrows, dot controls, plugins

**Usage:**

```html
<z-carousel>
  <z-carousel-content>
    <z-carousel-item *ngFor="let item of items">
      <img [src]="item.image" />
    </z-carousel-item>
  </z-carousel-content>
</z-carousel>
```

**Demo:** `ZardDemoCarouselDefaultComponent`, `ZardDemoCarouselPluginsComponent`

---

### ☑️ Checkbox

**Purpose:** Boolean selection

**Variants:** Default, Destructive, Disabled, Sizes, Shapes

**Usage:**

```html
<z-checkbox formControlName="acceptTerms" zSize="md">
  I accept the terms
</z-checkbox>
```

**Demo:** `ZardDemoCheckboxDefaultComponent`, `ZardDemoCheckboxSizeComponent`

---

### 🔍 Combobox

**Purpose:** Searchable select dropdown

**Features:** Autocomplete, grouping, custom rendering

**Usage:**

```html
<z-combobox
  [options]="countries"
  formControlName="country"
  placeholder="Select country..."
  searchable
/>
```

**Demo:** `ZardDemoComboboxDefaultComponent`, `ZardDemoComboboxGroupedComponent`

---

### ⌨️ Command

**Purpose:** Command palette (like VS Code Ctrl+Shift+P)

**Usage:**

```html
<z-command>
  <z-command-input placeholder="Type a command..." />
  <z-command-list>
    <z-command-item (select)="doAction1()">Action 1</z-command-item>
    <z-command-item (select)="doAction2()">Action 2</z-command-item>
  </z-command-list>
</z-command>
```

**Demo:** `ZardDemoCommandDefaultComponent`

---

### 📆 Date Picker

**Purpose:** Date input with calendar popup

**Usage:**

```html
<z-date-picker
  formControlName="birthDate"
  placeholder="Select date..."
  zSize="md"
/>
```

**Demo:** `ZardDemoDatePickerDefaultComponent`, `ZardDemoDatePickerSizesComponent`

---

### 📱 Dialog

**Purpose:** Modal overlays

**Usage (Service):**

```typescript
import { ZardDialogService } from '@ihsan/ui';

private _dialog = inject(ZardDialogService);

openDialog() {
  const ref = this._dialog.open(MyDialogComponent, {
    width: '600px',
    data: { userId: 123 }
  });

  ref.closed.subscribe(result => {
    console.log('Result:', result);
  });
}
```

**Demo:** Test component has `openDialog()` method

---

### ➖ Divider

**Purpose:** Visual separation

**Usage:**

```html
<z-divider /> <z-divider orientation="vertical" />
```

**Demo:** `ZardDemoDividerDefaultComponent`, `ZardDemoDividerVerticalComponent`

---

### 📭 Empty

**Purpose:** Empty state display

**Usage:**

```html
<z-empty description="No data available" [image]="customImageUrl">
  <button z-button>Add Item</button>
</z-empty>
```

**Demo:** `ZardDemoEmptyDefaultComponent`, `ZardDemoEmptyCustomImageComponent`

---

### 📝 Form

**Purpose:** Form field wrapper with validation

**Usage:**

```html
<z-form-field>
  <z-form-label>Email</z-form-label>
  <input z-input formControlName="email" />
  <z-form-error *ngIf="form.get('email')?.hasError('required')">
    Email is required
  </z-form-error>
  <z-form-hint>We'll never share your email</z-form-hint>
</z-form-field>
```

**Demo:** `ZardDemoFormDefaultComponent`, `ZardDemoFormValidationComponent`

---

### 🎨 Icon

**Purpose:** SVG icon display

**Library:** Lucide Icons (1000+ icons)

**Usage:**

```html
<z-icon name="user" zSize="md" zColor="primary" />
<z-icon name="settings" [zStrokeWidth]="2" />
```

**Reference:** See [ZARD_ICON_REFERENCE.md](./ZARD_ICON_REFERENCE.md)

**Demo:** `ZardDemoIconDefaultComponent`, `ZardDemoIconSearchableComponent`

---

### 📥 Input

**Purpose:** Text input fields

**Types:** Text, Email, Password, Number, TextArea

**Variants:** Sizes, Status (error, warning), Borderless

**Usage:**

```html
<input
  z-input
  formControlName="username"
  placeholder="Enter username"
  zSize="md"
  [zStatus]="form.get('username')?.invalid ? 'error' : undefined"
/>

<textarea z-input formControlName="description" rows="4" />
```

**Demo:** `ZardDemoInputDefaultComponent`, `ZardDemoInputTextAreaComponent`

---

### 📦 Input Group

**Purpose:** Input with prefix/suffix addons

**Usage:**

```html
<z-input-group>
  <z-input-group-addon>@</z-input-group-addon>
  <input z-input formControlName="username" />
</z-input-group>

<z-input-group>
  <input z-input formControlName="amount" type="number" />
  <z-input-group-addon>USD</z-input-group-addon>
</z-input-group>
```

**Demo:** `ZardDemoInputGroupDefaultComponent`, `ZardDemoInputGroupTextComponent`

---

### ⌨️ Kbd

**Purpose:** Keyboard shortcut display

**Usage:**

```html
<z-kbd>Ctrl</z-kbd> + <z-kbd>S</z-kbd>

<z-kbd-group>
  <z-kbd>⌘</z-kbd>
  <z-kbd>K</z-kbd>
</z-kbd-group>
```

**Demo:** `ZardDemoKbdDefaultComponent`, `ZardDemoKbdGroupComponent`

---

### 🔄 Loader

**Purpose:** Loading indicators

**Usage:**

```html
<z-loader zSize="md" /> <z-loader zType="spinner" />
```

**Demo:** `ZardDemoLoaderDefaultComponent`, `ZardDemoLoaderBasicComponent`

---

### 🍔 Menu

**Purpose:** Dropdown menus

**Usage:**

```html
<z-menu>
  <button z-button [zMenuTrigger]="menu">Options</button>
  <z-menu-content #menu>
    <z-menu-item (select)="edit()">Edit</z-menu-item>
    <z-menu-item (select)="delete()">Delete</z-menu-item>
    <z-menu-separator />
    <z-menu-item (select)="archive()">Archive</z-menu-item>
  </z-menu-content>
</z-menu>
```

**Demo:** `ZardDemoMenuDefaultComponent`

---

### 📄 Pagination

**Purpose:** Page navigation

**Usage:**

```html
<z-pagination
  [total]="totalItems"
  [pageSize]="pageSize"
  [(page)]="currentPage"
  (pageChange)="loadPage($event)"
/>
```

**Demo:** `ZardDemoPaginationDefaultComponent`, `ZardDemoPaginationCustomComponent`

---

### 💬 Popover

**Purpose:** Floating content panel

**Triggers:** Click, Hover

**Usage:**

```html
<button z-button [zPopoverTrigger]="popover">Show Info</button>

<z-popover #popover>
  <z-popover-content>
    <h3>Information</h3>
    <p>Additional details here</p>
  </z-popover-content>
</z-popover>
```

**Demo:** `ZardDemoPopoverDefaultComponent`, `ZardDemoPopoverHoverComponent`

---

### 📊 Progress Bar

**Purpose:** Visual progress indicator

**Types:** Determinate, Indeterminate

**Usage:**

```html
<z-progress-bar [value]="uploadProgress" [max]="100" />
<z-progress-bar [indeterminate]="true" />
```

**Demo:** `ZardDemoProgressBarBasicComponent`, `ZardDemoProgressBarIndeterminateComponent`

---

### 🔘 Radio

**Purpose:** Single selection from group

**Usage:**

```html
<z-radio-group formControlName="plan">
  <z-radio value="free">Free Plan</z-radio>
  <z-radio value="pro">Pro Plan</z-radio>
  <z-radio value="enterprise">Enterprise</z-radio>
</z-radio-group>
```

**Demo:** `ZardDemoRadioDefaultComponent`, `ZardDemoRadioDisabledComponent`

---

### ↔️ Resizable

**Purpose:** Resizable panels

**Usage:**

```html
<z-resizable>
  <z-resizable-panel [size]="30">Sidebar</z-resizable-panel>
  <z-resizable-handle />
  <z-resizable-panel [size]="70">Main Content</z-resizable-panel>
</z-resizable>
```

**Demo:** `ZardDemoResizableDefaultComponent`, `ZardDemoResizableVerticalComponent`

---

### 🎚️ Segmented

**Purpose:** Segmented control (iOS-style)

**Usage:**

```html
<z-segmented [options]="['Day', 'Week', 'Month']" formControlName="viewMode" />
```

**Demo:** `ZardDemoSegmentedDefaultComponent`, `ZardDemoSegmentedSizesComponent`

---

### 📋 Select

**Purpose:** Dropdown selection

**Types:** Single, Multi-select

**Usage:**

```html
<z-select formControlName="country" placeholder="Select country">
  <z-select-option value="us">United States</z-select-option>
  <z-select-option value="uk">United Kingdom</z-select-option>
  <z-select-option value="ca">Canada</z-select-option>
</z-select>

<z-multi-select
  [options]="skills"
  formControlName="selectedSkills"
  placeholder="Select skills..."
/>
```

**Demo:** `ZardDemoSelectBasicComponent`, `ZardDemoMultiSelectBasicComponent`

---

### 📄 Sheet

**Purpose:** Side panel / drawer

**Sides:** Left, Right, Top, Bottom

**Usage (Service):**

```typescript
import { ZardSheetService } from '@ihsan/ui';

private _sheet = inject(ZardSheetService);

openSheet() {
  const ref = this._sheet.open(MySheetComponent, {
    side: 'right',
    width: '400px',
    data: { userId: 123 }
  });

  ref.closed.subscribe(result => {
    console.log('Sheet closed:', result);
  });
}
```

**Demo:** Test component has `openSheetBasic()` method

---

### 💀 Skeleton

**Purpose:** Loading placeholders

**Usage:**

```html
<z-skeleton zType="text" />
<z-skeleton zType="circle" [width]="40" [height]="40" />
<z-skeleton zType="rectangle" [width]="200" [height]="100" />
```

**Demo:** `ZardDemoSkeletonDefaultComponent`, `ZardDemoSkeletonCardComponent`

---

### 🎚️ Slider

**Purpose:** Range input

**Usage:**

```html
<z-slider [min]="0" [max]="100" [step]="5" formControlName="volume" />

<z-slider orientation="vertical" [min]="0" [max]="100" />
```

**Demo:** `ZardDemoSliderDefaultComponent`, `ZardDemoSliderVerticalComponent`

---

### 🔀 Switch

**Purpose:** Toggle on/off

**Usage:**

```html
<z-switch formControlName="notifications" zSize="md">
  Enable notifications
</z-switch>
```

**Demo:** `ZardDemoSwitchDefaultComponent`, `ZardDemoSwitchSizeComponent`

---

### 📊 Table

**Purpose:** Data tables

**Features:** Sorting, pagination, row selection

**Usage:**

```html
<z-table [data]="users">
  <z-table-header>
    <z-table-row>
      <z-table-head>Name</z-table-head>
      <z-table-head>Email</z-table-head>
      <z-table-head>Role</z-table-head>
    </z-table-row>
  </z-table-header>
  <z-table-body>
    <z-table-row *ngFor="let user of users">
      <z-table-cell>{{ user.name }}</z-table-cell>
      <z-table-cell>{{ user.email }}</z-table-cell>
      <z-table-cell>{{ user.role }}</z-table-cell>
    </z-table-row>
  </z-table-body>
</z-table>
```

**Demo:** `ZardDemoTablePaymentsComponent`

---

### 📑 Tabs

**Purpose:** Tabbed navigation

**Usage:**

```html
<z-tabs [(activeTab)]="activeTab">
  <z-tab-list>
    <z-tab value="profile">Profile</z-tab>
    <z-tab value="settings">Settings</z-tab>
    <z-tab value="notifications">Notifications</z-tab>
  </z-tab-list>

  <z-tab-panel value="profile">Profile content</z-tab-panel>
  <z-tab-panel value="settings">Settings content</z-tab-panel>
  <z-tab-panel value="notifications">Notifications content</z-tab-panel>
</z-tabs>
```

**Demo:** `ZardDemoTabsDefaultComponent`, `ZardDemoTabsPositionComponent`

---

### 🍞 Toast

**Purpose:** Temporary notifications

**Types:** Success, Error, Warning, Info, Loading

**Usage:**

```typescript
import { toast } from 'ngx-sonner';

// In your component
showNotification() {
  toast.success('Changes saved successfully!');
  toast.error('Failed to save changes');
  toast.info('New update available');
  toast.warning('This action cannot be undone');

  // Custom toast with description and action
  toast('Event has been created', {
    description: 'Sunday, December 03, 2023 at 9:00 AM',
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo'),
    },
  });
}
```

**Note:** Use `toast` function from `ngx-sonner`, not a service.

**Demo:** `ZardDemoToastComponent`, `ZardDemoToastSuccessComponent`

---

### 🔘 Toggle

**Purpose:** Toggle button

**Usage:**

```html
<z-toggle formControlName="bold" aria-label="Toggle bold">
  <z-icon name="bold" />
</z-toggle>
```

**Demo:** `ZardDemoToggleDefaultComponent`, `ZardDemoToggleWithTextComponent`

---

### 💡 Tooltip

**Purpose:** Contextual hints

**Triggers:** Hover, Click

**Usage:**

```html
<button z-button [zTooltip]="'Click to save changes'" zTooltipPosition="top">
  Save
</button>

<span [zTooltip]="tooltipContent" zTooltipTrigger="click">
  Click for info
</span>
```

**Demo:** `ZardDemoTooltipHoverComponent`, `ZardDemoTooltipClickComponent`

---

## Best Practices

### ✅ DO

1. **Always Use Zardui First**

   ```typescript
   // ✅ CORRECT - Use Zardui button
   <button z-button zType="primary">Save</button>

   // ❌ WRONG - Don't create custom button
   <app-custom-button type="primary">Save</app-custom-button>
   ```

2. **Leverage Variants**

   ```typescript
   // ✅ CORRECT - Use built-in variants
   <button z-button zType="outline" zSize="sm" zShape="circle">
     <z-icon name="edit" />
   </button>
   ```

3. **Use Services for Programmatic Components**

   ```typescsheet = inject(ZardSheetService);

   // ✅ CORRECT - Use toast function from ngx-sonner
   import { toast } from 'ngx-sonner';
   toast.success('Operation completed'
   private _dialog = inject(ZardDialogService);
   private _toast = inject(ZardToastService);
   private _sheet = inject(ZardSheetService);
   ```

4. **Colocate Component Files**

   ```
   user-profile/
   ├── user-profile.component.ts
   ├── user-profile.component.html
   ├── user-profile.component.scss
   ├── user-profile.service.ts      # If needed
   ├── user-profile.model.ts        # If needed
   ```

5. **Use Reactive Forms**

   ```typescript
   // ✅ CORRECT - Typed FormGroup
   interface IUserForm {
     name: FormControl<string>;
     email: FormControl<string>;
   }

   userForm = this._fb.group<IUserForm>({
     name: this._fb.control('', {
       validators: [Validators.required],
       nonNullable: true,
     }),
     email: this._fb.control('', {
       validators: [Validators.required, Validators.email],
       nonNullable: true,
     }),
   });
   ```

### ❌ DON'T

1. **Don't Create Duplicate UI Components**

   ```typescript
   // ❌ WRONG - Zardui already has Button
   @Component({
     selector: 'app-custom-button',
     template: `<button class="custom-btn">...</button>`,
   })
   export class CustomButtonComponent {}
   ```

2. **Don't Use Template-Driven Forms**

   ```html
   <!-- ❌ WRONG - No ngModel -->
   <input [(ngModel)]="username" />

   <!-- ✅ CORRECT - Use reactive forms -->
   <input z-input formControlName="username" />
   ```

3. **Don't Use @Input/@Output Decorators**

   ```typescript
   // ❌ WRONG - Don't use decorators
   @Input() userId: string;
   @Output() userClicked = new EventEmitter<User>();

   // ✅ CORRECT - Use signals
   userId = input.required<string>();
   userClicked = output<User>();
   ```

4. **Don't Hardcode Colors**

   ```scss
   // ❌ WRONG - Hardcoded color
   .element {
     background-color: #3b82f6;
   }

   // ✅ CORRECT - CSS variable
   .element {
     background-color: var(--color-primary);
   }
   ```

5. **Don't Create Wrapper Divs Unnecessarily**

   ```scss
   // ❌ WRONG - Extra wrapper
   <div class="wrapper">
     <button>Click</button>
   </div>
   
   // Component CSS
   .wrapper {
     display: flex;
   }

   // ✅ CORRECT - Style :host
   <button>Click</button>
   
   // Component CSS
   :host {
     display: flex;
   }
   ```

---

## Quick Reference

### Import Path

```typescript
import {
  ZardButtonComponent,
  ZardInputComponent,
  ZardDialogService,
  ZardToastService,
} from '@ihsan/ui';
```

### Common Services

```typescript
private _dialog = inject(ZardDialogService);
private _sheet = inject(ZardSheetService);
private _alertDialog = inject(ZardAlertDialogService);

// Toast uses function, not service
import { toast } from 'ngx-sonner';
```

### Test Page Location

```
apps/admin/src/app/pages/test-components/
```

### Documentation Links

- [Angular Design Pattern](./ANGULAR_DESIGN_PATTERN.md)
- [Page Container Pattern](./PAGE_CONTAINER_DESIGN_PATTERN.md)
- [Icon Reference](./ZARD_ICON_REFERENCE.md)
- [Identity Module Guide](./IDENTITY_MODULE_GUIDE.md)

---

## Troubleshooting

### Component Not Found

**Problem:** Import error for Zardui component

**Solution:**

1. Verify component is installed: `install-zardui-components.bat`
2. Check import path: Should be `@ihsan/ui`, not `@zardui/angular`
3. Verify component is exported in `libs/ui/src/lib/zard/components/index.ts`

### Styling Not Applied

**Problem:** Component doesn't look right

**Solution:**

1. Ensure Tailwind CSS is configured
2. Check that global styles are imported in `styles.scss`
3. Verify CSS variables are defined in theme

### Form Not Working

**Problem:** Form controls not updating

**Solution:**

1. Use `ReactiveFormsModule`, not `FormsModule`
2. Ensure `formControlName` matches form structure
3. Use typed `FormGroup` interface

---

**For more examples, see:** `apps/admin/src/app/pages/test-components/`
