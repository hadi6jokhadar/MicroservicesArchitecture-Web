# STRICT Zardui Component Usage Rules

## CRITICAL: ALWAYS Use Zardui Components

**NEVER create custom UI components when Zardui provides them. ALL UI elements MUST use Zardui.**

## Mandatory Zardui Usage

### Buttons

**ALWAYS use `z-button` directive - works on `<button>`, `<a>`, and any element:**

```html
<!-- Standard button -->
<button z-button [zType]="'default'">Click me</button>

<!-- Link as button -->
<a z-button [zType]="'outline'" [routerLink]="'/path'">Navigate</a>

<!-- Ghost button (transparent background) -->
<button z-button [zType]="'ghost'">Ghost</button>

<!-- Full width button -->
<button z-button [zFull]="true">Full Width</button>

<!-- Button sizes -->
<button z-button [zSize]="'sm'">Small</button>
<button z-button [zSize]="'default'">Default</button>
<button z-button [zSize]="'lg'">Large</button>

<!-- With icon -->
<button z-button>
  <i z-icon zType="plus"></i>
  Add Item
</button>
```

**Component Import:**

```typescript
import { ZardButtonComponent } from '@ihsan/ui';

@Component({
  imports: [ZardButtonComponent],
})
```

### Icons

**ALWAYS use `z-icon` directive with Lucide icons:**

```html
<!-- Basic icon -->
<i z-icon zType="home"></i>

<!-- Icon sizes -->
<i z-icon zType="user" [zSize]="'sm'"></i>
<i z-icon zType="settings" [zSize]="'default'"></i>
<i z-icon zType="menu" [zSize]="'lg'"></i>

<!-- Custom stroke width -->
<i z-icon zType="heart" [zStrokeWidth]="3"></i>
```

**Component Import:**

```typescript
import { ZardIconComponent } from '@ihsan/ui';

@Component({
  imports: [ZardIconComponent],
})
```

---

### MANDATORY: Icon Registration Rule

**BEFORE using any `zType` value on `<i z-icon>`, you MUST verify the icon is registered.**

#### Step-by-step process (no exceptions):

1. **Read** `libs/ui/src/lib/zard/components/icon/icons.ts` and check if the icon key exists in `ZARD_ICONS`.
2. **If it exists** → use it directly in the template.
3. **If it does NOT exist** → you MUST register it before using it:

```typescript
// 1. Add the named import at the top of icons.ts
import { RefreshCw } from 'lucide-angular';

// 2. Add the key/value entry inside the ZARD_ICONS constant
export const ZARD_ICONS = {
  // ...existing icons...
  'refresh-cw': RefreshCw,
} as const satisfies Record<string, LucideIconData>;
```

4. **Then** use the newly registered key in your template:

```html
<i z-icon zType="refresh-cw"></i>
```

#### Why this matters

`ZardIcon` is a strict TypeScript type derived from `keyof typeof ZARD_ICONS`. Using an unregistered key causes a compile-time type error (`Type '"icon-name"' is not assignable to type 'ZardIcon'`). The icon will also fail to render at runtime.

---

### Cards

**ALWAYS use `z-card` for content containers:**

```html
<z-card [zTitle]="'Card Title'" [zDescription]="'Card description'">
  <p>Card content goes here</p>
</z-card>
```

### Inputs

**ALWAYS use Zardui input components:**

```html
<!-- Text input -->
<input z-input type="text" placeholder="Enter text" />

<!-- With input group -->
<z-input-group>
  <i z-icon zType="mail"></i>
  <input z-input type="email" placeholder="Email" />
</z-input-group>
```

### Form Controls

```html
<!-- Checkbox -->
<z-checkbox [(ngModel)]="checked" />

<!-- Switch -->
<z-switch [(ngModel)]="enabled" />

<!-- Radio -->
<z-radio [(ngModel)]="selected" [value]="'option1'" />

<!-- Select -->
<z-select [(ngModel)]="selectedValue">
  <z-option [value]="'1'">Option 1</z-option>
  <z-option [value]="'2'">Option 2</z-option>
</z-select>
```

### Select All-Option Rule (Critical)

- Never use empty string for `z-select-item` value.
- For the all option, always use a non-empty sentinel like `all`.
- In TypeScript, map `all` to `undefined` or `null` before building API query objects so backend returns unfiltered data.

```html
<!-- Correct all option pattern -->
<z-select formControlName="status">
  <z-select-item zValue="all">{{ 'common.all' | translate }}</z-select-item>
  @for (item of statusOptions; track item.value) {
    <z-select-item [zValue]="item.value">{{ item.label | translate }}</z-select-item>
  }
</z-select>
```

```typescript
// Convert all to no filter before request
const status = this.filterForm.controls.status.value;
const request = {
  status: status !== 'all' ? status : undefined,
};
```

### Dialogs & Overlays

```html
<!-- Dialog -->
<z-dialog [(open)]="isOpen">
  <z-dialog-content>
    <z-dialog-header>
      <z-dialog-title>Dialog Title</z-dialog-title>
    </z-dialog-header>
    <p>Dialog content</p>
  </z-dialog-content>
</z-dialog>

<!-- Dropdown -->
<z-dropdown>
  <button z-button z-dropdown-trigger>Open Menu</button>
  <z-dropdown-content>
    <z-dropdown-item>Item 1</z-dropdown-item>
    <z-dropdown-item>Item 2</z-dropdown-item>
  </z-dropdown-content>
</z-dropdown>

<!-- Tooltip -->
<button z-button [z-tooltip]="'Tooltip text'">Hover me</button>
```

### Navigation

```html
<!-- Tabs -->
<z-tabs>
  <z-tab-list>
    <z-tab>Tab 1</z-tab>
    <z-tab>Tab 2</z-tab>
  </z-tab-list>
  <z-tab-panel>Content 1</z-tab-panel>
  <z-tab-panel>Content 2</z-tab-panel>
</z-tabs>

<!-- Breadcrumb -->
<z-breadcrumb>
  <z-breadcrumb-item>Home</z-breadcrumb-item>
  <z-breadcrumb-item>Products</z-breadcrumb-item>
  <z-breadcrumb-item>Details</z-breadcrumb-item>
</z-breadcrumb>

<!-- Menu -->
<z-menu>
  <z-menu-item>
    <i z-icon zType="home"></i>
    Home
  </z-menu-item>
  <z-menu-item>
    <i z-icon zType="settings"></i>
    Settings
  </z-menu-item>
</z-menu>
```

### Feedback Components

```html
<!-- Alert -->
<z-alert [zType]="'info'" [zTitle]="'Information'">
  This is an informational message.
</z-alert>

<!-- Badge -->
<z-badge [zType]="'default'">New</z-badge>

<!-- Toast (programmatic) -->
<z-toast [message]="'Success!'" [type]="'success'" />

<!-- Loader -->
<z-loader [zSize]="'lg'" />

<!-- Skeleton -->
<z-skeleton [zHeight]="'200px'" />

<!-- Progress Bar -->
<z-progress-bar [zValue]="75" [zMax]="100" />
```

### Layout Components

```html
<!-- Divider -->
<z-divider />

<!-- Accordion -->
<z-accordion>
  <z-accordion-item>
    <z-accordion-trigger>Section 1</z-accordion-trigger>
    <z-accordion-content>Content 1</z-accordion-content>
  </z-accordion-item>
</z-accordion>

<!-- Resizable panels -->
<z-resizable>
  <z-resizable-panel>Panel 1</z-resizable-panel>
  <z-resizable-handle />
  <z-resizable-panel>Panel 2</z-resizable-panel>
</z-resizable>
```

### Display Components

```html
<!-- Avatar -->
<z-avatar [zSrc]="userImage" [zAlt]="userName" />

<!-- Table -->
<z-table>
  <z-table-header>
    <z-table-row>
      <z-table-head>Name</z-table-head>
      <z-table-head>Email</z-table-head>
    </z-table-row>
  </z-table-header>
  <z-table-body>
    <z-table-row>
      <z-table-cell>John Doe</z-table-cell>
      <z-table-cell>john@example.com</z-table-cell>
    </z-table-row>
  </z-table-body>
</z-table>

<!-- Empty state -->
<z-empty [zMessage]="'No data available'" />
```

## FORBIDDEN Practices

### DON'T Create Custom Buttons

```html
❌ WRONG
<button class="custom-btn">Click me</button>

✅ CORRECT
<button z-button>Click me</button>
<a z-button [routerLink]="'/path'">Navigate</a>
```

### DON'T Use Emoji Icons

```html
❌ WRONG
<span>🏠</span>

✅ CORRECT
<i z-icon zType="home"></i>
```

### DON'T Create Custom Cards

```html
❌ WRONG
<div class="custom-card">
  <h3>Title</h3>
  <p>Content</p>
</div>

✅ CORRECT
<z-card [zTitle]="'Title'">
  <p>Content</p>
</z-card>
```

### DON'T Style Zardui Components Directly

```scss
❌ WRONG (styling z-button internals)
:host {
  button[z-button] {
    background-color: red !important;
  }
}

✅ CORRECT (use variants)
// <button z-button [zType]="'destructive'">Delete</button>

✅ CORRECT (add wrapper class if needed)
// <div class="my-wrapper"><button z-button>Click</button></div>
```

## Component Import Pattern

**ALWAYS import from `@ihsan/ui`:**

```typescript
import { Component } from '@angular/core';
import {
  ZardButtonComponent,
  ZardIconComponent,
  ZardCardComponent,
} from '@ihsan/ui';

@Component({
  selector: 'my-component',
  imports: [ZardButtonComponent, ZardIconComponent, ZardCardComponent],
  templateUrl: './my-component.html',
})
export class MyComponent {}
```

## Quick Reference

| Need                  | Use                              |
| --------------------- | -------------------------------- |
| Button                | `<button z-button>`              |
| Link as button        | `<a z-button [routerLink]="..."` |
| Icon                  | `<i z-icon zType="icon-name">`   |
| Card container        | `<z-card>`                       |
| Text input            | `<input z-input>`                |
| Checkbox              | `<z-checkbox>`                   |
| Switch                | `<z-switch>`                     |
| Dropdown              | `<z-dropdown>`                   |
| Dialog/Modal          | `<z-dialog>`                     |
| Alert message         | `<z-alert>`                      |
| Badge                 | `<z-badge>`                      |
| Loading spinner       | `<z-loader>`                     |
| Tabs                  | `<z-tabs>`                       |
| Table                 | `<z-table>`                      |
| Avatar                | `<z-avatar>`                     |
| Divider               | `<z-divider>`                    |
| Empty state           | `<z-empty>`                      |
| Progress bar          | `<z-progress-bar>`               |
| Skeleton loading      | `<z-skeleton>`                   |
| Tooltip               | `[z-tooltip]="'text'"`           |
| Breadcrumb navigation | `<z-breadcrumb>`                 |
| Menu                  | `<z-menu>`                       |
| Accordion             | `<z-accordion>`                  |

**EVERY interactive element, form control, layout component, or UI widget MUST use Zardui. NO exceptions.**
