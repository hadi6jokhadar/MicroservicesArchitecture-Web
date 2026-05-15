# Microservices Web Architecture Rules

## 📖 Documentation — ALWAYS READ FIRST

> **Before writing any code, confirm you have read all files below. State this explicitly.**

| #   | File                                                 | Purpose                                                                   |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | `.github/instructions/Angular.instructions.md`       | Angular workflow & mandatory rules                                        |
| 2   | `.github/instructions/Terminal.instructions.md`      | Terminal command rules                                                    |
| 3   | `.github/instructions/Zardui-Strict.instructions.md` | Zardui component usage rules                                              |
| 4   | `Doc/ZARDUI_AI_REFERENCE.md`                         | Complete Zardui component reference **(MANDATORY before any z-\* usage)** |
| 5   | `Doc/TRANSLATION_SYSTEM_GUIDE.md`                    | Translation system usage and RTL support **(CRITICAL)**                   |
| 6   | `Doc/DIALOG_DESIGN_GUIDE.md`                         | Dialog component patterns and best practices                              |

---

## 🚨 Critical Errors to Avoid

### 1. PowerShell

- **Quotes**: Always use quotes for paths with spaces: `cd "C:\Path With Spaces"`
- **Chaining**: Use `;` not `&&` to chain commands.

### 2. Project Paths

- All paths in `project.json` must be relative to the **workspace root**, even if the file is inside the app folder.

### 3. Zardui Component Verification (MANDATORY)

Before using ANY `z-*` selector in a template:

- Verify the selector exists in `Doc/ZARDUI_AI_REFERENCE.md`
- Verify every input used is documented in that file
- If a component is not in the reference — do NOT use it, ask first
- Never invent props, variants, or selectors that are not in the reference

---

## 🎯 Core Principle: MINIMAL CODE

Write the **minimum** amount of code necessary. No over-engineering, no unnecessary abstractions.

**This is a LIGHTWEIGHT project:**

- ✅ NO testing infrastructure (Jest, Playwright, e2e)
- ✅ Minimal dependencies
- ✅ Clean, simple structure

---

## 📁 Component Organization (MANDATORY)

Colocate all files related to a component in the same folder:

```
user/
├── user.component.ts
├── user.component.html
├── user.component.scss
├── user.service.ts
├── user.model.ts
```

- **Exception**: Shared services, models, and utilities used by multiple components go in `libs/core` or `libs/shared`.

---

## 📝 Naming Conventions

- **Private variables**: `_variableName`
- **Public variables**: `variableName`
- **Observables**: `variable$`
- **Signals**: `variableName`

### Entities (Models)

- **Mandatory**: Create both `Interface` and `Class` for each entity.
- **Naming**: All classes should end with `Class` (e.g., `UserClass`).

```typescript
export interface IUser {
  id: string;
}

export class UserClass implements IUser {
  id: string;
  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || '';
  }
}
```

---

## 🎨 Component Patterns

### Signals (MANDATORY)

- **Inputs**: `userId = input.required<string>();`
- **Outputs**: `userClicked = output<User>();`
- ❌ **NEVER** use `@Input()` or `@Output()`.

### Dependency Injection

- Use `inject()` function: `private _http = inject(HttpClient);`

### Reactive Forms (MANDATORY)

- **Typed Forms Only**: `userForm: FormGroup<IUserForm>`
- **No Template-driven**: ❌ **NEVER** use `[(ngModel)]` or template-driven forms.

```typescript
interface IUserForm {
  name: FormControl<string>;
}

userForm = this._fb.group<IUserForm>({
  name: new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  }),
});
```

---

## 🧩 UI Components (MANDATORY)

### Zardui First Policy

- **ALWAYS check Zardui first**: Before creating ANY UI element, verify if Zardui provides it.
- **Zero custom UI**: Do NOT create custom buttons, inputs, dialogs, dropdowns, menus, cards, badges, alerts, or any generic UI element.
- **Import path**: Always import from `@ihsan/ui` — never from `@ngzard/ui` or `@zardui/angular`.
- **Install as needed**: Run `install-zardui-components.bat` for new components.
- **Design system**: Use Zardui's variants and styling system exclusively.

### Available Zardui Components (All Installed)

Accordion, Alert, Alert Dialog, Avatar, Badge, Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Checkbox, Combobox, Command, Date Picker, Dialog, Divider, Dropdown, Empty, Form, Icon, Input, Input Group, Kbd, Layout, Loader, Menu, Pagination, Popover, Progress Bar, Radio, Resizable, Segmented, Select, Sheet, Skeleton, Slider, Switch, Table, Tabs, Toast, Toggle, Toggle Group, Tooltip.

### When to Create Custom Components

- ✅ Business-specific layouts (user-profile-card, dashboard-widget)
- ✅ Composite components combining multiple Zardui components
- ✅ Domain-specific visualizations (charts, maps, custom data displays)
- ❌ Generic UI elements — Zardui has them all

---

## 🖥️ Page Generation Rules (MANDATORY)

### Step-by-step process for every new page

Follow this order before writing a single line of template:

1. Read `Doc/ZARDUI_AI_REFERENCE.md` — confirm every component you plan to use exists
2. Define the page layout zones: header / sidebar / content / footer
3. Choose Zardui structural components first, then fill with content components
4. Map every form field to its correct Zardui component (see table below)
5. Wire all forms with typed `FormGroup` — never `ngModel`
6. Add feedback components last (toast placement, alert positioning, dialog triggers)
7. Verify responsiveness: Desktop → Tablet → Mobile

### Layout Zone Rules

| Zone               | Use this                                | Never use                          |
| ------------------ | --------------------------------------- | ---------------------------------- |
| Page shell         | `z-layout` or CSS grid on `:host`       | Wrapper `<div>` elements           |
| Section containers | `z-card`                                | Custom `<div class="card">`        |
| Navigation         | `z-menu`, `z-breadcrumb`, `z-tabs`      | Custom `<nav>` HTML                |
| Page title area    | `z-card` header slot or semantic `<h1>` | Custom header divs                 |
| Empty states       | `z-empty`                               | Custom empty-state HTML            |
| Loading states     | `z-skeleton`, `z-loader`                | Custom spinners or `*ngIf` flicker |
| Dividing sections  | `z-divider`                             | `<hr>` or border tricks            |

### Form Field → Zardui Component Mapping (MANDATORY)

| Field type                  | Zardui component                         | Notes                                        |
| --------------------------- | ---------------------------------------- | -------------------------------------------- |
| Text / email / password     | `z-input`                                | Always inside `z-form`                       |
| Long text                   | `z-input` with `zType="textarea"`        |                                              |
| Single select (short list)  | `z-select` with `z-select-item` children |                                              |
| Searchable / long list      | `z-combobox` or `z-command`              |                                              |
| Date selection              | `z-date-picker`                          | Use `z-calendar` only for standalone display |
| Boolean on/off (settings)   | `z-switch`                               | For settings-style toggles                   |
| Boolean pressable (toolbar) | `z-toggle`                               | For toolbar-style actions                    |
| Multiple choice             | `z-checkbox` group                       |                                              |
| Single choice from set      | `z-radio` group                          |                                              |
| Range / numeric             | `z-slider`                               |                                              |
| Segmented choice            | `z-segmented`                            | For compact mutually-exclusive options       |
| File upload                 | `z-input` with `zType="file"`            |                                              |
| Number stepper              | `z-input` with `zType="number"`          |                                              |

### Feedback Pattern Rules — When to Use Which

| Situation                                       | Correct component                               | Never use          |
| ----------------------------------------------- | ----------------------------------------------- | ------------------ |
| Async action result (save, delete, submit)      | `toast` via `ngx-sonner` + `z-toaster` in shell | `z-alert`          |
| Destructive action confirmation (delete, reset) | `ZardAlertDialogService.confirm()`              | `window.confirm()` |
| Persistent inline page-level message            | `z-alert` at top of content area                | `z-toast`          |
| Form field validation error                     | `z-form` error slot                             | `z-alert`          |
| Critical warning visible on page load           | `z-alert`                                       | `z-toast`          |
| Contextual info on hover (short text)           | `z-tooltip`                                     | `z-popover`        |
| Rich contextual content on click                | `z-popover`                                     | `z-tooltip`        |
| Full workflow / multi-step / large form         | `z-dialog` or `z-sheet`                         | `z-alert-dialog`   |
| Quick info panel from edge                      | `z-sheet`                                       | `z-dialog`         |

### Page Template Output Rules (MANDATORY)

Every generated page template MUST satisfy all of the following:

- ✅ Every `z-*` selector verified against `Doc/ZARDUI_AI_REFERENCE.md` before use
- ✅ All form fields inside `z-form` with `formControlName` (typed `FormGroup`)
- ✅ `z-skeleton` used for loading states, not spinners or `*ngIf` flicker
- ✅ `z-empty` used for empty list / table states
- ✅ `z-toaster` placed once in the app shell only — never per-page
- ✅ Every interactive element has a unique `id` attribute
- ✅ Responsive layout: Desktop → Tablet → Mobile via CSS media queries
- ✅ Logical CSS properties in all custom styles (`margin-inline` not `margin-left`)
- ✅ RTL-safe: verify with `Doc/TRANSLATION_SYSTEM_GUIDE.md`
- ❌ Never hardcode colors — CSS variables only
- ❌ Never use `[(ngModel)]` on any form field
- ❌ Never create custom button, input, badge, card, or dialog HTML
- ❌ Never invent a `z-*` input that is not in `Doc/ZARDUI_AI_REFERENCE.md`

### Common Page Composition Patterns

**List / CRUD page:**

```html
<!-- Page header -->
<div class="page-header">
  <h1>Users</h1>
  <z-badge>{{ total }}</z-badge>
  <button z-button (click)="openCreate()">Add User</button>
</div>

<!-- Toolbar -->
<z-card>
  <z-input zPlaceholder="Search..." formControlName="search" />
  <z-select formControlName="status">
    <z-select-item zValue="active">Active</z-select-item>
    <z-select-item zValue="inactive">Inactive</z-select-item>
  </z-select>
</z-card>

<!-- Data table -->
<z-table [zData]="users()">...</z-table>

<!-- Empty state -->
@if (users().length === 0) {
<z-empty zTitle="No users found" />
}

<!-- Delete confirmation (triggered from row action) -->
<!-- Use ZardAlertDialogService.confirm() from TypeScript -->

<!-- Feedback -->
<!-- z-toaster is in app shell, call toast.success() from TypeScript -->
```

**Settings / Form page:**

```html
<z-card zTitle="Profile Settings">
  <z-form [formGroup]="settingsForm">
    <z-form-item zLabel="Full Name" formControlName="name">
      <z-input formControlName="name" />
    </z-form-item>
    <z-form-item zLabel="Role" formControlName="role">
      <z-select formControlName="role">
        <z-select-item zValue="admin">Admin</z-select-item>
        <z-select-item zValue="user">User</z-select-item>
      </z-select>
    </z-form-item>
    <z-form-item zLabel="Notifications">
      <z-switch formControlName="notifications" />
    </z-form-item>
  </z-form>
  <div card-footer>
    <button z-button zType="outline" (click)="cancel()">Cancel</button>
    <button z-button (click)="save()">Save Changes</button>
  </div>
</z-card>
```

**Detail / Profile page:**

```html
<z-card>
  <z-avatar [zSrc]="user.avatar" [zFallback]="user.initials" zSize="lg" />
  <z-badge [zType]="user.status === 'active' ? 'success' : 'secondary'">
    {{ user.status }}
  </z-badge>
  <z-divider />
  <z-tab-group>
    <z-tab label="Overview">...</z-tab>
    <z-tab label="Activity">...</z-tab>
    <z-tab label="Settings">...</z-tab>
  </z-tab-group>
</z-card>
```

---

## 🎨 Styling Standards

### Core Principles

- **CSS Variables**: Use for ALL colors and theme values — no hardcoded hex or rgb values.
- **Nesting**: **ALWAYS** nest styles starting from `:host`.
- **No Wrappers**: Style the host element directly — never add wrapper divs just for styling.
- **Logical Properties**: Use logical properties for all directional CSS (RTL/LTR safe).
- **Responsive Design (MANDATORY)**: Every page MUST handle Desktop, Tablet, and Mobile. Use CSS media queries.

```scss
:host {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}
```

### CSS Logical Properties (MANDATORY)

Use logical properties instead of physical directions for RTL/LTR support:

| ❌ Physical (avoid)  | ✅ Logical (use)        |
| -------------------- | ----------------------- |
| `margin-left`        | `margin-inline-start`   |
| `margin-right`       | `margin-inline-end`     |
| `padding-left/right` | `padding-inline`        |
| `border-left`        | `border-inline-start`   |
| `left: 0`            | `inset-inline-start: 0` |
| `text-align: left`   | `text-align: start`     |

### ⚠️ SCSS + Tailwind CSS Warning

**USE AT YOUR OWN RISK — UNSUPPORTED PATTERNS**

If you MUST use SCSS alongside Tailwind CSS:

**Approach A: Parallel and Isolated (Recommended)**

- Keep Tailwind CSS and SCSS completely separate
- ❌ **NEVER** use `@apply` in SCSS files
- Keep Tailwind in pure `.css` files, SCSS in separate `.scss` files
- Load both in `angular.json` (Tailwind first)
- Use CSS variables to share design tokens

**Approach B: Double-Pass Pipeline**

- Compile SCSS to CSS first, then import into Tailwind
- Install `sass` and `npm-run-all`, create parallel watchers
- ❌ **NEVER** import Tailwind in SCSS files
- ⚠️ Watch mode is unreliable — SCSS changes may not trigger Tailwind rebuild

### Styling Anti-patterns

❌ **AVOID:**

- Mixing Sass functions with `theme()` or `@screen`
- Importing Tailwind directives (`@tailwind`, `@layer`) in SCSS
- Deep nesting with `@apply` in SCSS
- Heavy reliance on `@apply`
- Creating custom styles for UI that Zardui already provides
- Hardcoded colors — always use CSS variables

---

## 🏗️ Project Structure

```
apps/
  admin/src/app/
    features/       # Lazy loaded feature modules
    layout/         # Layout components
libs/
  core/             # Core services, guards, models
  shared/           # Shared components, pipes, utils
Doc/
  ZARDUI_AI_REFERENCE.md        # Component reference (read before any z-* usage)
  TRANSLATION_SYSTEM_GUIDE.md   # RTL & i18n rules
  DIALOG_DESIGN_GUIDE.md        # Dialog patterns
```

---

## ✅ Best Practices Checklist

Before marking any task complete, verify:

1. **Minimal Code**: No unused imports, no dead code, no over-abstraction
2. **Zardui First**: Every UI element uses a `z-*` component if one exists
3. **Reference Verified**: Every `z-*` selector checked against `Doc/ZARDUI_AI_REFERENCE.md`
4. **Reactive Forms**: Typed `FormGroup` used — no `ngModel` anywhere
5. **Signals**: `input()` and `output()` used exclusively — no `@Input()`/`@Output()`
6. **OnPush**: Change detection set to `OnPush` on every component
7. **Entities**: Interface + Class pattern used for every model
8. **Responsive**: Desktop, Tablet, and Mobile layouts handled
9. **Logical CSS**: All custom styles use logical properties
10. **Unique IDs**: Every interactive element has a unique `id` attribute
11. **No Test Files**: No `.spec.ts`, `jest.config.ts`, or e2e files created
12. **Feedback Pattern**: Correct component used for each feedback scenario
13. **RTL Safe**: Translation guide consulted for any text or layout direction

---

## ❌ Anti-Patterns

| Anti-pattern                         | Why                      | Correct approach                                  |
| ------------------------------------ | ------------------------ | ------------------------------------------------- |
| Custom buttons / inputs / cards      | Zardui has them          | Use `z-button`, `z-input`, `z-card`               |
| `@Input()` / `@Output()` decorators  | Legacy pattern           | Use `input()` / `output()` signals                |
| `[(ngModel)]` on forms               | Template-driven          | Typed `FormGroup` with `formControlName`          |
| `window.confirm()` for confirmations | Not accessible           | `ZardAlertDialogService.confirm()`                |
| `z-toast` for persistent messages    | Wrong semantic           | `z-alert` for persistent, `z-toast` for transient |
| `z-alert-dialog` for large workflows | Wrong component          | `z-dialog` or `z-sheet`                           |
| `z-tooltip` for rich content         | Wrong component          | `z-popover` for rich, `z-tooltip` for short text  |
| `z-calendar` for date input          | Standalone only          | `z-date-picker` for form input                    |
| Hardcoded colors                     | Not themeable            | CSS variables only                                |
| Physical CSS properties              | Not RTL-safe             | Logical properties (`margin-inline-start`)        |
| `@apply` in SCSS                     | Breaks Tailwind pipeline | Keep Tailwind in `.css` files                     |
| Wrapper `<div>` for styling          | Unnecessary DOM          | Style `:host` directly                            |
| `any` type                           | Unsafe                   | Explicit TypeScript types                         |
| NgModules                            | Legacy pattern           | Standalone components only                        |
| Deep nested folder structures        | Hard to navigate         | Flat colocated structure                          |
| `.spec.ts` / test files              | No test infra            | Skip entirely                                     |
| Inventing `z-*` inputs               | Will break               | Verify in `Doc/ZARDUI_AI_REFERENCE.md`            |

---

## 🤖 Auto-Maintenance Rules

After completing ANY task, self-check and update instruction files if the codebase changed:

| Change Made                                                        | Section to Update                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| New/deleted/renamed `Doc/*.md`                                     | This file → "Documentation" reading list                    |
| New Zardui component installed via `install-zardui-components.bat` | This file → "Available Zardui Components" list              |
| New lib added to `libs/`                                           | This file → "Project Structure" tree                        |
| New page/feature pattern discovered                                | This file → "Common Page Composition Patterns"              |
| New feedback scenario identified                                   | This file → "Feedback Pattern Rules" table                  |
| New prompt created in `.github/prompts/`                           | This file → "Documentation" reading list if core workflow   |
| New Angular doc created in `Doc/`                                  | Root `copilot-instructions.md` → "Key File Locations" table |

**Do updates inline** — no separate task, update as part of completing the original request.
