# Zard UI — Components Context Reference

> Auto-generated reference for all 43 Zard UI components.
> Angular 21 · Signals · CVA · Tailwind CSS 4 · `z-*` selectors
>
> **Binding notation:** `[input]` = one-way, `[(input)]` = two-way (model signal)

---

## accordion

**Selector:** `<z-accordion>`
**Category:** Layout / Disclosure
**Forms compatible:** No
**Purpose:** Vertically stacked collapsible sections supporting single or multiple open items.

### Inputs

| Input           | Binding           | Type                     | Default     | Description                                          |
| --------------- | ----------------- | ------------------------ | ----------- | ---------------------------------------------------- |
| `zType`         | `[zType]`         | `'single' \| 'multiple'` | `'single'`  | Whether one or many items can be open simultaneously |
| `zCollapsible`  | `[zCollapsible]`  | `boolean`                | `false`     | Allow collapsing the last open item                  |
| `zDefaultValue` | `[zDefaultValue]` | `string \| string[]`     | `undefined` | Initially open item(s)                               |
| `class`         | `[class]`         | `ClassValue`             | `''`        | Extra CSS classes                                    |

### Outputs

None.

### Variants & Visual States

| State       | Visual Effect                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| Open item   | Chevron rotates 180°; content area animates from `grid-rows-[0fr]` → `grid-rows-[1fr]` (CSS grid row collapse) |
| Closed item | Content is hidden via `overflow-hidden`                                                                        |

### Content Projection

Projects `<z-accordion-item>` children.

### Public Methods

| Method                      | Description                              |
| --------------------------- | ---------------------------------------- |
| `toggleItem(value: string)` | Programmatically toggle an item by value |

### Internal Sub-components

| Component                    | Selector           | Purpose                                  |
| ---------------------------- | ------------------ | ---------------------------------------- |
| `ZardAccordionItemComponent` | `z-accordion-item` | ⚠️ internal — individual accordion panel |

**`z-accordion-item` Inputs:** `zTitle` (string), `zValue` (string), `class`

### Usage Examples

**Minimal:**

```html
<z-accordion>
  <z-accordion-item zTitle="Section 1" zValue="item1">
    Content here
  </z-accordion-item>
</z-accordion>
```

**Full:**

```html
<z-accordion zType="multiple" [zCollapsible]="true" [zDefaultValue]="['item1']">
  <z-accordion-item zTitle="First" zValue="item1">Body one</z-accordion-item>
  <z-accordion-item zTitle="Second" zValue="item2">Body two</z-accordion-item>
</z-accordion>
```

### Visual Notes

- Each item has a bottom border separator.
- Content collapses/expands via CSS grid row animation (no `height` animation).

---

## alert

**Selector:** `<z-alert>`, `[z-alert]`
**Category:** Feedback
**Forms compatible:** No
**Purpose:** Displays an inline alert banner with optional icon, title, and description.

### Inputs

| Input          | Binding          | Type                                      | Default     | Description            |
| -------------- | ---------------- | ----------------------------------------- | ----------- | ---------------------- |
| `zTitle`       | `[zTitle]`       | `string \| TemplateRef`                   | `undefined` | Alert heading          |
| `zDescription` | `[zDescription]` | `string \| TemplateRef`                   | `undefined` | Body text              |
| `zIcon`        | `[zIcon]`        | `ZardIcon \| TemplateRef`                 | `undefined` | Icon shown at the left |
| `zType`        | `[zType]`        | `'default' \| 'destructive' \| 'success'` | `'default'` | Color theme            |
| `class`        | `[class]`        | `ClassValue`                              | `''`        | Extra CSS classes      |

### Outputs

None.

### Variants & Visual States

| Variant       | Visual Effect                                               |
| ------------- | ----------------------------------------------------------- |
| `default`     | `bg-card text-card-foreground`                              |
| `destructive` | `text-destructive bg-card` border becomes destructive color |
| `success`     | `bg-green-50 text-green-900 border-green-200`               |

### Content Projection

None — content provided via inputs.

### Usage Examples

```html
<z-alert
  zType="destructive"
  zTitle="Error"
  zDescription="Something went wrong."
  zIcon="circle-alert"
/>
```

---

## alert-dialog

**Selector:** Service-based — no element selector
**Category:** Overlay / Modal
**Forms compatible:** No
**Purpose:** Confirmation dialog overlay for critical actions (confirm, warning, info). Launched via `ZardAlertDialogService`.

### Service API

**Import:** `ZardAlertDialogService`

| Method             | Description          |
| ------------------ | -------------------- |
| `create(options)`  | Generic alert dialog |
| `confirm(options)` | Confirmation dialog  |
| `warning(options)` | Warning dialog       |
| `info(options)`    | Informational dialog |

Returns `ZardAlertDialogRef` with `close()` method.

### Options (`ZardAlertDialogOptions`)

| Option              | Type                            | Description                      |
| ------------------- | ------------------------------- | -------------------------------- |
| `zTitle`            | `string \| TemplateRef`         | Dialog heading                   |
| `zDescription`      | `string \| TemplateRef`         | Body text                        |
| `zContent`          | `string \| TemplateRef \| Type` | Custom content                   |
| `zOkText`           | `string`                        | Confirm button label             |
| `zCancelText`       | `string`                        | Cancel button label              |
| `zOkDestructive`    | `boolean`                       | Style OK button as destructive   |
| `zOkDisabled`       | `boolean`                       | Disable OK button                |
| `zClosable`         | `boolean`                       | Show X close button              |
| `zMaskClosable`     | `boolean`                       | Close on overlay click           |
| `zOnOk`             | `callback`                      | OK button callback               |
| `zOnCancel`         | `callback`                      | Cancel button callback           |
| `zWidth`            | `string`                        | Custom dialog width              |
| `zData`             | `any`                           | Data passed to component content |
| `zViewContainerRef` | `ViewContainerRef`              | Injection context                |
| `zCustomClasses`    | `string`                        | Extra CSS on dialog panel        |

### Usage Examples

```typescript
constructor(private alertDialog: ZardAlertDialogService) {}

this.alertDialog.confirm({
  zTitle: 'Delete item',
  zDescription: 'This action cannot be undone.',
  zOkDestructive: true,
  zOkText: 'Delete',
  zOnOk: () => this.delete(),
});
```

### Visual Notes

- Centered fixed overlay with scale+opacity enter/leave animation.
- Backdrop mask; `sm:max-w-lg` max width.
- Escape key closes by default.

---

## avatar

**Selector:** `<z-avatar>`, `[z-avatar]`
**Category:** Display
**Forms compatible:** No
**Purpose:** Displays a user avatar image with optional fallback text and online-status indicator.

### Inputs

| Input       | Binding       | Type                                                | Default     | Description                          |
| ----------- | ------------- | --------------------------------------------------- | ----------- | ------------------------------------ |
| `zSrc`      | `[zSrc]`      | `string`                                            | `''`        | Image URL                            |
| `zAlt`      | `[zAlt]`      | `string`                                            | `''`        | Image alt text                       |
| `zFallback` | `[zFallback]` | `string`                                            | `''`        | Initials/text shown when image fails |
| `zStatus`   | `[zStatus]`   | `'online' \| 'offline' \| 'doNotDisturb' \| 'away'` | `undefined` | Status indicator                     |
| `zSize`     | `[zSize]`     | `'sm' \| 'default' \| 'md' \| 'lg' \| 'xl'`         | `'default'` | Avatar dimensions                    |
| `zShape`    | `[zShape]`    | `'circle' \| 'rounded' \| 'square'`                 | `'circle'`  | Border radius                        |
| `class`     | `[class]`     | `ClassValue`                                        | `''`        | Extra CSS classes                    |

### Outputs

None.

### Variants & Visual States

| State          | Visual Effect                         |
| -------------- | ------------------------------------- |
| `online`       | Green circle indicator (bottom-right) |
| `offline`      | Red circle indicator                  |
| `doNotDisturb` | Red circle with dash                  |
| `away`         | Yellow moon icon                      |
| `circle`       | `rounded-full`                        |
| `rounded`      | `rounded-md`                          |
| `square`       | No border radius                      |

### Internal Sub-components

| Component                  | Selector         | Purpose                             |
| -------------------------- | ---------------- | ----------------------------------- |
| `ZardAvatarGroupComponent` | `z-avatar-group` | ✅ public — stacks multiple avatars |

**`z-avatar-group` Inputs:** `zOrientation` (`'horizontal' | 'vertical'`); horizontal adds `-space-x-3`, vertical adds `-space-y-3`; children get `ring-2 ring-background`.

### Usage Examples

```html
<z-avatar
  zSrc="/user.jpg"
  zAlt="John"
  zFallback="JD"
  zStatus="online"
  zSize="lg"
/>
```

```html
<z-avatar-group>
  <z-avatar zSrc="/a.jpg" zFallback="A" />
  <z-avatar zSrc="/b.jpg" zFallback="B" />
</z-avatar-group>
```

---

## badge

**Selector:** `<z-badge>`
**Category:** Display
**Forms compatible:** No
**Purpose:** Small status or label tag.

### Inputs

| Input    | Binding    | Type                                                     | Default     | Description       |
| -------- | ---------- | -------------------------------------------------------- | ----------- | ----------------- |
| `zType`  | `[zType]`  | `'default' \| 'secondary' \| 'destructive' \| 'outline'` | `'default'` | Color theme       |
| `zShape` | `[zShape]` | `'default' \| 'rounded-md' \| 'square' \| 'pill'`        | `'default'` | Border radius     |
| `class`  | `[class]`  | `ClassValue`                                             | `''`        | Extra CSS classes |

### Variants & Visual States

| Variant       | Visual Effect                                   |
| ------------- | ----------------------------------------------- |
| `default`     | `bg-primary text-primary-foreground`            |
| `secondary`   | `bg-secondary text-secondary-foreground`        |
| `destructive` | `bg-destructive text-white`                     |
| `outline`     | `border text-foreground` transparent background |

### Content Projection

Default slot for badge text.

### Usage Examples

```html
<z-badge zType="destructive">Error</z-badge>
<z-badge zType="secondary" zShape="pill">Beta</z-badge>
```

---

## breadcrumb

**Selector:** `<z-breadcrumb>`
**Category:** Navigation
**Forms compatible:** No
**Purpose:** Horizontal navigation trail showing the current page hierarchy.

### Inputs

_(Set on `z-breadcrumb-item`)_

| Input         | Binding         | Type                    | Default | Description                |
| ------------- | --------------- | ----------------------- | ------- | -------------------------- |
| `zValue`      | `[zValue]`      | `string \| TemplateRef` | —       | Label or content           |
| `routerLink`  | `[routerLink]`  | `any`                   | —       | Router link                |
| `queryParams` | `[queryParams]` | `object`                | —       | Query parameters           |
| `isLast`      | `[isLast]`      | `boolean`               | `false` | Hides separator after item |
| `isEllipsis`  | `[isEllipsis]`  | `boolean`               | `false` | Renders as `…`             |

### Internal Sub-components

| Component                         | Selector                | Purpose                                   |
| --------------------------------- | ----------------------- | ----------------------------------------- |
| `ZardBreadcrumbItemComponent`     | `z-breadcrumb-item`     | ⚠️ internal — individual breadcrumb entry |
| `ZardBreadcrumbEllipsisComponent` | `z-breadcrumb-ellipsis` | ⚠️ internal — ellipsis node               |

### Usage Examples

```html
<z-breadcrumb>
  <z-breadcrumb-item zValue="Home" [routerLink]="['/']" />
  <z-breadcrumb-item zValue="Users" [routerLink]="['/users']" />
  <z-breadcrumb-item zValue="Edit" [isLast]="true" />
</z-breadcrumb>
```

---

## button

**Selector:** `<z-button>`, `button[z-button]`, `a[z-button]`
**Category:** Action
**Forms compatible:** No
**Purpose:** Interactive button with multiple variants, sizes, shapes and built-in loading state.

### Inputs

| Input       | Binding       | Type                                                                          | Default     | Description                       |
| ----------- | ------------- | ----------------------------------------------------------------------------- | ----------- | --------------------------------- |
| `zType`     | `[zType]`     | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` | Color/style variant               |
| `zSize`     | `[zSize]`     | `'default' \| 'sm' \| 'lg'`                                                   | `'default'` | Button size                       |
| `zShape`    | `[zShape]`    | `'default' \| 'circle' \| 'square'`                                           | `'default'` | Border radius                     |
| `zFull`     | `[zFull]`     | `boolean`                                                                     | `false`     | Full width (`w-full`)             |
| `zLoading`  | `[zLoading]`  | `boolean`                                                                     | `false`     | Show spinner, disable interaction |
| `zDisabled` | `[zDisabled]` | `boolean`                                                                     | `false`     | Disabled state                    |
| `class`     | `[class]`     | `ClassValue`                                                                  | `''`        | Extra CSS classes                 |

### Outputs

None — use native `(click)`.

### Variants & Visual States

| State     | Visual Effect                                                   |
| --------- | --------------------------------------------------------------- |
| Loading   | Spinning `loader-circle` icon; `opacity-50 pointer-events-none` |
| Disabled  | `pointer-events-none opacity-50`                                |
| Icon-only | Auto-detected via MutationObserver; becomes square padding      |
| `link`    | Underline on hover, no background                               |
| `ghost`   | Transparent with hover background                               |

### Content Projection

Default slot for button label / icon.

### Usage Examples

```html
<button z-button zType="default">Click me</button>
<button z-button zType="destructive" [zLoading]="isLoading">Delete</button>
<a z-button zType="link" [routerLink]="['/home']">Go home</a>
```

---

## button-group

**Selector:** `<z-button-group>`
**Category:** Action
**Forms compatible:** No
**Purpose:** Groups multiple buttons visually by collapsing shared borders.

### Inputs

| Input          | Binding          | Type                         | Default        | Description       |
| -------------- | ---------------- | ---------------------------- | -------------- | ----------------- |
| `zOrientation` | `[zOrientation]` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction  |
| `class`        | `[class]`        | `ClassValue`                 | `''`           | Extra CSS classes |

### Internal Sub-components

| Component                         | Selector                 | Purpose                                               |
| --------------------------------- | ------------------------ | ----------------------------------------------------- |
| `ZardButtonGroupDividerComponent` | `z-button-group-divider` | ⚠️ internal — renders a `<z-divider>` between buttons |

### Visual Notes

- Horizontal: non-first children lose left border-radius and left border.
- Vertical: non-first children lose top border-radius and top border.
- Divider inherits parent orientation automatically.

### Usage Examples

```html
<z-button-group>
  <button z-button zType="outline">Left</button>
  <z-button-group-divider />
  <button z-button zType="outline">Right</button>
</z-button-group>
```

---

## calendar

**Selector:** `<z-calendar>`, `[z-calendar]`
**Category:** Forms / Date
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Interactive calendar for selecting single dates, multiple dates, or a date range.

### Inputs

| Input      | Binding        | Type                                | Default    | Description              |
| ---------- | -------------- | ----------------------------------- | ---------- | ------------------------ |
| `zMode`    | `[zMode]`      | `'single' \| 'multiple' \| 'range'` | `'single'` | Selection mode           |
| `value`    | `[(value)]`    | `Date \| Date[] \| null`            | `null`     | Selected date(s)         |
| `disabled` | `[(disabled)]` | `boolean`                           | `false`    | Disable the calendar     |
| `minDate`  | `[minDate]`    | `Date \| null`                      | `null`     | Earliest selectable date |
| `maxDate`  | `[maxDate]`    | `Date \| null`                      | `null`     | Latest selectable date   |
| `class`    | `[class]`      | `ClassValue`                        | `''`       | Extra CSS classes        |

### Outputs

| Output       | Emits                    | Description                       |
| ------------ | ------------------------ | --------------------------------- |
| `dateChange` | `Date \| Date[] \| null` | Fires when date selection changes |

### Public Methods

| Method              | Description                             |
| ------------------- | --------------------------------------- |
| `resetNavigation()` | Resets displayed month to current month |

### Variants & Visual States

| State                 | Visual Effect                        |
| --------------------- | ------------------------------------ |
| Selected day          | `bg-primary text-primary-foreground` |
| Today                 | `bg-accent`                          |
| Outside current month | `opacity-50`                         |
| Range start           | `rounded-r-none`                     |
| Range end             | `rounded-l-none`                     |
| In range              | `rounded-none bg-accent`             |
| Disabled day          | `opacity-50 cursor-not-allowed`      |

### Internal Sub-components

- `ZardCalendarGridComponent` ⚠️ internal
- `ZardCalendarNavigationComponent` ⚠️ internal

### Usage Examples

**Minimal:**

```html
<z-calendar [(value)]="selectedDate" />
```

**Full with range:**

```html
<z-calendar
  zMode="range"
  [(value)]="dateRange"
  [minDate]="today"
  (dateChange)="onDateChange($event)"
/>
```

**CVA with Angular Forms:**

```html
<z-calendar formControlName="birthday" zMode="single" />
```

---

## card

**Selector:** `<z-card>`
**Category:** Layout / Container
**Forms compatible:** No
**Purpose:** Contained surface element with optional header, body, footer, and action button.

### Inputs

| Input           | Binding           | Type                    | Default     | Description                    |
| --------------- | ----------------- | ----------------------- | ----------- | ------------------------------ |
| `zTitle`        | `[zTitle]`        | `string \| TemplateRef` | `undefined` | Card heading                   |
| `zDescription`  | `[zDescription]`  | `string \| TemplateRef` | `undefined` | Subtitle under heading         |
| `zAction`       | `[zAction]`       | `string`                | `undefined` | Label for header action button |
| `zFooterBorder` | `[zFooterBorder]` | `boolean`               | `false`     | Add top border to footer       |
| `zHeaderBorder` | `[zHeaderBorder]` | `boolean`               | `false`     | Add bottom border to header    |
| `class`         | `[class]`         | `ClassValue`            | `''`        | Extra CSS classes              |

### Outputs

| Output         | Emits  | Description                         |
| -------------- | ------ | ----------------------------------- |
| `zActionClick` | `void` | Fires when action button is clicked |

### Content Projection

| Slot            | Description                      |
| --------------- | -------------------------------- |
| Default         | Card body content                |
| `[card-footer]` | Footer content (hidden if empty) |

### Usage Examples

```html
<z-card
  zTitle="User Profile"
  zDescription="Edit your details"
  zAction="Save"
  (zActionClick)="save()"
>
  <form>...</form>
  <div card-footer>Footer info</div>
</z-card>
```

---

## checkbox

**Selector:** `<z-checkbox>`, `[z-checkbox]`
**Category:** Forms
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Styled checkbox input with check icon overlay.

### Inputs

| Input      | Binding      | Type                                | Default     | Description       |
| ---------- | ------------ | ----------------------------------- | ----------- | ----------------- |
| `zType`    | `[zType]`    | `'default' \| 'destructive'`        | `'default'` | Color theme       |
| `zSize`    | `[zSize]`    | `'default' \| 'lg'`                 | `'default'` | Size              |
| `zShape`   | `[zShape]`   | `'default' \| 'circle' \| 'square'` | `'default'` | Border radius     |
| `disabled` | `[disabled]` | `boolean`                           | `false`     | Disabled state    |
| `class`    | `[class]`    | `ClassValue`                        | `''`        | Extra CSS classes |

### Outputs

| Output        | Emits     | Description                      |
| ------------- | --------- | -------------------------------- |
| `checkChange` | `boolean` | Fires when checked state changes |

### Visual Notes

- Renders a native `<input type="checkbox">` hidden visually, with a `<z-icon zType="check">` overlay.
- Check icon transitions opacity `0 → 1` on checked.

### Usage Examples

```html
<z-checkbox [(ngModel)]="isChecked" (checkChange)="onCheck($event)"
  >Accept terms</z-checkbox
>
<z-checkbox formControlName="agree" zType="destructive" />
```

---

## combobox

**Selector:** `<z-combobox>`
**Category:** Forms / Select
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Searchable dropdown selector with options or grouped options.

### Inputs

| Input               | Binding               | Type                                          | Default       | Description                |
| ------------------- | --------------------- | --------------------------------------------- | ------------- | -------------------------- |
| `options`           | `[options]`           | `ZardComboboxOption[]`                        | `[]`          | Flat list of options       |
| `groups`            | `[groups]`            | `ZardComboboxGroup[]`                         | `[]`          | Grouped options            |
| `value`             | `[value]`             | `string \| null`                              | `null`        | Selected value             |
| `placeholder`       | `[placeholder]`       | `string`                                      | `'Select...'` | Trigger placeholder text   |
| `searchPlaceholder` | `[searchPlaceholder]` | `string`                                      | `'Search...'` | Search input placeholder   |
| `emptyText`         | `[emptyText]`         | `string`                                      | —             | Text shown when no results |
| `disabled`          | `[disabled]`          | `boolean`                                     | `false`       | Disabled state             |
| `searchable`        | `[searchable]`        | `boolean`                                     | `true`        | Show search input          |
| `zWidth`            | `[zWidth]`            | `'default' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'default'`   | Trigger width              |
| `ariaLabel`         | `[ariaLabel]`         | `string`                                      | —             | Accessibility label        |

### Outputs

| Output           | Emits                | Description                           |
| ---------------- | -------------------- | ------------------------------------- |
| `zValueChange`   | `string \| null`     | Fires when selection changes          |
| `zComboSelected` | `ZardComboboxOption` | Fires with the selected option object |
| `zSearchChange`  | `string`             | Fires on search input change          |

### Interfaces

```typescript
interface ZardComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ZardIcon;
}
interface ZardComboboxGroup {
  label?: string;
  options: ZardComboboxOption[];
}
```

### Usage Examples

```html
<z-combobox
  [options]="countries"
  [(ngModel)]="selectedCountry"
  placeholder="Select country"
  (zComboSelected)="onSelect($event)"
/>
```

---

## command

**Selector:** `<z-command>`
**Category:** Forms / Search
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Command palette / searchable option list with keyboard navigation.

### Inputs

| Input   | Binding   | Type               | Default     | Description       |
| ------- | --------- | ------------------ | ----------- | ----------------- |
| `size`  | `[size]`  | `'default' \| ...` | `'default'` | Layout size       |
| `class` | `[class]` | `ClassValue`       | `''`        | Extra CSS classes |

### Outputs

| Output             | Emits               | Description                        |
| ------------------ | ------------------- | ---------------------------------- |
| `zCommandChange`   | `ZardCommandOption` | Fires on keyboard highlight change |
| `zCommandSelected` | `ZardCommandOption` | Fires on selection (Enter/click)   |

### Interface

```typescript
interface ZardCommandOption {
  value: string;
  label: string;
  disabled?: boolean;
  command?: string;
  shortcut?: string;
  icon?: ZardIcon;
  action?: () => void;
  key?: string;
}
```

### Internal Sub-components

| Component                         | Selector                 | Purpose                              |
| --------------------------------- | ------------------------ | ------------------------------------ |
| `ZardCommandInputComponent`       | `z-command-input`        | ⚠️ internal — search input           |
| `ZardCommandListComponent`        | `z-command-list`         | ⚠️ internal — scrollable result list |
| `ZardCommandEmptyComponent`       | `z-command-empty`        | ⚠️ internal — empty state            |
| `ZardCommandOptionComponent`      | `z-command-option`       | ⚠️ internal — single option row      |
| `ZardCommandOptionGroupComponent` | `z-command-option-group` | ⚠️ internal — option group label     |
| `ZardCommandDividerComponent`     | `z-command-divider`      | ⚠️ internal — visual separator       |

### Visual Notes

- Keyboard navigation: ArrowDown/Up moves focus, Enter selects, Escape closes.

### Usage Examples

```html
<z-command [options]="actions" (zCommandSelected)="run($event)">
  <z-command-input placeholder="Type a command..." />
  <z-command-list />
  <z-command-empty>No results</z-command-empty>
</z-command>
```

---

## date-picker

**Selector:** `<z-date-picker>`, `[z-date-picker]`
**Category:** Forms / Date
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Button-triggered popover containing a `<z-calendar>` for single date selection.

### Inputs

| Input         | Binding         | Type                     | Default          | Description                      |
| ------------- | --------------- | ------------------------ | ---------------- | -------------------------------- |
| `value`       | `[(value)]`     | `Date \| null`           | `null`           | Selected date                    |
| `disabled`    | `[(disabled)]`  | `boolean`                | `false`          | Disabled state                   |
| `placeholder` | `[placeholder]` | `string`                 | `'Pick a date'`  | Button text when empty           |
| `zFormat`     | `[zFormat]`     | `string`                 | `'MMMM d, yyyy'` | Angular `DatePipe` format string |
| `zType`       | `[zType]`       | `ZardButtonTypeVariants` | `'outline'`      | Trigger button style             |
| `zSize`       | `[zSize]`       | `ZardButtonSizeVariants` | `'default'`      | Trigger button size              |
| `minDate`     | `[minDate]`     | `Date \| null`           | `null`           | Minimum selectable date          |
| `maxDate`     | `[maxDate]`     | `Date \| null`           | `null`           | Maximum selectable date          |
| `class`       | `[class]`       | `ClassValue`             | `''`             | Extra CSS classes                |

### Outputs

| Output       | Emits          | Description                 |
| ------------ | -------------- | --------------------------- |
| `dateChange` | `Date \| null` | Fires when date is selected |

### Visual Notes

- Trigger shows calendar icon + formatted date; popover auto-closes on selection.

### Usage Examples

```html
<z-date-picker
  [(value)]="myDate"
  zFormat="dd/MM/yyyy"
  (dateChange)="onDate($event)"
/>
<z-date-picker formControlName="dob" placeholder="Select birthday" />
```

---

## dialog

**Selector:** Service-based — no element selector
**Category:** Overlay / Modal
**Forms compatible:** No
**Purpose:** General-purpose modal dialog with header, custom content, and footer actions. Launched via `ZardDialogService`.

### Service API

**Import:** `ZardDialogService`

| Method                | Returns            | Description   |
| --------------------- | ------------------ | ------------- |
| `create<T,U>(config)` | `ZardDialogRef<T>` | Open a dialog |

### Options (`ZardDialogOptions`)

| Option              | Type                            | Description                 |
| ------------------- | ------------------------------- | --------------------------- |
| `zTitle`            | `string \| TemplateRef`         | Dialog heading              |
| `zDescription`      | `string \| TemplateRef`         | Subtitle                    |
| `zContent`          | `string \| TemplateRef \| Type` | Body content                |
| `zOkText`           | `string`                        | OK button label             |
| `zCancelText`       | `string`                        | Cancel button label         |
| `zOkIcon`           | `ZardIcon`                      | Icon on OK button           |
| `zCancelIcon`       | `ZardIcon`                      | Icon on Cancel button       |
| `zOkDestructive`    | `boolean`                       | Style OK as destructive     |
| `zOkDisabled`       | `boolean`                       | Disable OK button           |
| `zHideFooter`       | `boolean`                       | Hide footer entirely        |
| `zClosable`         | `boolean`                       | Show X close button         |
| `zMaskClosable`     | `boolean`                       | Close on backdrop click     |
| `zOnOk`             | `callback`                      | OK handler                  |
| `zOnCancel`         | `callback`                      | Cancel handler              |
| `zWidth`            | `string`                        | Custom width                |
| `zData`             | `any`                           | Passed to component content |
| `zViewContainerRef` | `ViewContainerRef`              | Injection context           |
| `zCustomClasses`    | `string`                        | Extra CSS on panel          |

### Usage Examples

```typescript
constructor(private dialog: ZardDialogService) {}

this.dialog.create({
  zTitle: 'Edit User',
  zContent: EditUserComponent,
  zData: { userId: 1 },
  zOnOk: (instance) => instance.save(),
});
```

### Visual Notes

- Centered fixed overlay; `sm:max-w-[425px]`; scale+opacity animation.
- X button top-right when `zClosable` is true.

---

## divider

**Selector:** `<z-divider>`
**Category:** Layout
**Forms compatible:** No
**Purpose:** Thin horizontal or vertical rule to separate content.

### Inputs

| Input          | Binding          | Type                                  | Default        | Description        |
| -------------- | ---------------- | ------------------------------------- | -------------- | ------------------ |
| `zOrientation` | `[zOrientation]` | `'horizontal' \| 'vertical'`          | `'horizontal'` | Line direction     |
| `zSpacing`     | `[zSpacing]`     | `'none' \| 'sm' \| 'default' \| 'lg'` | `'default'`    | Margin around line |
| `class`        | `[class]`        | `ClassValue`                          | `''`           | Extra CSS classes  |

### Visual Notes

- Horizontal: `h-px w-full`; spacing adds `my-*`.
- Vertical: `w-px h-full inline-block`; spacing adds `mx-*`.

### Usage Examples

```html
<z-divider /> <z-divider zOrientation="vertical" zSpacing="sm" />
```

---

## dropdown

**Selector:** `<z-dropdown-menu>`
**Category:** Navigation / Overlay
**Forms compatible:** No
**Purpose:** Context menu that opens in a CDK overlay, triggered by projected content.

### Inputs

| Input      | Binding      | Type         | Default | Description       |
| ---------- | ------------ | ------------ | ------- | ----------------- |
| `disabled` | `[disabled]` | `boolean`    | `false` | Disable trigger   |
| `class`    | `[class]`    | `ClassValue` | `''`    | Extra CSS classes |

### Outputs

| Output       | Emits     | Description                         |
| ------------ | --------- | ----------------------------------- |
| `openChange` | `boolean` | Fires when dropdown opens or closes |

### Content Projection

| Slot                 | Description                            |
| -------------------- | -------------------------------------- |
| `[dropdown-trigger]` | The element that triggers the dropdown |
| Default              | Menu item content                      |

### Visual Notes

- Menu panel: `z-50 min-w-32 rounded-md border bg-popover p-2`.
- Keyboard: ArrowDown/Up navigates, Enter/Space selects, Escape/Home/End supported.
- `dropdownItemVariants`: `variant='default'|'destructive'`; `inset=true` adds `pl-8`.

### Usage Examples

```html
<z-dropdown-menu (openChange)="onOpen($event)">
  <button dropdown-trigger z-button zType="outline">Options</button>
  <button [z-menu-item]>Edit</button>
  <button [z-menu-item] zType="destructive">Delete</button>
</z-dropdown-menu>
```

---

## empty

**Selector:** `<z-empty>`
**Category:** Feedback
**Forms compatible:** No
**Purpose:** Empty state placeholder with optional image/icon, title, description, and action buttons.

### Inputs

| Input          | Binding          | Type                    | Default     | Description                           |
| -------------- | ---------------- | ----------------------- | ----------- | ------------------------------------- |
| `zIcon`        | `[zIcon]`        | `ZardIcon`              | `undefined` | Icon to display (shown when no image) |
| `zImage`       | `[zImage]`       | `string \| TemplateRef` | `undefined` | Image URL or template                 |
| `zTitle`       | `[zTitle]`       | `string \| TemplateRef` | `undefined` | Heading text                          |
| `zDescription` | `[zDescription]` | `string \| TemplateRef` | `undefined` | Body text                             |
| `zActions`     | `[zActions]`     | `TemplateRef<void>[]`   | `[]`        | Action button templates               |

### Usage Examples

```html
<z-empty
  zIcon="inbox"
  zTitle="No results"
  zDescription="Try adjusting your search"
  [zActions]="[actionTpl]"
/>
<ng-template #actionTpl>
  <button z-button>Clear filters</button>
</ng-template>
```

---

## form

**Selector:** Various (see sub-components)
**Category:** Forms / Layout
**Forms compatible:** No (layout wrappers only)
**Purpose:** Form layout helpers for field, label, control hint/error, and message display.

### Sub-components

| Component                  | Selector                              | Purpose                                          |
| -------------------------- | ------------------------------------- | ------------------------------------------------ |
| `ZardFormFieldComponent`   | `z-form-field`, `[z-form-field]`      | Wraps a form control in a `grid gap-2` container |
| `ZardFormControlComponent` | `z-form-control`, `[z-form-control]`  | Shows error or help text below the control       |
| `ZardFormLabelComponent`   | `z-form-label`, `label[z-form-label]` | Form label, optionally with required asterisk    |
| `ZardFormMessageComponent` | `z-form-message`, `[z-form-message]`  | Inline status message                            |

### Inputs by Component

**`z-form-control`:**
| Input | Type | Description |
|---|---|---|
| `errorMessage` | `string` | Shown in red below control |
| `helpText` | `string` | Shown in muted below control |

**`z-form-label`:**
| Input | Type | Description |
|---|---|---|
| `zRequired` | `boolean` | Adds a red `*` after label text |

**`z-form-message`:**
| Input | Type | Description |
|---|---|---|
| `zType` | `'default' \| 'error' \| 'success' \| 'warning'` | Color theme |

### Visual Notes

- `error` → `text-red-500`, `success` → `text-green-500`, `warning` → `text-yellow-500`.

### Usage Examples

```html
<z-form-field>
  <label z-form-label zRequired="true">Email</label>
  <z-form-control [errorMessage]="emailError">
    <input z-input formControlName="email" type="email" />
  </z-form-control>
</z-form-field>
```

---

## icon

**Selector:** `<z-icon>`, `[z-icon]`
**Category:** Display
**Forms compatible:** No
**Purpose:** Renders a Lucide icon by name with configurable size and stroke width.

### Inputs

| Input                  | Binding                  | Type                                | Default     | Description               |
| ---------------------- | ------------------------ | ----------------------------------- | ----------- | ------------------------- |
| `zType`                | `[zType]`                | `ZardIcon` (required)               | —           | Lucide icon name          |
| `zSize`                | `[zSize]`                | `'sm' \| 'default' \| 'lg' \| 'xl'` | `'default'` | Icon size (rem-based)     |
| `zStrokeWidth`         | `[zStrokeWidth]`         | `number`                            | `2`         | SVG stroke width          |
| `zAbsoluteStrokeWidth` | `[zAbsoluteStrokeWidth]` | `boolean`                           | `false`     | Use absolute stroke width |
| `class`                | `[class]`                | `ClassValue`                        | `''`        | Extra CSS classes         |

### Visual Notes

- Sizes map to rem: `sm`=3, `default`=3.5, `lg`=4, `xl`=5.
- `zStrokeWidth=0` → `stroke-none`.

### Usage Examples

```html
<z-icon zType="user" />
<z-icon
  zType="trash-2"
  zSize="lg"
  [zStrokeWidth]="1.5"
  class="text-destructive"
/>
```

---

## input

**Selector:** `input[z-input]`, `textarea[z-input]`
**Category:** Forms
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Styled input/textarea directive with size, status, and borderless mode.

### Inputs

| Input         | Binding         | Type                                | Default     | Description                                                         |
| ------------- | --------------- | ----------------------------------- | ----------- | ------------------------------------------------------------------- |
| `value`       | `[(value)]`     | `string`                            | `''`        | Input value                                                         |
| `zBorderless` | `[zBorderless]` | `boolean`                           | `false`     | Remove border, background, padding (for use inside `z-input-group`) |
| `zSize`       | `[zSize]`       | `'default' \| 'sm' \| 'lg'`         | `'default'` | Input size                                                          |
| `zStatus`     | `[zStatus]`     | `'error' \| 'warning' \| 'success'` | `undefined` | Validation state                                                    |
| `class`       | `[class]`       | `ClassValue`                        | `''`        | Extra CSS classes                                                   |

### Variants & Visual States

| State      | Visual Effect                         |
| ---------- | ------------------------------------- |
| `error`    | `border-destructive ring-destructive` |
| `warning`  | `border-yellow-500`                   |
| `success`  | `border-green-500`                    |
| Borderless | No border, no bg, no padding          |

### Usage Examples

```html
<input z-input [(ngModel)]="text" placeholder="Enter text" />
<input z-input formControlName="email" zStatus="error" />
<textarea z-input [zSize]="'lg'"></textarea>
```

---

## input-group

**Selector:** `<z-input-group>`
**Category:** Forms
**Forms compatible:** No (wrapper only)
**Purpose:** Wraps an `input[z-input]` or `textarea[z-input]` with prefix/suffix addons and loading state.

### Inputs

| Input          | Binding          | Type                        | Default     | Description                |
| -------------- | ---------------- | --------------------------- | ----------- | -------------------------- |
| `zAddonBefore` | `[zAddonBefore]` | `string \| TemplateRef`     | `undefined` | Prefix addon               |
| `zAddonAfter`  | `[zAddonAfter]`  | `string \| TemplateRef`     | `undefined` | Suffix addon               |
| `zAddonAlign`  | `[zAddonAlign]`  | `'inline' \| 'block'`       | `'inline'`  | Addon placement style      |
| `zSize`        | `[zSize]`        | `'sm' \| 'default' \| 'lg'` | `'default'` | Size (propagates to input) |
| `zDisabled`    | `[zDisabled]`    | `boolean`                   | `false`     | Disable the group          |
| `zLoading`     | `[zLoading]`     | `boolean`                   | `false`     | Show loader spinner inside |
| `class`        | `[class]`        | `ClassValue`                | `''`        | Extra CSS classes          |

### Visual Notes

- Strips input's own border/padding when inside group; applies ring on focus.
- `has-[textarea]` switches to `flex-col` layout.

### Usage Examples

```html
<z-input-group zAddonBefore="https://" zAddonAfter=".com">
  <input z-input [zBorderless]="true" placeholder="domain" />
</z-input-group>
```

---

## kbd

**Selector:** `<z-kbd>`, `[z-kbd]`
**Category:** Display
**Forms compatible:** No
**Purpose:** Renders keyboard shortcut text styled as a `<kbd>` element.

### Inputs

| Input   | Binding   | Type         | Default | Description       |
| ------- | --------- | ------------ | ------- | ----------------- |
| `class` | `[class]` | `ClassValue` | `''`    | Extra CSS classes |

### Content Projection

Default slot for key text.

### Usage Examples

```html
<z-kbd>⌘K</z-kbd>
<span>Press <z-kbd>Ctrl</z-kbd> + <z-kbd>C</z-kbd> to copy</span>
```

---

## layout

**Selector:** `<z-layout>`
**Category:** Layout
**Forms compatible:** No
**Purpose:** Application shell layout combining header, sidebar, content, and footer.

### Inputs

| Input        | Binding        | Type                                   | Default  | Description                                     |
| ------------ | -------------- | -------------------------------------- | -------- | ----------------------------------------------- |
| `zDirection` | `[zDirection]` | `'horizontal' \| 'vertical' \| 'auto'` | `'auto'` | Layout axis; auto detects from sidebar presence |
| `class`      | `[class]`      | `ClassValue`                           | `''`     | Extra CSS classes                               |

### Internal Sub-components

| Component          | Selector    | Purpose                                                      |
| ------------------ | ----------- | ------------------------------------------------------------ |
| `HeaderComponent`  | `z-header`  | ⚠️ internal — top bar (`flex items-center px-4 border-b`)    |
| `FooterComponent`  | `z-footer`  | ⚠️ internal — bottom bar (`flex items-center px-6 border-t`) |
| `ContentComponent` | `z-content` | ⚠️ internal — main area (`flex-1 overflow-auto p-6`)         |
| `SidebarComponent` | `z-sidebar` | ⚠️ internal — side panel (`h-full border-r p-6 bg-sidebar`)  |

### Visual Notes

- `horizontal` → `flex-row`; `vertical` → `flex-col`.
- Sidebar transition: `transition-all duration-300`.

### Usage Examples

```html
<z-layout>
  <z-header>App Header</z-header>
  <z-layout zDirection="horizontal">
    <z-sidebar>Nav</z-sidebar>
    <z-content>Page content</z-content>
  </z-layout>
  <z-footer>Footer</z-footer>
</z-layout>
```

---

## loader

**Selector:** `<z-loader>`
**Category:** Feedback
**Forms compatible:** No
**Purpose:** Animated spinner made of 12 rotating bars with staggered delay.

### Inputs

| Input   | Binding   | Type         | Default     | Description        |
| ------- | --------- | ------------ | ----------- | ------------------ |
| `zSize` | `[zSize]` | `string`     | `'default'` | Spinner dimensions |
| `class` | `[class]` | `ClassValue` | `''`        | Extra CSS classes  |

### Visual Notes

- 12 bars animated with `@keyframes spinner` (opacity 1 → 0.15) at staggered `animation-delay`.

### Usage Examples

```html
<z-loader /> <z-loader zSize="lg" />
```

---

## menu

**Selector:** `[z-menu]` (directive on trigger element)
**Category:** Navigation / Overlay
**Forms compatible:** No
**Purpose:** Context / navigation menu opened via Angular CDK, supporting click or hover trigger.

### Directives

**`[z-menu]` — `ZardMenuDirective`** (on trigger element):

| Input             | Binding             | Type                     | Default        | Description                      |
| ----------------- | ------------------- | ------------------------ | -------------- | -------------------------------- |
| `zMenuTriggerFor` | `[zMenuTriggerFor]` | `TemplateRef` (required) | —              | Template containing menu content |
| `zDisabled`       | `[zDisabled]`       | `boolean`                | `false`        | Disable trigger                  |
| `zTrigger`        | `[zTrigger]`        | `'click' \| 'hover'`     | `'click'`      | Open trigger mode                |
| `zHoverDelay`     | `[zHoverDelay]`     | `number`                 | `100`          | Hover delay in ms                |
| `zPlacement`      | `[zPlacement]`      | `ZardMenuPlacement`      | `'bottomLeft'` | Dropdown placement               |

**`[z-menu-item]` — `ZardMenuItemDirective`** (on menu items):

| Input       | Binding       | Type                         | Default     | Description        |
| ----------- | ------------- | ---------------------------- | ----------- | ------------------ |
| `zDisabled` | `[zDisabled]` | `boolean`                    | `false`     | Disabled state     |
| `zInset`    | `[zInset]`    | `boolean`                    | `false`     | Adds `pl-8` indent |
| `zType`     | `[zType]`     | `'default' \| 'destructive'` | `'default'` | Color theme        |

### Internal Sub-components

| Component                   | Selector          | Purpose                                                 |
| --------------------------- | ----------------- | ------------------------------------------------------- |
| `ZardMenuLabelComponent`    | `z-menu-label`    | ⚠️ internal — non-interactive label in menu             |
| `ZardMenuShortcutComponent` | `z-menu-shortcut` | ⚠️ internal — keyboard shortcut display (right-aligned) |

### Visual Notes

- Menu panel: `z-50 min-w-32 rounded-md border bg-popover p-2`; fade/zoom animations.
- Hover trigger auto-falls back to click on mobile.

### Usage Examples

```html
<button [z-menu]="menuTpl" zTrigger="click">Options</button>

<ng-template #menuTpl>
  <div z-menu-content>
    <button [z-menu-item]>Edit</button>
    <button [z-menu-item] zType="destructive">Delete</button>
  </div>
</ng-template>
```

---

## pagination

**Selector:** `<z-pagination>`
**Category:** Navigation
**Forms compatible:** No
**Purpose:** Page navigation control for paginated data.

### Inputs

| Input        | Binding          | Type                     | Default     | Description                |
| ------------ | ---------------- | ------------------------ | ----------- | -------------------------- |
| `zTotal`     | `[zTotal]`       | `number`                 | —           | Total number of pages      |
| `zPageIndex` | `[(zPageIndex)]` | `number`                 | `1`         | Current page (1-based)     |
| `zSize`      | `[zSize]`        | `ZardButtonSizeVariants` | `'default'` | Button size                |
| `zDisabled`  | `[zDisabled]`    | `boolean`                | `false`     | Disable all buttons        |
| `zContent`   | `[zContent]`     | `TemplateRef`            | `undefined` | Custom page button content |
| `zAriaLabel` | `[zAriaLabel]`   | `string`                 | —           | Accessibility label        |
| `class`      | `[class]`        | `ClassValue`             | `''`        | Extra CSS classes          |

### Outputs

| Output             | Emits    | Description             |
| ------------------ | -------- | ----------------------- |
| `zPageIndexChange` | `number` | Fires when page changes |

### Internal Sub-components

| Component                         | Selector                        | Purpose     |
| --------------------------------- | ------------------------------- | ----------- |
| `ZardPaginationPreviousComponent` | `z-pagination-previous`         | ⚠️ internal |
| `ZardPaginationNextComponent`     | `z-pagination-next`             | ⚠️ internal |
| `ZardPaginationEllipsisComponent` | `z-pagination-ellipsis`         | ⚠️ internal |
| `ZardPaginationButtonComponent`   | `button/a[z-pagination-button]` | ⚠️ internal |

### Visual Notes

- Active page uses `outline` button type; others use `ghost`.
- Disabled state propagates to all buttons.

### Usage Examples

```html
<z-pagination
  [zTotal]="totalPages"
  [(zPageIndex)]="currentPage"
  (zPageIndexChange)="loadPage($event)"
/>
```

---

## popover

**Selector:** `[zPopover]` (directive on trigger)
**Category:** Overlay
**Forms compatible:** No
**Purpose:** Tooltip-like floating panel triggered by click or hover on any element.

### Directive: `ZardPopoverDirective` (`[zPopover]`)

| Input               | Binding               | Type                                     | Default    | Description                   |
| ------------------- | --------------------- | ---------------------------------------- | ---------- | ----------------------------- |
| `zContent`          | `[zContent]`          | `TemplateRef` (required)                 | —          | Content to display in popover |
| `zTrigger`          | `[zTrigger]`          | `'click' \| 'hover' \| null`             | `'click'`  | How popover is opened         |
| `zPlacement`        | `[zPlacement]`        | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Position relative to trigger  |
| `zVisible`          | `[zVisible]`          | `boolean`                                | `false`    | Controlled visibility         |
| `zOrigin`           | `[zOrigin]`           | `ElementRef`                             | —          | Custom anchor element         |
| `zOverlayClickable` | `[zOverlayClickable]` | `boolean`                                | `false`    | Allow clicking overlay        |

### Outputs

| Output           | Emits     | Description                   |
| ---------------- | --------- | ----------------------------- |
| `zVisibleChange` | `boolean` | Fires when visibility changes |

### Public Methods

| Method   | Description                        |
| -------- | ---------------------------------- |
| `hide()` | Programmatically close the popover |

### Visual Notes

- Content container (`z-popover`): `z-50 w-72 rounded-md border bg-popover p-4 shadow-md`; fade+zoom animations.
- Offset: 8px from trigger.

### Usage Examples

```html
<button [zPopover]="myContent" zTrigger="click" zPlacement="bottom">
  Info
</button>

<ng-template #myContent>
  <z-popover>
    <p>Popover body content</p>
  </z-popover>
</ng-template>
```

---

## progress-bar

**Selector:** `<z-progress-bar>`
**Category:** Feedback
**Forms compatible:** No
**Purpose:** Visual progress indicator with determinate and indeterminate modes.

### Inputs

| Input            | Binding            | Type                                     | Default     | Description                     |
| ---------------- | ------------------ | ---------------------------------------- | ----------- | ------------------------------- |
| `progress`       | `[progress]`       | `number`                                 | `0`         | Progress value (0–100)          |
| `zType`          | `[zType]`          | `'default' \| 'destructive' \| 'accent'` | `'default'` | Color theme                     |
| `zSize`          | `[zSize]`          | `'default' \| 'sm' \| 'lg'`              | `'default'` | Bar height                      |
| `zShape`         | `[zShape]`         | `'default' \| 'square'`                  | `'default'` | Border radius                   |
| `zIndeterminate` | `[zIndeterminate]` | `boolean`                                | `false`     | Animated indeterminate mode     |
| `class`          | `[class]`          | `ClassValue`                             | `''`        | Extra CSS classes for container |
| `barClass`       | `[barClass]`       | `ClassValue`                             | `''`        | Extra CSS classes for fill bar  |

### Variants & Visual States

| Variant        | Track Color         | Fill Color                      |
| -------------- | ------------------- | ------------------------------- |
| `default`      | `bg-primary/20`     | `bg-primary`                    |
| `destructive`  | `bg-destructive/20` | `bg-destructive`                |
| `accent`       | `bg-chart-1/20`     | `bg-chart-1`                    |
| `sm`           | —                   | `h-3`                           |
| `default` size | —                   | `h-2`                           |
| `lg`           | —                   | `h-5`                           |
| Indeterminate  | —                   | CSS `@keyframes` left animation |

### Usage Examples

```html
<z-progress-bar [progress]="uploadPercent" zType="default" />
<z-progress-bar [zIndeterminate]="true" zType="accent" />
```

---

## radio

**Selector:** `<z-radio>`, `[z-radio]`
**Category:** Forms
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Styled radio button input.

### Inputs

| Input      | Binding      | Type         | Default   | Description                       |
| ---------- | ------------ | ------------ | --------- | --------------------------------- |
| `value`    | `[value]`    | `unknown`    | `null`    | The value this radio represents   |
| `disabled` | `[disabled]` | `boolean`    | `false`   | Disabled state                    |
| `name`     | `[name]`     | `string`     | `'radio'` | Radio group name                  |
| `zId`      | `[zId]`      | `string`     | `''`      | Custom ID for input/label linking |
| `class`    | `[class]`    | `ClassValue` | `''`      | Extra CSS classes                 |

### Outputs

| Output        | Emits     | Description                  |
| ------------- | --------- | ---------------------------- |
| `radioChange` | `boolean` | Fires when radio is selected |

### Visual Notes

- Native `<input type="radio">` with `appearance-none`; a `size-2 rounded-full bg-primary` dot overlays it; dot transitions `opacity-0 → opacity-100` on checked.
- Label via `<ng-content>`.

### Usage Examples

```html
<z-radio [value]="'a'" name="choice">Option A</z-radio>
<z-radio [value]="'b'" name="choice">Option B</z-radio>

<!-- With Angular Forms -->
<z-radio formControlName="plan" [value]="'free'">Free</z-radio>
```

---

## resizable

**Selector:** `<z-resizable>`, `[z-resizable]`
**Category:** Layout
**Forms compatible:** No
**Purpose:** Drag-to-resize panel container supporting horizontal and vertical layouts.

### Inputs (`z-resizable`)

| Input     | Binding     | Type                         | Default        | Description                         |
| --------- | ----------- | ---------------------------- | -------------- | ----------------------------------- |
| `zLayout` | `[zLayout]` | `'horizontal' \| 'vertical'` | `'horizontal'` | Split direction                     |
| `zLazy`   | `[zLazy]`   | `boolean`                    | `false`        | Defer resize events until drag ends |
| `class`   | `[class]`   | `ClassValue`                 | `''`           | Extra CSS classes                   |

### Outputs (`z-resizable`)

| Output         | Emits             | Description      |
| -------------- | ----------------- | ---------------- |
| `zResizeStart` | `ZardResizeEvent` | Drag start       |
| `zResize`      | `ZardResizeEvent` | Drag in progress |
| `zResizeEnd`   | `ZardResizeEvent` | Drag end         |

`ZardResizeEvent`: `{ sizes: number[], layout: 'horizontal' | 'vertical' }`

### Internal Sub-components

| Component                      | Selector             | Purpose                                   |
| ------------------------------ | -------------------- | ----------------------------------------- |
| `ZardResizablePanelComponent`  | `z-resizable-panel`  | ⚠️ internal — panel with size constraints |
| `ZardResizableHandleComponent` | `z-resizable-handle` | ⚠️ internal — drag handle between panels  |

### `z-resizable-panel` Inputs

| Input          | Type               | Description                    |
| -------------- | ------------------ | ------------------------------ |
| `zDefaultSize` | `number \| string` | Initial size (% or px)         |
| `zMin`         | `number \| string` | Minimum size                   |
| `zMax`         | `number \| string` | Maximum size (default `100`)   |
| `zCollapsible` | `boolean`          | Allow collapsing to 0          |
| `zResizable`   | `boolean`          | Allow this panel to be resized |

### Visual Notes

- Horizontal handle: `w-px cursor-col-resize`; vertical: `h-px cursor-row-resize`.
- Disabled handle: `opacity-50 pointer-events-none`.
- Collapsed panel: `hidden`.

### Usage Examples

```html
<z-resizable zLayout="horizontal" (zResizeEnd)="onResize($event)">
  <z-resizable-panel [zDefaultSize]="30" [zMin]="20">Sidebar</z-resizable-panel>
  <z-resizable-handle />
  <z-resizable-panel [zDefaultSize]="70">Content</z-resizable-panel>
</z-resizable>
```

---

## segmented

**Selector:** `<z-segmented>`
**Category:** Forms / Navigation
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Segmented control (tab-like button group) for selecting one option.

### Inputs

| Input        | Binding        | Type                        | Default     | Description                                                       |
| ------------ | -------------- | --------------------------- | ----------- | ----------------------------------------------------------------- |
| `zOptions`   | `[zOptions]`   | `SegmentedOption[]`         | `[]`        | Flat list of options (alternative to `z-segmented-item` children) |
| `zSize`      | `[zSize]`      | `'sm' \| 'default' \| 'lg'` | `'default'` | Size                                                              |
| `zDisabled`  | `[zDisabled]`  | `boolean`                   | `false`     | Disable all items                                                 |
| `zAriaLabel` | `[zAriaLabel]` | `string`                    | —           | Accessibility label                                               |
| `class`      | `[class]`      | `ClassValue`                | `''`        | Extra CSS classes                                                 |

`SegmentedOption`: `{ value: string; label: string; disabled?: boolean }`

### Outputs

Two-way model binding via CVA — connect to Angular Forms.

### Internal Sub-components

| Component                    | Selector           | Purpose                                               |
| ---------------------------- | ------------------ | ----------------------------------------------------- |
| `ZardSegmentedItemComponent` | `z-segmented-item` | ⚠️ internal — declarative item via content projection |

### Variants & Visual States

| State         | Visual Effect                               |
| ------------- | ------------------------------------------- |
| Active item   | `bg-background text-foreground shadow-sm`   |
| Inactive item | `hover:bg-muted/50`                         |
| Container     | `bg-muted p-1 rounded-md` pill-shaped group |

### Usage Examples

```html
<!-- Via options input -->
<z-segmented
  [zOptions]="[{value:'a',label:'A'},{value:'b',label:'B'}]"
  [(ngModel)]="tab"
/>

<!-- Via child items -->
<z-segmented [(ngModel)]="view">
  <z-segmented-item value="list" label="List" />
  <z-segmented-item value="grid" label="Grid" />
</z-segmented>
```

---

## select

**Selector:** `<z-select>`, `[z-select]`
**Category:** Forms
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Dropdown select with single or multi-select support, CDK overlay, keyboard navigation.

### Inputs

| Input            | Binding            | Type                        | Default                 | Description                      |
| ---------------- | ------------------ | --------------------------- | ----------------------- | -------------------------------- |
| `zValue`         | `[(zValue)]`       | `string \| string[]`        | `''`                    | Selected value(s)                |
| `zPlaceholder`   | `[zPlaceholder]`   | `string`                    | `'Select an option...'` | Placeholder text                 |
| `zMultiple`      | `[zMultiple]`      | `boolean`                   | `false`                 | Multi-select mode                |
| `zSize`          | `[zSize]`          | `'sm' \| 'default' \| 'lg'` | `'default'`             | Trigger size                     |
| `zDisabled`      | `[zDisabled]`      | `boolean`                   | `false`                 | Disabled state                   |
| `zLabel`         | `[zLabel]`         | `string`                    | `''`                    | Accessible label                 |
| `zMaxLabelCount` | `[zMaxLabelCount]` | `number`                    | `1`                     | Max badges shown in multi-select |
| `class`          | `[class]`          | `ClassValue`                | `''`                    | Extra CSS classes                |

### Outputs

| Output             | Emits                | Description                  |
| ------------------ | -------------------- | ---------------------------- |
| `zSelectionChange` | `string \| string[]` | Fires when selection changes |

### Content Projection

Projects `<z-select-item>` elements.

### `z-select-item` Inputs

| Input       | Type                | Description         |
| ----------- | ------------------- | ------------------- |
| `zValue`    | `string` (required) | Option value        |
| `zDisabled` | `boolean`           | Disable this option |
| `class`     | `string`            | Extra CSS           |

### Variants & Visual States

| State               | Visual Effect                                              |
| ------------------- | ---------------------------------------------------------- |
| Selected item       | Checkmark icon + `bg-accent` highlight                     |
| Disabled item       | `opacity-50 pointer-events-none`                           |
| Multi-select labels | Each selected value shown as `<z-badge zType="secondary">` |
| Focused             | `border-ring ring-ring/50 ring-[3px]`                      |
| Placeholder         | `text-muted-foreground`                                    |

### Usage Examples

```html
<z-select [(zValue)]="selected" zPlaceholder="Choose...">
  <z-select-item zValue="a">Option A</z-select-item>
  <z-select-item zValue="b">Option B</z-select-item>
</z-select>

<!-- Multi-select with forms -->
<z-select formControlName="tags" [zMultiple]="true">
  <z-select-item zValue="ng">Angular</z-select-item>
  <z-select-item zValue="ts">TypeScript</z-select-item>
</z-select>
```

---

## sheet

**Selector:** Service-based — no element selector
**Category:** Overlay / Drawer
**Forms compatible:** No
**Purpose:** Slide-in drawer panel from any edge of the screen. Launched via `ZardSheetService`.

### Service API

**Import:** `ZardSheetService`

| Method                | Returns           | Description  |
| --------------------- | ----------------- | ------------ |
| `create<T,U>(config)` | `ZardSheetRef<T>` | Open a sheet |

`ZardSheetRef` has `close()` method.

### Options (`ZardSheetOptions`)

| Option           | Type                                     | Default     | Description                 |
| ---------------- | ---------------------------------------- | ----------- | --------------------------- |
| `zSide`          | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'`    | Slide direction             |
| `zSize`          | `'default' \| 'sm' \| 'lg' \| 'custom'`  | `'default'` | Sheet width/height          |
| `zTitle`         | `string \| TemplateRef`                  | —           | Header title                |
| `zDescription`   | `string \| TemplateRef`                  | —           | Header description          |
| `zContent`       | `string \| TemplateRef \| Type`          | —           | Body content                |
| `zOkText`        | `string`                                 | —           | OK button label             |
| `zCancelText`    | `string`                                 | —           | Cancel button label         |
| `zOkIcon`        | `ZardIcon`                               | —           | Icon on OK button           |
| `zCancelIcon`    | `ZardIcon`                               | —           | Icon on Cancel button       |
| `zOkDestructive` | `boolean`                                | —           | Style OK as destructive     |
| `zOkDisabled`    | `boolean`                                | —           | Disable OK button           |
| `zHideFooter`    | `boolean`                                | —           | Hide footer                 |
| `zClosable`      | `boolean`                                | `true`      | Show X button               |
| `zMaskClosable`  | `boolean`                                | —           | Close on backdrop click     |
| `zWidth`         | `string`                                 | —           | Custom width (custom size)  |
| `zHeight`        | `string`                                 | —           | Custom height (custom size) |
| `zOnOk`          | `callback`                               | —           | OK handler                  |
| `zOnCancel`      | `callback`                               | —           | Cancel handler              |
| `zData`          | `any`                                    | —           | Passed to component content |

### Variants & Visual States

| Variant                     | Visual Effect                                          |
| --------------------------- | ------------------------------------------------------ |
| `left`                      | Slides from left; `slide-in-from-left`; `border-r`     |
| `right`                     | Slides from right; `slide-in-from-right`; `border-l`   |
| `top`                       | Slides from top; `slide-in-from-top`; `border-b`       |
| `bottom`                    | Slides from bottom; `slide-in-from-bottom`; `border-t` |
| `default` size (left/right) | `w-3/4 sm:max-w-sm`                                    |
| `sm` (left/right)           | `w-1/2 sm:max-w-xs`                                    |
| `lg` (left/right)           | `w-full sm:max-w-lg`                                   |

### Usage Examples

```typescript
constructor(private sheet: ZardSheetService) {}

this.sheet.create({
  zSide: 'right',
  zTitle: 'Edit Profile',
  zContent: EditProfileComponent,
  zData: { userId: 1 },
});
```

---

## skeleton

**Selector:** `<z-skeleton>`
**Category:** Feedback
**Forms compatible:** No
**Purpose:** Animated placeholder block shown while content is loading.

### Inputs

| Input   | Binding   | Type         | Default | Description                                                |
| ------- | --------- | ------------ | ------- | ---------------------------------------------------------- |
| `class` | `[class]` | `ClassValue` | `''`    | Controls shape/size via CSS (width, height, border-radius) |

### Visual Notes

- `bg-accent animate-pulse rounded-md`.
- Size determined by applied `class` (e.g. `class="h-4 w-48"`).

### Usage Examples

```html
<z-skeleton class="h-4 w-48" />
<z-skeleton class="h-12 w-12 rounded-full" />
<div class="space-y-2">
  <z-skeleton class="h-4 w-full" />
  <z-skeleton class="h-4 w-3/4" />
</div>
```

---

## slider

**Selector:** `<z-slider>`
**Category:** Forms
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Draggable range input for selecting a numeric value.

### Inputs

| Input          | Binding          | Type                         | Default        | Description       |
| -------------- | ---------------- | ---------------------------- | -------------- | ----------------- |
| `value`        | `[(value)]`      | `number`                     | `0`            | Current value     |
| `disabled`     | `[(disabled)]`   | `boolean`                    | `false`        | Disabled state    |
| `zMin`         | `[zMin]`         | `number`                     | `0`            | Minimum value     |
| `zMax`         | `[zMax]`         | `number`                     | `100`          | Maximum value     |
| `zStep`        | `[zStep]`        | `number`                     | `1`            | Step increment    |
| `zOrientation` | `[zOrientation]` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider axis       |
| `class`        | `[class]`        | `ClassValue`                 | `''`           | Extra CSS classes |

### Outputs

| Output        | Emits    | Description           |
| ------------- | -------- | --------------------- |
| `valueChange` | `number` | Fires on value change |

### Internal Sub-components

| Component               | Selector         | Purpose                       |
| ----------------------- | ---------------- | ----------------------------- |
| `ZSliderTrackComponent` | `z-slider-track` | ⚠️ internal — track bar       |
| `ZSliderRangeComponent` | `z-slider-range` | ⚠️ internal — filled range    |
| `ZSliderThumbComponent` | `z-slider-thumb` | ⚠️ internal — draggable thumb |

### Visual Notes

- Track: `bg-muted rounded-full`; horizontal `h-1.5`, vertical `w-1.5 min-h-44`.
- Range fill: `bg-primary`.
- Thumb: `size-4 rounded-full border-primary bg-background shadow-sm`; focus `ring-4`.
- Disabled: `opacity-50 pointer-events-none`.

### Usage Examples

```html
<z-slider [(value)]="volume" [zMin]="0" [zMax]="100" [zStep]="5" />
<z-slider
  formControlName="price"
  zOrientation="vertical"
  [zMin]="0"
  [zMax]="1000"
/>
```

---

## switch

**Selector:** `<z-switch>`, `[z-switch]`
**Category:** Forms
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Toggle switch for binary on/off state.

### Inputs

| Input      | Binding      | Type                         | Default     | Description        |
| ---------- | ------------ | ---------------------------- | ----------- | ------------------ |
| `zType`    | `[zType]`    | `'default' \| 'destructive'` | `'default'` | Color when checked |
| `zSize`    | `[zSize]`    | `'sm' \| 'default' \| 'lg'`  | `'default'` | Switch dimensions  |
| `disabled` | `[disabled]` | `boolean`                    | `false`     | Disabled state     |
| `zId`      | `[zId]`      | `string`                     | `''`        | Custom ID          |
| `class`    | `[class]`    | `ClassValue`                 | `''`        | Extra CSS classes  |

### Outputs

| Output        | Emits     | Description               |
| ------------- | --------- | ------------------------- |
| `checkChange` | `boolean` | Fires when switch toggled |

### Variants & Visual States

| State                 | Visual Effect                    |
| --------------------- | -------------------------------- |
| Unchecked             | `bg-input` track                 |
| Checked (default)     | `bg-primary` track               |
| Checked (destructive) | `bg-destructive` track           |
| `sm`                  | `h-5 w-9` track; `size-4` thumb  |
| `default`             | `h-6 w-11` track; `size-5` thumb |
| `lg`                  | `h-7 w-13` track; `size-6` thumb |
| Disabled              | `opacity-50 cursor-not-allowed`  |

### Visual Notes

- Thumb slides with `translate-x` transition; size-aware offsets via `data-size` attribute.

### Usage Examples

```html
<z-switch [(ngModel)]="isActive" (checkChange)="onToggle($event)"
  >Enable notifications</z-switch
>
<z-switch formControlName="darkMode" zType="default" zSize="lg" />
```

---

## table

**Selector:** `table[z-table]` (attribute on `<table>`)
**Category:** Display / Data
**Forms compatible:** No
**Purpose:** Styled data table with striped, bordered variants and compact/comfortable density.

### `table[z-table]` Inputs

| Input   | Binding   | Type                                      | Default     | Description         |
| ------- | --------- | ----------------------------------------- | ----------- | ------------------- |
| `zType` | `[zType]` | `'default' \| 'striped' \| 'bordered'`    | `'default'` | Table style variant |
| `zSize` | `[zSize]` | `'default' \| 'compact' \| 'comfortable'` | `'default'` | Row density         |
| `class` | `[class]` | `ClassValue`                              | `''`        | Extra CSS classes   |

### Sub-components (all accept `class` input)

| Component                   | Selector                   | Notes                                            |
| --------------------------- | -------------------------- | ------------------------------------------------ |
| `ZardTableHeaderComponent`  | `thead[z-table-header]`    | Table head section                               |
| `ZardTableBodyComponent`    | `tbody[z-table-body]`      | Table body section                               |
| `ZardTableRowComponent`     | `tr[z-table-row]`          | Row; hover: `bg-muted/50`                        |
| `ZardTableHeadComponent`    | `th[z-table-head]`         | Header cell; `text-muted-foreground font-medium` |
| `ZardTableCellComponent`    | `td[z-table-cell]`         | Data cell; `p-2 align-middle`                    |
| `ZardTableCaptionComponent` | `caption[z-table-caption]` | `text-muted-foreground text-sm mt-4`             |

### Variants & Visual States

| Variant       | Visual Effect                    |
| ------------- | -------------------------------- |
| `striped`     | Odd rows get `bg-muted/50`       |
| `bordered`    | Outer `border border-border`     |
| `compact`     | `py-2` on cells                  |
| `comfortable` | `py-4` on cells                  |
| Selected row  | `data-[state=selected]:bg-muted` |

### Usage Examples

```html
<table z-table zType="striped" zSize="compact">
  <thead z-table-header>
    <tr z-table-row>
      <th z-table-head>Name</th>
      <th z-table-head>Email</th>
    </tr>
  </thead>
  <tbody z-table-body>
    <tr z-table-row *ngFor="let user of users">
      <td z-table-cell>{{ user.name }}</td>
      <td z-table-cell>{{ user.email }}</td>
    </tr>
  </tbody>
</table>
```

---

## tabs

**Selector:** `<z-tab-group>` (with `<z-tab>` children)
**Category:** Navigation
**Forms compatible:** No
**Purpose:** Tabbed panel container with scrollable overflow and configurable active indicator position.

### `z-tab-group` Inputs

| Input             | Binding             | Type                                     | Default    | Description                             |
| ----------------- | ------------------- | ---------------------------------------- | ---------- | --------------------------------------- |
| `zTabsPosition`   | `[zTabsPosition]`   | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`    | Tab nav position                        |
| `zActivePosition` | `[zActivePosition]` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Which edge gets active indicator border |
| `zAlignTabs`      | `[zAlignTabs]`      | `'start' \| 'center' \| 'end'`           | `'start'`  | Tab alignment in nav                    |
| `zShowArrow`      | `[zShowArrow]`      | `boolean`                                | `true`     | Show scroll arrows when overflow        |
| `zScrollAmount`   | `[zScrollAmount]`   | `number`                                 | `100`      | Pixels to scroll per arrow click        |
| `class`           | `[class]`           | `string`                                 | `''`       | Extra CSS classes                       |

### `z-tab` Inputs (required)

| Input   | Binding   | Type                | Description      |
| ------- | --------- | ------------------- | ---------------- |
| `label` | `[label]` | `string` (required) | Tab button label |

### Outputs (`z-tab-group`)

| Output       | Emits                   | Description                    |
| ------------ | ----------------------- | ------------------------------ |
| `zTabChange` | `{ index, label, tab }` | Fires when tab changes         |
| `zDeselect`  | `{ index, label, tab }` | Fires when a tab is deselected |

### Variants & Visual States

| State               | Visual Effect                                 |
| ------------------- | --------------------------------------------- |
| Active tab (bottom) | `border-b-2 border-b-primary`                 |
| Active tab (top)    | `border-t-2 border-t-primary`                 |
| Active tab (left)   | `border-l-2 border-l-primary`                 |
| Active tab (right)  | `border-r-2 border-r-primary`                 |
| `top` position      | Nav above content, `border-b mb-4`            |
| `left` position     | Nav left of content, `border-r mr-4 flex-col` |

### Content Projection

Project `<z-tab>` elements as children of `<z-tab-group>`.

### Usage Examples

```html
<z-tab-group zTabsPosition="top" (zTabChange)="onTab($event)">
  <z-tab label="Overview">
    <p>Overview content</p>
  </z-tab>
  <z-tab label="Settings">
    <p>Settings content</p>
  </z-tab>
</z-tab-group>
```

---

## toast

**Selector:** `<z-toaster>` (place once in app shell)
**Note:** `<z-toast>` is the internal individual toast item — do not use directly in templates. Trigger toasts via the `toast` function from `ngx-sonner` instead.
**Category:** Feedback
**Forms compatible:** No
**Purpose:** Notification toast container built on `ngx-sonner`. Place once in app shell; trigger toasts imperatively.

### Inputs

| Input           | Binding           | Type                                                                                              | Default          | Description                          |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------ |
| `variant`       | `[variant]`       | `'default' \| 'destructive'`                                                                      | `'default'`      | Toast color theme                    |
| `theme`         | `[theme]`         | `'light' \| 'dark' \| 'system'`                                                                   | `'system'`       | Color scheme                         |
| `position`      | `[position]`      | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | Screen position                      |
| `richColors`    | `[richColors]`    | `boolean`                                                                                         | `false`          | Use vibrant colors for status toasts |
| `expand`        | `[expand]`        | `boolean`                                                                                         | `false`          | Expand toasts on hover               |
| `duration`      | `[duration]`      | `number`                                                                                          | `4000`           | Auto-dismiss ms                      |
| `visibleToasts` | `[visibleToasts]` | `number`                                                                                          | `3`              | Max visible at once                  |
| `closeButton`   | `[closeButton]`   | `boolean`                                                                                         | `false`          | Show X on each toast                 |
| `dir`           | `[dir]`           | `'ltr' \| 'rtl' \| 'auto'`                                                                        | `'auto'`         | Text direction                       |
| `toastOptions`  | `[toastOptions]`  | `Record<string, unknown>`                                                                         | `{}`             | Extra ngx-sonner options             |
| `class`         | `[class]`         | `ClassValue`                                                                                      | `''`             | Extra CSS classes                    |

### Usage Examples

**In app shell (once):**

```html
<z-toaster position="top-right" [richColors]="true" />
```

**Trigger from code (via `ngx-sonner` `toast` function):**

```typescript
import { toast } from 'ngx-sonner';
toast.success('Saved successfully');
toast.error('Failed to save');
toast('Custom message', { description: 'More details...' });
```

---

## toggle

**Selector:** `<z-toggle>`
**Category:** Forms / Action
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** Pressable toggle button that switches between on/off states.

### Inputs

| Input        | Binding        | Type                     | Default     | Description                                                          |
| ------------ | -------------- | ------------------------ | ----------- | -------------------------------------------------------------------- |
| `zValue`     | `[zValue]`     | `boolean \| undefined`   | `undefined` | Controlled pressed state. Use `(zToggleChange)` to react to changes. |
| `zDefault`   | `[zDefault]`   | `boolean`                | `false`     | Initial state (uncontrolled)                                         |
| `disabled`   | `[disabled]`   | `boolean`                | `false`     | Disabled state                                                       |
| `zType`      | `[zType]`      | `'default' \| 'outline'` | `'default'` | Visual style                                                         |
| `zSize`      | `[zSize]`      | `'sm' \| 'md' \| 'lg'`   | `'md'`      | Size                                                                 |
| `aria-label` | `[aria-label]` | `string`                 | `''`        | Accessibility label                                                  |
| `class`      | `[class]`      | `ClassValue`             | `''`        | Extra CSS classes                                                    |

### Outputs

| Output          | Emits     | Description                 |
| --------------- | --------- | --------------------------- |
| `zToggleClick`  | `void`    | Fires on click              |
| `zToggleHover`  | `void`    | Fires on mouseenter         |
| `zToggleChange` | `boolean` | Fires with new toggle state |

### Variants & Visual States

| State     | Visual Effect                                              |
| --------- | ---------------------------------------------------------- |
| Off       | `bg-transparent hover:bg-muted`                            |
| On        | `bg-accent text-accent-foreground` (via `data-[state=on]`) |
| `outline` | `border border-input` when off                             |
| `sm`      | `h-8 px-2`                                                 |
| `md`      | `h-9 px-3`                                                 |
| `lg`      | `h-10 px-3`                                                |
| Disabled  | `opacity-50 pointer-events-none`                           |

### Usage Examples

```html
<z-toggle [(ngModel)]="isBold" aria-label="Bold" zType="outline">
  <z-icon zType="bold" />
</z-toggle>
```

---

## toggle-group

**Selector:** `<z-toggle-group>`
**Category:** Forms / Action
**Forms compatible:** ✅ Yes (ControlValueAccessor)
**Purpose:** A group of toggle buttons supporting single or multiple selection.

### Inputs

| Input          | Binding          | Type                     | Default      | Description                  |
| -------------- | ---------------- | ------------------------ | ------------ | ---------------------------- |
| `items`        | `[items]`        | `ZardToggleGroupItem[]`  | `[]`         | Toggle item definitions      |
| `zMode`        | `[zMode]`        | `'single' \| 'multiple'` | `'multiple'` | Selection mode               |
| `zType`        | `[zType]`        | `'default' \| 'outline'` | `'default'`  | Button style                 |
| `zSize`        | `[zSize]`        | `'sm' \| 'md' \| 'lg'`   | `'md'`       | Button size                  |
| `value`        | `[value]`        | `string \| string[]`     | `undefined`  | Controlled selected value(s) |
| `defaultValue` | `[defaultValue]` | `string \| string[]`     | `undefined`  | Initial value (uncontrolled) |
| `disabled`     | `[disabled]`     | `boolean`                | `false`      | Disable all buttons          |
| `class`        | `[class]`        | `ClassValue`             | `''`         | Extra CSS classes            |

### Outputs

| Output        | Emits                | Description                  |
| ------------- | -------------------- | ---------------------------- |
| `valueChange` | `string \| string[]` | Fires when selection changes |

### Interface

```typescript
interface ZardToggleGroupItem {
  value: string;
  label?: string;
  icon?: ZardIcon;
  disabled?: boolean;
  ariaLabel?: string;
}
```

### Variants & Visual States

| State          | Visual Effect                      |
| -------------- | ---------------------------------- |
| Selected item  | `bg-accent text-accent-foreground` |
| `outline` type | `border border-input`              |
| Disabled item  | `opacity-50 pointer-events-none`   |

### Usage Examples

```html
<z-toggle-group
  [items]="[{value:'left',icon:'align-left'},{value:'center',icon:'align-center'},{value:'right',icon:'align-right'}]"
  zMode="single"
  [(ngModel)]="alignment"
/>
```

---

## tooltip

**Selector:** `[zTooltip]` (directive on any element)
**Category:** Overlay
**Forms compatible:** No
**Purpose:** Floating tooltip label shown on hover or click.

### Directive: `ZardTooltipDirective` (`[zTooltip]`)

| Input        | Binding        | Type                                     | Default   | Description      |
| ------------ | -------------- | ---------------------------------------- | --------- | ---------------- |
| `zTooltip`   | `[zTooltip]`   | `string \| TemplateRef<void> \| null`    | `null`    | Tooltip content  |
| `zPosition`  | `[zPosition]`  | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`   | Placement        |
| `zTrigger`   | `[zTrigger]`   | `'click' \| 'hover'`                     | `'hover'` | Open trigger     |
| `zShowDelay` | `[zShowDelay]` | `number`                                 | `150`     | Show delay in ms |
| `zHideDelay` | `[zHideDelay]` | `number`                                 | `100`     | Hide delay in ms |

### Outputs

| Output  | Emits  | Description                   |
| ------- | ------ | ----------------------------- |
| `zShow` | `void` | Fires when tooltip appears    |
| `zHide` | `void` | Fires when tooltip disappears |

### Visual Notes

- Tooltip panel: `bg-foreground text-background rounded-md px-3 py-1.5 text-xs`; fade+zoom enter/exit animations with slide direction per placement.
- Arrow indicator positioned per side.

### Usage Examples

```html
<button [zTooltip]="'Save changes'" zPosition="top">Save</button>

<button [zTooltip]="richTpl" zTrigger="click">Help</button>
<ng-template #richTpl>
  <span>Detailed help text</span>
</ng-template>
```
