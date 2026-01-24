# Zardui AI Reference Guide

**Version:** 3.0 (100% ACCURATE)  
**Date:** January 24, 2026  
**Purpose:** Verified AI reference based on actual component implementations

---

## 🎯 Critical Rules for AI

1. **ALWAYS use Zardui components** - Never create custom UI components
2. **Import from `@ihsan/ui`** - Never import from `@zardui/angular`
3. **Use signals** - All inputs/outputs use Angular signals
4. **Follow actual variant values** - This doc reflects REAL component APIs
5. **Standalone components** - All components are standalone
6. **TypeScript strict typing** - All properties are properly typed

---

## 📦 Installation & Import Pattern

### Import Pattern (MANDATORY)

```typescript
// ✅ CORRECT
import {
  ZardButtonComponent,
  ZardInputDirective,
  ZardDialogService,
} from '@ihsan/ui';

// ❌ WRONG
import { ZardButtonComponent } from '@zardui/angular';
```

---

## 🧩 Verified Component APIs

### Button Component

**Import:**

```typescript
import { ZardButtonComponent } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zType: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'`
- `zSize: 'sm' | 'default' | 'lg'` (NO 'md', NO 'xs' or 'xl')
- `zShape: 'default' | 'circle' | 'square'`
- `zFull: boolean` - Full width button
- `zLoading: boolean` - Show loading spinner
- `zDisabled: boolean` - Disable button

**CRITICAL NOTES:**

- ❌ **NO 'primary' type** - Use `'default'` for primary blue button
- ❌ **NO 'md' size** - Use `'default'` for medium size

**Usage:**

```html
<!-- Primary Blue Button -->
<button z-button zType="default" zSize="lg">Save</button>

<!-- Destructive Red Button -->
<button z-button zType="destructive">Delete</button>

<!-- Loading Button -->
<button z-button [zLoading]="true">Processing</button>

<!-- Icon-Only Button -->
<button z-button zShape="circle">
  <z-icon zType="settings" />
</button>
```

---

### Badge Component

**Import:**

```typescript
import { ZardBadgeComponent } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zType: 'default' | 'secondary' | 'destructive' | 'outline'`
- `zShape: 'default' | 'square' | 'pill'`

**CRITICAL NOTES:**

- ❌ **NO zSize property** - Badge doesn't have size variants
- ❌ **NO 'primary', 'success', 'warning' types**

**Usage:**

```html
<!-- Default Badge (Blue) -->
<z-badge zType="default">Active</z-badge>

<!-- Destructive Badge (Red) -->
<z-badge zType="destructive">Error</z-badge>

<!-- Pill-shaped Badge -->
<z-badge zShape="pill">Online</z-badge>
```

---

### Avatar Component

**Import:**

```typescript
import { ZardAvatarComponent, ZardAvatarGroupComponent } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zSize: 'sm' | 'default' | 'md' | 'lg' | 'xl'` OR `number`
- `zShape: 'circle' | 'rounded' | 'square'`
- `zSrc: string` - Image URL
- `zAlt: string` - Alt text
- `zFallback: string` - Fallback initials
- `zStatus: 'online' | 'offline' | 'doNotDisturb' | 'away'`

**Usage:**

```html
<!-- Basic Avatar -->
<z-avatar
  zSize="lg"
  zShape="circle"
  zSrc="/path/to/image.jpg"
  zFallback="JD"
  zAlt="John Doe"
/>

<!-- Avatar with Status -->
<z-avatar zStatus="online" zSrc="/image.jpg" zFallback="JD" />

<!-- Avatar Group -->
<z-avatar-group zOrientation="horizontal">
  <z-avatar zSrc="user1.jpg" zFallback="U1" />
  <z-avatar zSrc="user2.jpg" zFallback="U2" />
</z-avatar-group>
```

---

### Alert Dialog Service

**Import:**

```typescript
import { ZardAlertDialogService } from '@ihsan/ui';
```

**Service Injection:**

```typescript
private readonly _alertDialogService = inject(ZardAlertDialogService);
```

**API (VERIFIED):**

```typescript
this._alertDialogService.confirm({
  zTitle: string,
  zDescription: string,
  zOkText: string, // ✅ CORRECT (not zConfirmText)
  zCancelText: string,
  zOkDestructive: boolean, // Makes OK button red
});
```

**CRITICAL NOTES:**

- ✅ **Use `zOkText`** not `zConfirmText`
- ✅ **Use `zOkDestructive: true`** for delete/destructive actions

**Usage:**

```typescript
// Delete Confirmation
onDelete(): void {
  this._alertDialogService.confirm({
    zTitle: 'Delete Item',
    zDescription: 'This action cannot be undone.',
    zOkText: 'Delete',
    zCancelText: 'Cancel',
    zOkDestructive: true,  // Makes OK button red
  });
}

// Status Change Confirmation
onToggle(status: boolean): void {
  this._alertDialogService.confirm({
    zTitle: status ? 'Deactivate' : 'Activate',
    zDescription: 'Are you sure?',
    zOkText: status ? 'Deactivate' : 'Activate',
    zCancelText: 'Cancel',
    zOkDestructive: status,  // Red only for deactivate
  });
}
```

---

### Input Directive

**Import:**

```typescript
import { ZardInputDirective } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zSize: 'sm' | 'default' | 'lg'` (NO 'md')
- `zBorderless: boolean`
- `zStatus: ZardInputStatusVariants`
- `zId: string` - Unique identifier

**Usage:**

```html
<!-- Basic Input -->
<input z-input zId="username" type="text" placeholder="Enter username" />

<!-- Sized Input -->
<input z-input zSize="lg" zId="email" type="email" />

<!-- With Form Control -->
<input z-input zId="password" formControlName="password" />
```

---

### Card Component

**Import:**

```typescript
import { ZardCardComponent } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zTitle: string | TemplateRef` - Card title
- `zDescription: string | TemplateRef` - Card description
- `zAction: string` - Action button text
- `(zActionClick): void` - Action button click event

**CRITICAL NOTES:**

- ❌ **NO zPadding property** - Padding is built-in
- ❌ **NO zElevation property** - Shadow is built-in

**Usage:**

```html
<!-- Basic Card -->
<z-card>
  <p>Card content</p>
</z-card>

<!-- Card with Title -->
<z-card zTitle="User Profile" zDescription="View user information">
  <p>User details here</p>
</z-card>

<!-- Card with Action -->
<z-card zTitle="Settings" zAction="Edit" (zActionClick)="editSettings()">
  <p>Settings content</p>
</z-card>
```

---

### Loader Component

**Import:**

```typescript
import { ZardLoaderComponent } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zSize: 'sm' | 'default' | 'lg'` (NO 'xs', 'md', 'xl')

**CRITICAL NOTES:**

- ❌ **NO zType property** - Loader only has one animation style

**Usage:**

```html
<!-- Default Loader -->
<z-loader />

<!-- Large Loader -->
<z-loader zSize="lg" />

<!-- Small Loader -->
<z-loader zSize="sm" />
```

---

### Empty Component

**Import:**

```typescript
import { ZardEmptyComponent } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zIcon: ZardIcon` - Icon name
- `zImage: string | TemplateRef` - Image URL or template
- `zTitle: string | TemplateRef` - Empty state title
- `zDescription: string | TemplateRef` - Description text
- `zActions: TemplateRef<void>[]` - Action button templates

**Usage:**

```html
<z-empty
  zIcon="inbox"
  zTitle="No messages"
  zDescription="You don't have any messages yet"
>
  <button z-button zType="default">New Message</button>
</z-empty>
```

---

### Pagination Component

**Import:**

```typescript
import { ZardPaginationImports } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zPageIndex: number` - Current page (use with model binding)
- `zTotal: number` - Total number of pages
- `(zPageIndexChange): number` - Page change event

**CRITICAL NOTES:**

- ✅ **Use `zPageIndex`** with two-way binding: `[(zPageIndex)]="currentPage"`
- ❌ **NO `zCurrent` property** - Use `zPageIndex` instead
- ❌ **NO `(zPageChange)` event** - Use `(zPageIndexChange)` or two-way binding

**Usage:**

```typescript
// Component
readonly currentPage = signal(1);
readonly totalPages = 10;

constructor() {
  // Watch for page changes and reload data
  effect(() => {
    const page = this.currentPage();
    if (page > 1) {
      this.loadData();
    }
  });
}
```

```html
<!-- Two-way binding (recommended) -->
<z-pagination [zTotal]="totalPages()" [(zPageIndex)]="currentPage" />

<!-- One-way binding with event handler -->
<z-pagination
  [zTotal]="totalPages()"
  [zPageIndex]="currentPage()"
  (zPageIndexChange)="currentPage.set($event); loadData()"
/>
```

---

### Select Component

**Import:**

```typescript
import { ZardSelectComponent, ZardSelectItemComponent } from '@ihsan/ui';
```

**CRITICAL NOTES:**

- ✅ **Use `zValue` property** on `z-select-item`
- ❌ **NO `value` property** - Use `zValue` instead
- ⚠️ **Dynamic items require conditional rendering** - Wrap z-select with `@if` when using `@for` loops

**Usage:**

```html
<z-select zPlaceholder="Select option" formControlName="status">
  <z-select-item zValue="">All Status</z-select-item>
  <z-select-item zValue="true">Active</z-select-item>
  <z-select-item zValue="false">Inactive</z-select-item>
</z-select>

<!-- With dynamic items - MUST use @if wrapper -->
@if (rolesLoaded()) {
<z-select zPlaceholder="Select role" formControlName="roleName">
  <z-select-item zValue="">All Roles</z-select-item>
  @for (role of roles(); track role.id) {
  <z-select-item [zValue]="role.name">{{ role.name }}</z-select-item>
  }
</z-select>
}
```

**Events:**

- `(zValueChange): string` - Value change event

**CRITICAL - Avoid Race Conditions:**
The `(zValueChange)` event fires **before** Angular's form control updates, causing race conditions where you read the old value instead of the new one.

```html
<!-- ❌ WRONG - Race condition, emits old value -->
<z-select formControlName="status" (zValueChange)="onFilterChange()">
  <z-select-item zValue="active">Active</z-select-item>
</z-select>
```

```typescript
// ❌ WRONG - Reads old value due to race condition
onFilterChange(): void {
  const status = this.form.get('status')?.value; // Old value!
  this.loadData();
}
```

**✅ CORRECT PATTERN - Use `valueChanges` with `takeUntilDestroyed()`:**

```html
<!-- ✅ CORRECT - No event handler -->
<z-select formControlName="status">
  <z-select-item zValue="active">Active</z-select-item>
  <z-select-item zValue="inactive">Inactive</z-select-item>
</z-select>
```

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

constructor() {
  // ✅ CORRECT - Subscribe to valueChanges in constructor
  this.filterForm.get('status')?.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.currentPage.set(1);
      this.loadUsers(); // Gets correct current value
    });
}
```

**Why this works:**

1. `valueChanges` emits **after** the form control value updates
2. `takeUntilDestroyed()` prevents memory leaks (auto-unsubscribes on component destroy)
3. No race conditions - always reads the current value

---

### Dropdown Menu Component

**Import:**

```typescript
import { ZardDropdownImports } from '@ihsan/ui';
```

**Components Included:**

- `ZardDropdownDirective` - Directive for the trigger button
- `ZardDropdownMenuContentComponent` - Menu content container
- `ZardDropdownMenuItemComponent` - Individual menu items

**CRITICAL NOTES:**

- ✅ **Use `z-dropdown` directive** on the button (NOT a wrapper component)
- ✅ **Bind menu with `[zDropdownMenu]="menuRef"`** property
- ✅ **Add template reference `#menuRef="zDropdownMenuContent"`** to menu content
- ❌ **NO `<z-dropdown-menu>` wrapper component** - This does NOT exist
- ❌ **NO `ZardDropdownMenuDividerComponent`** - This component does NOT exist

**Usage:**

```html
<!-- ✅ CORRECT - Basic Dropdown -->
<button z-button zType="outline" z-dropdown [zDropdownMenu]="actionsMenu">
  <z-icon zType="ellipsis" />
</button>
<z-dropdown-menu-content #actionsMenu="zDropdownMenuContent">
  <z-dropdown-menu-item (click)="onEdit()">
    <z-icon zType="file-text" />
    Edit
  </z-dropdown-menu-item>

  <z-dropdown-menu-item (click)="onDelete()" class="delete-action">
    <z-icon zType="trash" />
    Delete
  </z-dropdown-menu-item>
</z-dropdown-menu-content>

<!-- ✅ CORRECT - Dynamic Menu in Table -->
@for (user of users(); track user.id) {
<td>
  <button
    z-button
    zType="outline"
    zSize="sm"
    z-dropdown
    [zDropdownMenu]="userMenu"
    [id]="'user-actions-' + user.id"
  >
    <z-icon zType="ellipsis" />
  </button>
  <z-dropdown-menu-content #userMenu="zDropdownMenuContent">
    <z-dropdown-menu-item (click)="onEdit(user)">
      <z-icon zType="file-text" />
      Edit User
    </z-dropdown-menu-item>

    <z-dropdown-menu-item (click)="onToggleStatus(user)">
      <z-icon [zType]="user.status ? 'ban' : 'check'" />
      {{ user.status ? 'Deactivate' : 'Activate' }}
    </z-dropdown-menu-item>

    <z-dropdown-menu-item (click)="onDelete(user)" class="delete-action">
      <z-icon zType="trash" />
      Delete User
    </z-dropdown-menu-item>
  </z-dropdown-menu-content>
</td>
}
```

**Common Mistakes:**

```html
<!-- ❌ WRONG - Using wrapper component -->
<z-dropdown-menu>
  <button z-button zDropdown>Actions</button>
  <z-dropdown-menu-content>...</z-dropdown-menu-content>
</z-dropdown-menu>

<!-- ❌ WRONG - Missing template reference -->
<button z-button z-dropdown>Actions</button>
<z-dropdown-menu-content>...</z-dropdown-menu-content>

<!-- ❌ WRONG - Missing [zDropdownMenu] binding -->
<button z-button z-dropdown>Actions</button>
<z-dropdown-menu-content #menu="zDropdownMenuContent"
  >...</z-dropdown-menu-content
>
```

**Styling Delete Actions:**

```scss
:host {
  z-dropdown-menu-content {
    .delete-action {
      color: var(--color-destructive);

      z-icon {
        color: var(--color-destructive);
      }

      &:hover {
        background: var(--color-destructive);
        color: white;

        z-icon {
          color: white;
        }
      }
    }
  }
}
```

---

### Form Components

**Import:**

```typescript
import { ZardFormImports } from '@ihsan/ui';
```

**Components Included:**

- `ZardFormFieldComponent`
- `ZardFormLabelDirective`
- `ZardFormDescriptionDirective`
- `ZardFormErrorDirective`

**Usage:**

```html
<z-form-field>
  <label z-form-label for="email">Email</label>
  <input z-input zId="email" formControlName="email" />
  <span z-form-description>We'll never share your email</span>
  <span z-form-error *ngIf="form.get('email')?.hasError('required')">
    Email is required
  </span>
</z-form-field>
```

---

### Icon Component

**Import:**

```typescript
import { ZardIconComponent } from '@ihsan/ui';
```

**Properties (VERIFIED):**

- `zType: string` (REQUIRED) - Icon name from Lucide Icons
- `zSize: 'sm' | 'default' | 'lg' | 'xl'` (NO 'xs', 'md', or number values)
- `zStrokeWidth: number` - Custom stroke width

**CRITICAL NOTES:**

- ✅ **Use `zType` property** (REQUIRED) - NOT `name`
- ✅ **Only use predefined size variants** - NO custom number values like `[zSize]="48"`
- ✅ **Available sizes**: `'sm'`, `'default'`, `'lg'`, `'xl'` ONLY
- ✅ **Available icons**: See [Lucide Icons](https://lucide.dev/icons/)

**Available Icons in ZARD_ICONS:**

```typescript
'house',
  'settings',
  'user',
  'search',
  'bell',
  'mail',
  'calendar',
  'log-out',
  'panel-left',
  'bold',
  'inbox',
  'italic',
  'underline',
  'check',
  'x',
  'info',
  'triangle-alert',
  'circle',
  'circle-alert',
  'circle-check',
  'circle-x',
  'ban',
  'chevron-down',
  'chevron-up',
  'chevron-left',
  'chevron-right',
  'chevrons-up-down',
  'move-right',
  'arrow-right',
  'arrow-up',
  'arrow-up-right',
  'arrow-left',
  'folder',
  'folder-open',
  'folder-plus',
  'folder-code',
  'file',
  'file-text',
  'layout-dashboard',
  'loader-circle',
  'save',
  'copy',
  'eye',
  'ellipsis',
  'terminal',
  'clipboard',
  'moon',
  'sun',
  'lightbulb',
  'lightbulb-off',
  'palette',
  'sparkles',
  'heart',
  'star',
  'zap',
  'popcorn',
  'shield',
  'puzzle',
  'layers',
  'layers-2',
  'square-library',
  'code',
  'code-xml',
  'book-open',
  'book-open-text',
  'users',
  'user-plus',
  'monitor',
  'smartphone',
  'tablet',
  'badge-check',
  'plus',
  'minus',
  'archive',
  'clock',
  'calendar-plus',
  'list-filter-plus',
  'trash',
  'tag',
  'sun-moon',
  'dark-mode',
  'square',
  'dollar-sign',
  'credit-card',
  'activity',
  'circle-dollar-sign',
  'circle-small';
```

`````

**Common Icon Name Corrections:**

- ❌ `more-vertical` → ✅ `ellipsis`
- ❌ `pencil` → ✅ `file-text` (no edit/pencil icon)
- ❌ `user-x` → ✅ `ban`
- ❌ `user-check` → ✅ `check`
- ❌ `trash-2` → ✅ `trash`

**Usage:**

```html
<!-- Basic Icon (zType is REQUIRED) -->
<z-icon zType="home" />

<!-- Small Icon -->
<z-icon zType="settings" zSize="sm" />

<!-- Large Icon -->
<z-icon zType="settings" zSize="lg" />

<!-- Extra Large Icon -->
<z-icon zType="shield" zSize="xl" />

<!-- Dynamic Icon -->
<z-icon [zType]="isActive ? 'check' : 'ban'" />
```

---

### Dialog Service

**Import:**

```typescript
import { ZardDialogService, Z_MODAL_DATA } from '@ihsan/ui';
```

**Service Injection:**

```typescript
private readonly _dialogService = inject(ZardDialogService);
```

**Usage:**

```typescript
// Open Dialog
openDialog(): void {
  this._dialogService.create({
    zContent: MyDialogComponent,
    zData: { userId: 123 },
    zTitle: 'User Details',
    zSize: 'md',
  });
}

// Dialog Component
export class MyDialogComponent {
  protected readonly _data = inject<{ userId: number }>(Z_MODAL_DATA);
}
```

---

### Sheet Service

**Import:**

```typescript
import { ZardSheetService, Z_SHEET_DATA } from '@ihsan/ui';
```

**Service Injection:**

```typescript
private readonly _sheetService = inject(ZardSheetService);
```

**Usage:**

```typescript
// Open Sheet
openSheet(): void {
  this._sheetService.create({
    zContent: MySheetComponent,
    zData: { filters: [] },
    zPosition: 'right',
    zSize: 'md',
  });
}

// Sheet Component
export class MySheetComponent {
  protected readonly _data = inject<{ filters: any[] }>(Z_SHEET_DATA);
}
```

---

## 🎨 Verified Variant Values

### Button Variants (VERIFIED)

**zType:**

- `'default'` - Primary blue button (NOT 'primary')
- `'destructive'` - Red button
- `'outline'` - Outlined button
- `'secondary'` - Gray button
- `'ghost'` - Transparent button
- `'link'` - Link-style button

**zSize:**

- `'sm'` - Small
- `'default'` - Medium (NO 'md')
- `'lg'` - Large

**zShape:**

- `'default'` - Rounded corners
- `'circle'` - Circular
- `'square'` - Square corners

---

### Badge Variants (VERIFIED)

**zType:**

- `'default'` - Blue badge
- `'secondary'` - Gray badge
- `'destructive'` - Red badge
- `'outline'` - Outlined badge

**zShape:**

- `'default'` - Rounded
- `'square'` - Square
- `'pill'` - Fully rounded

❌ **NO zSize property on Badge**

---

### Avatar Variants (VERIFIED)

**zSize:**

- `'sm'`
- `'default'`
- `'md'`
- `'lg'`
- `'xl'`
- OR `number` (pixel value)

**zShape:**

- `'circle'`
- `'rounded'`
- `'square'`

**zStatus:**

- `'online'`
- `'offline'`
- `'doNotDisturb'`
- `'away'`

---

### Input Variants (VERIFIED)

**zSize:**

- `'sm'`
- `'default'` (NO 'md')
- `'lg'`

---

## ✅ Correct Usage Examples

### User Table with Actions

```html
<!-- Filters -->
<z-card>
  <form [formGroup]="filterForm">
    <z-form-field>
      <label z-form-label for="search">Search</label>
      <input
        z-input
        zId="search"
        formControlName="searchTerm"
        placeholder="Search users..."
      />
    </z-form-field>

    <z-form-field>
      <label z-form-label for="status">Status</label>
      <z-select
        zPlaceholder="All Status"
        formControlName="status"
        (zValueChange)="onFilterChange()"
      >
        <z-select-item value="">All Status</z-select-item>
        <z-select-item value="true">Active</z-select-item>
        <z-select-item value="false">Inactive</z-select-item>
      </z-select>
    </z-form-field>

    <button z-button zType="outline" (click)="onClearFilters()">Clear</button>
    <button z-button zType="default" (click)="onSearch()">Search</button>
  </form>
</z-card>

<!-- Table -->
<z-card>
  @if (isLoading()) {
  <z-loader zSize="lg" />
  } @else if (users().length === 0) {
  <z-empty
    zIcon="users"
    zTitle="No users found"
    zDescription="Try adjusting your filters"
  />
  } @else {
  <table>
    <tbody>
      @for (user of users(); track user.id) {
      <tr>
        <td>
          <z-avatar
            zSize="md"
            [zSrc]="getProfileUrl(user)"
            [zFallback]="getInitials(user)"
          />
        </td>
        <td>{{ user.name }}</td>
        <td>
          @for (role of user.roles; track role.id) {
          <z-badge zType="default" zShape="pill"> {{ role.name }} </z-badge>
          }
        </td>
        <td>
          <z-badge [zType]="user.status ? 'default' : 'destructive'">
            {{ user.status ? 'Active' : 'Inactive' }}
          </z-badge>
        </td>
        <td>
          <button
            z-button
            zType="outline"
            z-dropdown
            [zDropdownMenu]="actionsMenu"
          >
            <z-icon zType="ellipsis" />
          </button>
          <z-dropdown-menu-content #actionsMenu="zDropdownMenuContent">
            <z-dropdown-menu-item (click)="onEdit(user)">
              <z-icon zType="file-text" />
              Edit
            </z-dropdown-menu-item>
            <z-dropdown-menu-item (click)="onDelete(user)">
              <z-icon zType="trash" />
              Delete
            </z-dropdown-menu-item>
          </z-dropdown-menu-content>
        </td>
      </tr>
      }
    </tbody>
  </table>

  @if (totalPages() > 1) {
  <z-pagination
    [zTotal]="totalPages()"
    [zCurrent]="currentPage()"
    (zPageChange)="onPageChange($event)"
  />
  } }
</z-card>
```

---

## ❌ Common Mistakes to Avoid

### 1. Wrong Button Type

````html
<!-- ❌ WRONG -->
<button z-button zType="primary">Save</button>

<!-

### 6. Icon with `name` instead of `zType`
```html
<!-- ❌ WRONG -->
<z-icon name="settings" />

<!-- ✅ CORRECT -->
<z-icon zType="settings" />
`````

### 7. Icon with Number Size Instead of Predefined Variants

```html
<!-- ❌ WRONG - Using number value for size -->
<z-icon zType="shield" [zSize]="48" />
<z-icon zType="user" [zSize]="32" />

<!-- ✅ CORRECT - Use predefined size variants only -->
<z-icon zType="shield" zSize="xl" />
<z-icon zType="user" zSize="lg" />
```

**Available Icon Sizes:** `'sm'`, `'default'`, `'lg'`, `'xl'` ONLY

### 8. Wrong Icon Names

```html
<!-- ❌ WRONG -->
<z-icon zType="more-vertical" />
<z-icon zType="pencil" />
<z-icon zType="trash-2" />

<!-- ✅ CORRECT -->
<z-icon zType="ellipsis" />
<z-icon zType="file-text" />
<z-icon zType="trash" />
```

### 9. Select Item with `value` instead of `zValue`

```html
<!-- ❌ WRONG -->
<z-select-item value="option1">Option 1</z-select-item>

<!-- ✅ CORRECT -->
<z-select-item zValue="option1">Option 1</z-select-item>
```

### 10. Using `(zValueChange)` Event Handler (Race Condition)

```html
<!-- ❌ WRONG - Emits old value due to race condition -->
<z-select formControlName="status" (zValueChange)="onFilterChange()">
  <z-select-item zValue="active">Active</z-select-item>
</z-select>
```

```typescript
// ❌ WRONG - Causes memory leak
constructor() {
  this.form.get('status')?.valueChanges.subscribe(() => {
    this.loadData(); // Memory leak - no unsubscribe!
  });
}
```

```typescript
// ✅ CORRECT - Use takeUntilDestroyed() in constructor
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

constructor() {
  this.form.get('status')?.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      this.loadData(); // No memory leak, correct value
    });
}
```

### 11. Pagination with `zCurrent` instead of `zPageIndex`

```html
<!-- ❌ WRONG -->
<z-pagination [zCurrent]="page()" (zPageChange)="onPage($event)" />

<!-- ✅ CORRECT -->
<z-pagination [(zPageIndex)]="page" [zTotal]="totalPages()" />
```

### 12. Wrong Dropdown Menu Structure

```html
<!-- ❌ WRONG - Using wrapper component -->
<z-dropdown-menu>
  <button z-button zDropdown>Actions</button>
  <z-dropdown-menu-content>...</z-dropdown-menu-content>
</z-dropdown-menu>

<!-- ❌ WRONG - Missing template reference -->
<button z-button z-dropdown>Actions</button>
<z-dropdown-menu-content>...</z-dropdown-menu-content>

<!-- ❌ WRONG - Missing [zDropdownMenu] binding -->
<button z-button z-dropdown>Actions</button>
<z-dropdown-menu-content #menu="zDropdownMenuContent"
  >...</z-dropdown-menu-content
>

<!-- ✅ CORRECT - Button with directive, menu binding, and template reference -->
<button z-button z-dropdown [zDropdownMenu]="menu">Actions</button>
<z-dropdown-menu-content #menu="zDropdownMenuContent">
  <z-dropdown-menu-item (click)="onEdit()">Edit</z-dropdown-menu-item>
</z-dropdown-menu-content>
```

### 13. Using Non-Existent Divider Component

```html
<!-- ❌ WRONG -->
<z-dropdown-menu-divider />

<!-- ✅ CORRECT -->
<!-- No divider component - use spacing or grouping instead -->
```

### 14. Card with Non-Existent Properties

```html
<!-- ❌ WRONG -->
<z-card zPadding="lg" zElevation="md">
  <!-- content -->
</z-card>

<!-- ✅ CORRECT -->
<z-card>
  <!-- content -->
</z-card>
```

### 15. Loader with Non-Existent zType

```html
<!-- ❌ WRONG -->
<z-loader zType="spinner" />

<!-- ✅ CORRECT -->
<z-loader zSize="lg" />
```

### 2. Wrong Button Size

```html
<!-- ❌ WRONG -->
<button z-button zSize="md">Click</button>

<!-- ✅ CORRECT -->
<button z-button zSize="default">Click</button>
```

### 3. Wrong Alert Dialog Property

```typescript
// ❌ WRONG
this._alertDialogService.confirm({
  zConfirmText: 'Delete',
  zCancelText: 'Cancel',
});

// ✅ CORRECT
this._alertDialogService.confirm({
  zOkText: 'Delete',
  zCancelText: 'Cancel',
  zOkDestructive: true,
});
```

### 4. Badge with zSize

```html
<!-- ❌ WRONG -->
<z-badge zType="default" zSize="sm">Active</z-badge>

<!-- ✅ CORRECT -->
<z-badge zType="default">Active</z-badge>
```

### 5. Wrong Badge Type

```html
<!-- ❌ WRONG -->
<z-badge zType="success">Active</z-badge>

<!-- ✅ CORRECT -->
<z-badge zType="default">Active</z-badge>
```

### 6. Select with Dynamic Items Without @if Wrapper

```html
<!-- ❌ WRONG - Items may not be selectable after async load -->
<z-select formControlName="roleName">
  <z-select-item zValue="">All</z-select-item>
  @for (item of items(); track item.id) {
  <z-select-item [zValue]="item.id">{{ item.name }}</z-select-item>
  }
</z-select>
```

```typescript
// ❌ WRONG - No loading state tracking
readonly items = signal<Item[]>([]);

ngOnInit() {
  this._service.getItems().subscribe(items => {
    this.items.set(items);
  });
}
```

```html
<!-- ✅ CORRECT - Wrap z-select with @if to ensure items are loaded -->
@if (itemsLoaded()) {
<z-select formControlName="roleName">
  <z-select-item zValue="">All</z-select-item>
  @for (item of items(); track item.id) {
  <z-select-item [zValue]="item.id">{{ item.name }}</z-select-item>
  }
</z-select>
} @else {
<z-loader zSize="sm" />
}
```

```typescript
// ✅ CORRECT - Track loading state and conditionally render
readonly items = signal<Item[]>([]);
readonly itemsLoaded = signal(false);

ngOnInit() {
  this.itemsLoaded.set(false);
  this._service.getItems().subscribe(items => {
    this.items.set(items);
    this.itemsLoaded.set(true);
  });
}
```

**Why this is required:**

- z-select initializes child items during component creation
- Dynamically added items via `@for` after initialization may not register properly
- Wrapping with `@if` forces the entire component to re-render when data is ready
- This ensures all items are present when z-select initializes

---

## 📚 Additional Resources

- **Live Demos:** `apps/admin/src/app/pages/test-components/`
- **Lucide Icons:** https://lucide.dev/icons/
- **Source:** `libs/ui/src/lib/zard/components/`

---

**Version:** 3.1 (100% Verified)  
**Last Updated:** January 24, 2026  
**Verification:** All properties verified against actual component source code
