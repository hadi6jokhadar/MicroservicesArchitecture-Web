---
name: zard-components
description: >
  Complete reference and usage guide for the Zardui (Zard) component library in the
  MicroservicesArchitecture-Web Angular project. Use this skill whenever you are
  writing or reviewing Angular templates, components, or services that involve any
  z-* selector, any Zard import from @ihsan/ui, any dialog/sheet/dropdown overlay,
  any form field, any icon, any table, any badge, loader, skeleton, pagination,
  avatar, alert, tooltip, or any other UI element in this project. Also trigger for
  questions like "how do I use z-select?", "what icon should I use?", "how do I open
  a dialog?", "how do I make a form?". Always load this skill before touching any
  Angular template — it prevents the most common and costly Zard mistakes.
---

# Zardui Component Usage Guide

## Golden Rules (Never Break These)

1. **Import ONLY from `@ihsan/ui`** — never from `@zardui/angular` or subpaths
2. **Every UI element uses a Zard component** — no custom buttons, cards, inputs, icons, or spinners
3. **All `z-*` selectors and inputs must exist in `Doc/ZARDUI_AI_REFERENCE.md`** — never invent props
4. **Signals everywhere** — `input()` / `output()` / `signal()` / `computed()` — no `@Input`/`@Output`
5. **No `any` types** — strict TypeScript throughout
6. **Standalone components only** — no NgModules

---

## Component Quick Reference

| Need | Selector / Usage | Import |
|---|---|---|
| Button | `<button z-button>` / `<a z-button>` | `ZardButtonComponent` |
| Icon | `<i z-icon zType="...">` | `ZardIconComponent` |
| Card | `<z-card>` | `ZardCardComponent` |
| Text input | `<input z-input>` / `<textarea z-input>` | `ZardInputDirective` |
| Input with icon | `<z-input-group>` wrapping `<input z-input>` | `ZardInputGroupComponent` |
| Select (short list) | `<z-select>` + `<z-select-item zValue="...">` | `ZardSelectComponent, ZardSelectItemComponent` |
| Select (searchable) | `<z-combobox>` | `ZardComboboxComponent` |
| Command palette | `<z-command>` | Command imports |
| Checkbox | `<z-checkbox>` | `ZardCheckboxComponent` |
| Switch | `<z-switch>` | `ZardSwitchComponent` |
| Radio | `<z-radio>` | `ZardRadioComponent` |
| Date input | `<z-date-picker>` | `ZardDatePickerComponent` |
| Segmented control | `<z-segmented>` | `ZardSegmentedComponent` |
| Range / slider | `<input type="range" z-slider>` | `ZardSliderDirective` |
| Toggle button | `<button z-toggle>` | `ZardToggleComponent` |
| Toggle group | `<z-toggle-group>` | `ZardToggleGroupComponent` |
| Dialog / modal | `ZardDialogService.create()` | `ZardDialogService` |
| Sheet / drawer | `ZardSheetService.create()` | `ZardSheetService` |
| Confirm dialog | `ZardAlertDialogService.confirm()` | `ZardAlertDialogService` |
| Tooltip | `[zTooltip]="'text'"` | `ZardTooltipDirective` |
| Popover | `[zPopover]` + `<z-popover>` | `ZardPopoverDirective` |
| Dropdown menu | `z-dropdown` directive + `<z-dropdown-menu-content>` | `ZardDropdownImports` |
| Table | `<table z-table>` + row/head/cell directives | Table imports |
| Pagination | `<z-pagination>` | `ZardPaginationImports` |
| Avatar | `<z-avatar>` | `ZardAvatarComponent` |
| Badge | `<z-badge>` | `ZardBadgeComponent` |
| Alert (inline) | `<z-alert>` | `ZardAlertComponent` |
| Toast (transient) | `inject(NgxSonnerToastr)` from ngx-sonner | — |
| Loader / spinner | `<z-loader>` | `ZardLoaderComponent` |
| Skeleton loading | `<z-skeleton>` | `ZardSkeletonComponent` |
| Empty state | `<z-empty>` | `ZardEmptyComponent` |
| Progress bar | `<z-progress-bar>` | `ZardProgressBarComponent` |
| Tabs | `<z-tab-group>` + `<z-tab>` | Tab imports |
| Accordion | `<z-accordion>` + `<z-accordion-item>` | Accordion imports |
| Divider | `<z-divider>` | `ZardDividerComponent` |
| Breadcrumb | `<z-breadcrumb>` | Breadcrumb imports |
| KBD key display | `<z-kbd>` | `ZardKbdComponent` |
| Dark mode | `inject(ZardDarkMode)` | `ZardDarkMode` |
| Resizable panels | `<z-resizable>` | Resizable imports |

---

## Icon Usage — MANDATORY REGISTRATION CHECK

Icons are strictly typed from `ZARD_ICONS` in `libs/ui/src/lib/zard/components/icon/icons.ts`.

**Before using any icon, check it is registered:**

```html
<i z-icon zType="check"></i>
<i z-icon zType="trash" zSize="sm"></i>
<i z-icon zType="settings" zSize="lg"></i>
<i z-icon zType="shield" zSize="xl"></i>
```

**Sizes:** `'sm' | 'default' | 'lg' | 'xl'` — no numbers, no `'md'`

**If the icon key is NOT in ZARD_ICONS, register it first:**
```typescript
// In libs/ui/src/lib/zard/components/icon/icons.ts
import { RefreshCw } from 'lucide-angular';
export const ZARD_ICONS = {
  // ...existing...
  'refresh-cw': RefreshCw,
} as const satisfies Record<string, LucideIconData>;
```

**Currently registered icons (all available keys):**
```
activity, archive, arrow-left, arrow-right, arrow-up, arrow-up-right,
badge-check, ban, bell, bold, book-open, book-open-text,
calendar, calendar-plus, check, chevron-down, chevron-left, chevron-right,
chevrons-up-down, chevron-up, circle, circle-alert, circle-check,
circle-dollar-sign, circle-small, circle-x, clipboard, clock, cloud,
cloud-off, cloud-upload, code, code-xml, copy, credit-card,
dark-mode, dollar-sign, ellipsis, external-link, eye,
file, file-text, folder, folder-code, folder-open, folder-plus, folder-tree,
heart, house, inbox, info, italic, key, layers, layers-2, layout-dashboard,
lightbulb, lightbulb-off, list, list-checks, list-filter-plus,
loader-circle, log-out, mail, mic, minus, monitor, moon, move-right, music,
palette, pause, pencil, play, plus, plus-circle, popcorn, puzzle,
refresh-cw, save, search, settings, shield, smartphone, sparkles,
square, square-library, square-user, star, sun, sun-moon,
tablet, tag, terminal, text-align-center, text-align-end, text-align-start,
trash, triangle-alert, underline, user, user-plus, users, x, zap
```

**Common icon name corrections:**
- ❌ `more-vertical` → ✅ `ellipsis`
- ❌ `pencil` (no edit) → ✅ `file-text`
- ❌ `user-x` → ✅ `ban`
- ❌ `trash-2` → ✅ `trash`
- ❌ `check-circle` → ✅ `circle-check`

---

## Button Variants

```html
<button z-button zType="default">Primary</button>       <!-- blue -->
<button z-button zType="destructive">Delete</button>    <!-- red -->
<button z-button zType="outline">Secondary</button>
<button z-button zType="secondary">Gray</button>
<button z-button zType="ghost">Ghost</button>
<button z-button zType="link">Link</button>
<button z-button zSize="sm">Small</button>
<button z-button zSize="lg">Large</button>
<button z-button [zFull]="true">Full Width</button>
<button z-button [zLoading]="isLoading()">Save</button>
<button z-button zShape="circle"><i z-icon zType="plus"></i></button>
<a z-button zType="outline" [routerLink]="'/path'">Navigate</a>
```

**NO** `zType="primary"` — use `"default"`. **NO** `zSize="md"` — use `"default"`.

---

## Forms — Standard Pattern

```typescript
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ZardFormImports, ZardInputDirective, ZardSelectComponent, ZardSelectItemComponent } from '@ihsan/ui';

export class MyComponent {
  private _fb = inject(FormBuilder);
  readonly form = this._fb.group({
    name: [''],
    status: ['all'],
  });
  constructor() {
    this.form.get('status')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadData());
  }
}
```

```html
<z-form-field>
  <label z-form-label for="name">{{ 'field.name' | translate }}</label>
  <input z-input zId="name" formControlName="name" />
  <span z-form-error *ngIf="form.get('name')?.hasError('required')">Required</span>
</z-form-field>
```

**Never use `[(ngModel)]`** on any Zard form control. Always use reactive forms with `formControlName` or `[formControl]`.

---

## Select — Critical Rules

```html
<!-- Static items — always use zValue, never value -->
<z-select formControlName="status" zPlaceholder="Select...">
  <z-select-item zValue="all">{{ 'common.all' | translate }}</z-select-item>
  <z-select-item zValue="active">Active</z-select-item>
</z-select>

<!-- Dynamic items — MUST wrap with @if when data loads async -->
@if (rolesLoaded()) {
  <z-select formControlName="role">
    <z-select-item zValue="all">All Roles</z-select-item>
    @for (role of roles(); track role.id) {
      <z-select-item [zValue]="role.id">{{ role.name }}</z-select-item>
    }
  </z-select>
}
```

**Race condition prevention:** Never use `(zValueChange)` event to read form values — the form control hasn't updated yet. Use `valueChanges` observable with `takeUntilDestroyed()` instead.

**"All" sentinel pattern:** Never use `""` for the "all" option. Use `"all"` sentinel and map to `undefined` before API calls:
```typescript
const status = this.form.get('status')?.value;
const params = { status: status !== 'all' ? status : undefined };
```

---

## Dialog Service

```typescript
private _dialogService = inject(ZardDialogService);

openDialog(): void {
  this._dialogService.create({
    zContent: MyDialogComponent,
    zData: { id: this.selectedId() },
    zTitle: 'Edit Item',
    zHideFooter: true,         // manage footer inside component
    zWidth: '600px',
  });
}
```

Inside the dialog component:
```typescript
export class MyDialogComponent {
  private _ref = inject(ZardDialogRef);
  readonly data = inject<{ id: string }>(Z_MODAL_DATA);

  save(): void {
    // HTTP call must include SKIP_ERROR_TOAST context
    this._http.post('/api/items', payload,
      { context: new HttpContext().set(SKIP_ERROR_TOAST, true) }
    ).subscribe({
      next: () => {
        toast.success('Saved!');
        this._ref.close();
      },
      error: (err) => this.errorMessage.set(extractErrorMessage(err)),
    });
  }
}
```

**No `ref.closed` observable** — it doesn't exist. Use `zOnOk`/`zOnCancel` callbacks or an event service.

---

## Sheet Service

```typescript
private _sheetService = inject(ZardSheetService);

openSheet(): void {
  this._sheetService.create({
    zContent: MySheetComponent,
    zData: { filters: this.currentFilters() },
    zSide: 'right',            // 'left' | 'right' | 'top' | 'bottom'
    zWidth: '450px',
    zTitle: 'Filters',
    zHideFooter: true,
  });
}

// Inside sheet component:
readonly data = inject<{ filters: Filter[] }>(Z_SHEET_DATA);
```

**NO** `zPosition` (use `zSide`). **NO** `zSize` (use `zWidth`/`zHeight`). Default side is `'left'`.

---

## Alert Dialog (Destructive Confirmation)

```typescript
private _alertDialog = inject(ZardAlertDialogService);

onDelete(id: string): void {
  this._alertDialog.confirm({
    zTitle: 'Delete Item',
    zDescription: 'This cannot be undone.',
    zOkText: 'Delete',           // NOT zConfirmText
    zCancelText: 'Cancel',
    zOkDestructive: true,        // makes OK button red
  });
}
```

---

## Dropdown Menu

```html
<button z-button zType="outline" z-dropdown [zDropdownMenu]="menu">
  <i z-icon zType="ellipsis"></i>
</button>
<z-dropdown-menu-content #menu="zDropdownMenuContent">
  <z-dropdown-menu-item (click)="onEdit()">
    <i z-icon zType="file-text"></i>
    Edit
  </z-dropdown-menu-item>
  <z-dropdown-menu-item (click)="onDelete()" class="delete-action">
    <i z-icon zType="trash"></i>
    Delete
  </z-dropdown-menu-item>
</z-dropdown-menu-content>
```

**No `<z-dropdown-menu>` wrapper component** — it doesn't exist. **No `z-dropdown-menu-divider`** — doesn't exist.
Must have: `z-dropdown` directive + `[zDropdownMenu]="ref"` binding + `#ref="zDropdownMenuContent"` template reference.

---

## Table Pattern

```html
<table z-table zType="default">
  <thead z-table-header>
    <tr z-table-row>
      <th z-table-head>{{ 'user.name' | translate }}</th>
      <th z-table-head>{{ 'user.status' | translate }}</th>
      <th z-table-head></th>
    </tr>
  </thead>
  <tbody z-table-body>
    @for (item of items(); track item.id) {
      <tr z-table-row>
        <td z-table-cell>{{ item.name }}</td>
        <td z-table-cell>
          <z-badge [zType]="item.active ? 'default' : 'destructive'">
            {{ (item.active ? 'common.active' : 'common.inactive') | translate }}
          </z-badge>
        </td>
        <td z-table-cell>
          <!-- actions dropdown here -->
        </td>
      </tr>
    }
  </tbody>
</table>
```

---

## Pagination

```html
<z-pagination [zTotal]="totalPages()" [(zPageIndex)]="currentPage" />
```

**NO** `zCurrent` or `(zPageChange)` — use `zPageIndex` with two-way binding.

---

## Loading / Empty / Error States

```html
@if (isLoading()) {
  <z-skeleton />                              <!-- page-level loading -->
  <!-- or for action buttons: -->
  <z-loader zSize="sm" />
} @else if (items().length === 0) {
  <z-empty
    zIcon="inbox"
    zTitle="{{ 'common.noData' | translate }}"
    zDescription="{{ 'common.noDataDesc' | translate }}"
  />
} @else {
  <!-- actual content -->
}
```

**For inline errors in dialogs/sheets:**
```html
@if (errorMessage()) {
  <z-alert zType="destructive" [zTitle]="errorMessage()!" />
}
```

**For async action results:** `toast.success()` / `toast.error()` from `ngx-sonner`.

---

## Feedback Rules

| Situation | Correct | Never use |
|---|---|---|
| Save / delete / submit result | `toast.success()` | `z-alert` for transient results |
| Destructive action confirmation | `ZardAlertDialogService.confirm()` | `window.confirm()` |
| Persistent page-level warning | `<z-alert>` | `<z-toast>` for persistent messages |
| Dialog/sheet error | inline `<z-alert zType="destructive">` | global toast (use SKIP_ERROR_TOAST) |

---

## Segmented Component

```html
<z-segmented [zDefaultValue]="mode()" (zChange)="onModeChange($event)">
  <z-segmented-item value="email" label="Email">
    <i z-icon zType="mail"></i>
    Email
  </z-segmented-item>
  <z-segmented-item value="phone" label="Phone">
    <i z-icon zType="smartphone"></i>
    Phone
  </z-segmented-item>
</z-segmented>
```

**NO** `[value]` binding — use `[zDefaultValue]`. **NO** `(valueChange)` — use `(zChange)`. `z-segmented-item` requires BOTH `value` and `label` inputs.

---

## Badge & Avatar

```html
<!-- Badge — no zSize property exists -->
<z-badge zType="default">Active</z-badge>
<z-badge zType="destructive">Error</z-badge>
<z-badge zType="secondary" zShape="pill">Beta</z-badge>

<!-- Avatar -->
<z-avatar zSize="lg" zShape="circle" [zSrc]="user.imageUrl" [zFallback]="initials()" zStatus="online" />
```

**Badge types:** `'default' | 'secondary' | 'destructive' | 'outline'` — NO `'success'`, `'warning'`, `'primary'`.

---

## CSS / Styling Rules

- **Logical CSS properties only** — `margin-inline-start` not `margin-left`, `padding-inline-end` not `padding-right`
- **Never hardcode colors** — use CSS variables (`var(--color-destructive)`)
- **Never style Zard internals directly** — use the `zType`/`zSize` variants
- **Tailwind stays in `.css` files** — never mix `@apply` into SCSS
- **Style `:host` directly** — no unnecessary wrapper divs

---

## RTL Support

RTL is automatic via CSS logical properties. Dialogs and sheets inherit direction. Sheet `zSide` flips automatically for RTL. Never manually flip styles based on LTR/RTL — use `RtlService.getSheetSide()` only when the side must be dynamic.

---

## Import Templates

```typescript
// Minimum imports for a typical list page
import {
  ZardButtonComponent,
  ZardIconComponent,
  ZardCardComponent,
  ZardInputDirective,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardFormImports,
  ZardDropdownImports,
  ZardPaginationImports,
  ZardBadgeComponent,
  ZardAvatarComponent,
  ZardLoaderComponent,
  ZardSkeletonComponent,
  ZardEmptyComponent,
  ZardAlertComponent,
  ZardDialogService,
  ZardAlertDialogService,
} from '@ihsan/ui';
```

---

## Full API Reference

For complete property lists, variant values, and verified examples, read:
`Doc/ZARDUI_AI_REFERENCE.md` — this is the ground truth for every component API.

For import paths and selectors only:
`libs/ui/src/lib/zard/zard-quick-ref.md`

For dialog/sheet patterns:
`Doc/DIALOG_DESIGN_GUIDE.md`
