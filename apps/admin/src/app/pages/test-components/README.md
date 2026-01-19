# Zardui Component Testing & Documentation Page

## 📖 Overview

This is a comprehensive showcase and testing ground for all Zardui UI components. Each section demonstrates various usage patterns, variants, and configurations with live, interactive examples.

## 🎯 Purpose

- **Live Component Demos**: See all 40+ Zardui components in action
- **Copy-Paste Examples**: Ready-to-use code patterns for quick implementation
- **Interactive Testing**: Test component interactions and behaviors
- **Reference Documentation**: Quick lookup for component APIs and variants

## 📁 File Structure

```
test-components/
├── README.md (this file)
├── test-components.component.ts      # Component logic & state management
├── test-components.component.html    # Component templates & examples
├── test-components.component.scss    # Styling
└── test/
    ├── test.ts                       # Dialog/Sheet test content component
    ├── test.html
    └── test.scss
```

## 🧩 Component Catalog (Alphabetical)

### A

#### **Accordion** (`#accordion`)

Collapsible content panels with expand/collapse functionality.

**Variants:**

- Basic (single expansion)
- Multiple (multiple panels can be expanded)
- Not collapsible (at least one panel must remain open)

**Key Properties:**

```typescript
zType: 'single' | 'multiple'
zDefaultValue: string | string[]
zCollapsible: boolean
```

**Usage Example:**

```html
<z-accordion zDefaultValue="item-1">
  <z-accordion-item zValue="item-1" zTitle="Section 1">
    Content for section 1
  </z-accordion-item>
</z-accordion>
```

---

#### **Alert** (`#alert`)

Display important messages or notifications to users.

**Variants:**

- Default (info/neutral)
- Destructive (errors/warnings)

**Key Properties:**

```typescript
zType: 'default' | 'destructive';
zIcon: string | TemplateRef;
zTitle: string;
zDescription: string | TemplateRef;
```

**Usage Example:**

```html
<z-alert
  zIcon="circle-check"
  zTitle="Success!"
  zDescription="Your changes have been saved"
/>
```

---

#### **Alert Dialog** (`#alert-dialog`)

Modal dialog for critical confirmations (destructive actions).

**Service API:**

```typescript
alertDialogService.confirm({
  zTitle: string,
  zDescription: string,
  zOkText: string,
  zCancelText: string,
});
```

**Usage Example:**

```typescript
showAlertDialog(): void {
  this._alertDialogService.confirm({
    zTitle: 'Are you absolutely sure?',
    zDescription: 'This action cannot be undone.',
    zOkText: 'Continue',
    zCancelText: 'Cancel',
  });
}
```

---

#### **Avatar** (`#avatar`)

Display user profile images with fallback initials.

**Variants:**

- Sizes: `xs`, `sm`, `md` (default), `lg`, `xl`, `2xl`
- Shapes: `circle` (default), `square`
- Status indicators (online/offline dots)

**Key Properties:**

```typescript
zSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
zShape: 'circle' | 'square'
zSrc: string (image URL)
zAlt: string
zFallback: string (initials)
```

**Avatar Group:**

```html
<z-avatar-group zMax="3" zSize="md">
  <z-avatar zSrc="..." />
  <z-avatar zSrc="..." />
  <z-avatar zSrc="..." />
</z-avatar-group>
```

---

### B

#### **Badge** (`#badge`)

Small status indicators or labels.

**Variants:**

- Types: `default`, `primary`, `secondary`, `success`, `warning`, `destructive`, `outline`
- Sizes: `sm`, `md` (default), `lg`
- Shapes: `default`, `rounded`, `pill`

**Key Properties:**

```typescript
zType: 'default' |
  'primary' |
  'secondary' |
  'success' |
  'warning' |
  'destructive' |
  'outline';
zSize: 'sm' | 'md' | 'lg';
zShape: 'default' | 'rounded' | 'pill';
```

**Usage Example:**

```html
<z-badge zType="success" zSize="sm" zShape="pill">Active</z-badge>
```

---

#### **Breadcrumb** (`#breadcrumb`)

Navigation trail showing page hierarchy.

**Key Properties:**

```typescript
zSeparator: string | TemplateRef (default: '/')
```

**Usage Example:**

```html
<z-breadcrumb>
  <z-breadcrumb-item>
    <a href="/">Home</a>
  </z-breadcrumb-item>
  <z-breadcrumb-item>
    <a href="/products">Products</a>
  </z-breadcrumb-item>
  <z-breadcrumb-item zCurrent="true"> Details </z-breadcrumb-item>
</z-breadcrumb>
```

---

#### **Button** (`#button`)

Clickable actions and triggers.

**Variants:**

- Types: `default`, `primary`, `secondary`, `success`, `warning`, `destructive`, `outline`, `ghost`, `link`
- Sizes: `xs`, `sm`, `md` (default), `lg`, `xl`
- Shapes: `default`, `rounded`, `pill`, `circle`

**Key Properties:**

```typescript
zType: 'default' |
  'primary' |
  'secondary' |
  'success' |
  'warning' |
  'destructive' |
  'outline' |
  'ghost' |
  'link';
zSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
zShape: 'default' | 'rounded' | 'pill' | 'circle';
zLoading: boolean;
zDisabled: boolean;
```

**Usage Example:**

```html
<button z-button zType="primary" zSize="md">Click Me</button>
```

---

#### **Button Group** (`#button-group`)

Group related buttons together.

**Variants:**

- Horizontal (default)
- Vertical
- With dividers

**Usage Example:**

```html
<z-button-group zOrientation="horizontal">
  <button z-button zType="outline">Left</button>
  <z-button-group-divider />
  <button z-button zType="outline">Center</button>
  <z-button-group-divider />
  <button z-button zType="outline">Right</button>
</z-button-group>
```

---

### C

#### **Calendar** (`#calendar`)

Date picker with single or range selection.

**Variants:**

- Single date selection
- Date range selection
- Min/max date constraints
- Disabled dates

**Key Properties:**

```typescript
zMode: 'single' | 'range'
zValue: Date | Date[]
zMin: Date
zMax: Date
zDisabledDates: (date: Date) => boolean
```

**Usage Example:**

```typescript
// Component
readonly selectedDates = signal<Date[] | null>(null);
minDate = new Date();
maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
```

```html
<z-calendar
  zMode="single"
  [zValue]="selectedDates()"
  [zMin]="minDate"
  [zMax]="maxDate"
  (zValueChange)="selectedDates.set($event)"
/>
```

---

#### **Card** (`#card`)

Container for content with optional header, footer, and padding.

**Key Properties:**

```typescript
zPadding: 'none' | 'sm' | 'md' | 'lg';
zElevation: 'none' | 'sm' | 'md' | 'lg';
```

**Usage Example:**

```html
<z-card zPadding="md">
  <header>Card Title</header>
  <div>Card content goes here</div>
  <footer>Card Footer</footer>
</z-card>
```

---

#### **Carousel** (`#carousel`)

Image/content slider with navigation controls.

**Features:**

- Autoplay support
- Loop mode
- Keyboard navigation
- Responsive spacing
- Slide indicators
- Custom plugins (via Embla)

**Key Properties:**

```typescript
carouselOptions = {
  loop: boolean,
  align: 'start' | 'center' | 'end'
}
plugins: EmblaPluginType[]
```

**Usage Example:**

```html
<z-carousel
  [zOptions]="carouselOptions"
  [zPlugins]="plugins"
  (zInit)="onCarouselInit($event)"
  (zSlideChange)="onSlideChange()"
>
  <z-carousel-content>
    <z-carousel-item>Slide 1</z-carousel-item>
    <z-carousel-item>Slide 2</z-carousel-item>
  </z-carousel-content>
</z-carousel>
```

**Methods:**

```typescript
toggleAutoplay(): Promise<void>
toggleLoop(): void
goToPrevious(): void
goToNext(): void
goToSlide(index: number): void
```

---

#### **Checkbox** (`#checkbox`)

Binary selection control (checked/unchecked).

**Key Properties:**

```typescript
zSize: 'sm' | 'md' | 'lg'
zDisabled: boolean
zIndeterminate: boolean (for parent checkboxes)
```

**Usage Example:**

```html
<!-- Standalone -->
<z-checkbox [(ngModel)]="checked">Accept terms</z-checkbox>

<!-- With Forms -->
<z-checkbox id="newsletter" formControlName="newsletter">
  Subscribe to newsletter
</z-checkbox>
```

---

#### **Combobox** (`#combobox`)

Searchable dropdown with autocomplete.

**Features:**

- Searchable options
- Grouped options
- Disabled options
- Form control integration
- Custom templates

**Key Properties:**

```typescript
interface ZardComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ZardComboboxGroup {
  label: string;
  options: ZardComboboxOption[];
}
```

**Usage Example:**

```typescript
// Component
frameworkControl = new FormControl<string | null>(null);
frameworks: ZardComboboxOption[] = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React', disabled: true },
  { value: 'vue', label: 'Vue.js' },
];
```

```html
<z-combobox
  [formControl]="frameworkControl"
  [zOptions]="frameworks"
  zPlaceholder="Select framework..."
  (zSelect)="onSelect($event)"
/>
```

---

#### **Command** (`#command`)

Command palette / keyboard shortcut interface.

**Features:**

- Keyboard shortcuts (Cmd+K / Ctrl+K)
- Grouped commands
- Search/filter
- Icons support

**Key Properties:**

```typescript
interface ZardCommandOption {
  value: string;
  label: string;
  icon?: string;
  shortcut?: string;
}
```

**Usage Example:**

```html
<z-command (zSelect)="handleCommand($event)">
  <z-command-input zPlaceholder="Type a command..." />
  <z-command-list>
    <z-command-option-group zHeading="File">
      <z-command-option zValue="save" zIcon="save"> Save </z-command-option>
    </z-command-option-group>
  </z-command-list>
</z-command>
```

---

### D

#### **Date Picker** (`#date-picker`)

Input field with calendar popup for date selection.

**Variants:**

- Single date
- Date range
- With time selection

**Usage Example:**

```html
<z-date-picker
  zMode="single"
  [zValue]="selectedDates()"
  [zMin]="minDate"
  [zMax]="maxDate"
  (zValueChange)="selectedDates.set($event)"
  zPlaceholder="Pick a date"
/>
```

---

#### **Dialog** (`#dialog`)

Modal overlay for forms, confirmations, and focused content.

**Service API:**

```typescript
dialogService.create({
  zTitle: string,
  zDescription: string,
  zContent: Component | string,
  zData?: any,
  zOkText?: string,
  zCancelText?: string,
  zWidth?: string,
  zOnOk?: (instance: any) => void,
  zOnCancel?: () => void
})
```

**Usage Example:**

```typescript
openDialog(): void {
  this._dialogService.create({
    zTitle: 'Edit Profile',
    zDescription: 'Make changes to your profile here.',
    zContent: ProfileFormComponent,
    zData: { userId: 123 },
    zOkText: 'Save changes',
    zWidth: '500px',
    zOnOk: (formData) => {
      console.log('Saved:', formData);
    }
  });
}
```

---

#### **Divider** (`#divider`)

Horizontal or vertical separator line.

**Key Properties:**

```typescript
zOrientation: 'horizontal' | 'vertical';
zLabel: string | TemplateRef;
zAlign: 'start' | 'center' | 'end';
```

**Usage Example:**

```html
<z-divider zOrientation="horizontal" zLabel="OR" zAlign="center" />
```

---

#### **Dropdown** (`#dropdown`)

Context menus and action menus.

**Usage Example:**

```html
<button z-button [zDropdown]="menu">Open Menu</button>

<ng-template #menu>
  <z-dropdown-menu-content>
    <z-dropdown-menu-item (click)="handleAction('edit')">
      <z-icon zType="edit" /> Edit
    </z-dropdown-menu-item>
    <z-dropdown-menu-item (click)="handleAction('delete')">
      <z-icon zType="trash" /> Delete
    </z-dropdown-menu-item>
  </z-dropdown-menu-content>
</ng-template>
```

---

### E

#### **Empty** (`#empty`)

Empty state placeholder with optional action.

**Key Properties:**

```typescript
zIcon: string | TemplateRef
zTitle: string
zDescription: string
zActionText: string
(zAction): EventEmitter
```

**Usage Example:**

```html
<z-empty
  zIcon="inbox"
  zTitle="No messages"
  zDescription="You don't have any messages yet."
  zActionText="Send a message"
  (zAction)="onActionClick()"
/>
```

---

### F

#### **Form** (`#form`)

Form fields with validation and error display.

**Features:**

- Field-level validation
- Error messages
- Required indicators
- Helper text
- Reactive forms integration

**Usage Example:**

```html
<form [formGroup]="contactForm">
  <z-form-field zardId="email" #e="zardId">
    <label [for]="e.id()">Email *</label>
    <input
      [id]="e.id()"
      z-input
      type="email"
      formControlName="email"
      placeholder="you@example.com"
    />
    <z-form-error>
      @if (contactForm.controls.email.hasError('required')) { Email is required
      } @if (contactForm.controls.email.hasError('email')) { Invalid email
      format }
    </z-form-error>
  </z-form-field>
</form>
```

---

### I

#### **Icon** (`#icon`)

SVG icons from Lucide icon set.

**Key Properties:**

```typescript
zType: string (icon name)
zSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
zColor: string
```

**Usage Example:**

```html
<z-icon zType="user" zSize="md" />
<z-icon zType="search" zSize="lg" zColor="primary" />
```

**Available Icons:** 1000+ Lucide icons - see [https://lucide.dev](https://lucide.dev)

---

#### **Input** (`#input`)

Text input fields with various types.

**Variants:**

- Types: text, email, password, number, tel, url, search
- Sizes: sm, md (default), lg
- With prefix/suffix icons

**Usage Example:**

```html
<input z-input type="text" placeholder="Enter text..." zSize="md" />
```

---

#### **Input Group** (`#input-group`)

Input fields with prefix/suffix addons.

**Features:**

- Prefix text/icons
- Suffix text/icons
- Button addons
- Multiple sizes

**Usage Example:**

```html
<z-input-group zSize="md">
  <z-input-group-prefix>
    <z-icon zType="search" />
  </z-input-group-prefix>
  <input z-input type="text" placeholder="Search..." />
  <z-input-group-suffix>
    <button z-button zType="ghost" zSize="sm">
      <z-icon zType="x" />
    </button>
  </z-input-group-suffix>
</z-input-group>
```

---

### K

#### **Kbd** (`#kbd`)

Keyboard key display for shortcuts.

**Usage Example:**

```html
<z-kbd>⌘</z-kbd>
<z-kbd>K</z-kbd>

<!-- Group -->
<z-kbd-group>
  <z-kbd>Ctrl</z-kbd>
  <z-kbd>+</z-kbd>
  <z-kbd>S</z-kbd>
</z-kbd-group>
```

---

### L

#### **Loader** (`#loader`)

Loading spinners and progress indicators.

**Variants:**

- Types: `spinner`, `dots`, `pulse`, `bars`
- Sizes: `xs`, `sm`, `md` (default), `lg`, `xl`

**Usage Example:**

```html
<z-loader zType="spinner" zSize="lg" /> <z-loader zType="dots" zSize="md" />
```

---

### M

#### **Menu** (`#menu`)

Navigation menus with nesting support.

**Features:**

- Nested submenus
- Icons
- Disabled items
- Dividers
- Keyboard navigation

**Usage Example:**

```html
<z-menu>
  <z-menu-item (click)="handleAction('profile')">
    <z-icon zType="user" /> Profile
  </z-menu-item>
  <z-menu-divider />
  <z-menu-submenu zLabel="Settings">
    <z-menu-item>Account</z-menu-item>
    <z-menu-item>Privacy</z-menu-item>
  </z-menu-submenu>
</z-menu>
```

---

### P

#### **Pagination** (`#pagination`)

Page navigation controls.

**Features:**

- First/last buttons
- Previous/next buttons
- Page numbers
- Total pages display
- Custom page links

**Usage Example:**

```typescript
// Component
readonly totalPages = 5;
readonly currentPage = signal(3);

goToPage(page: number): void {
  this.currentPage.set(page);
}
```

```html
<z-pagination
  [zTotal]="totalPages"
  [zCurrent]="currentPage()"
  (zPageChange)="goToPage($event)"
  zShowFirstLast="true"
/>
```

---

#### **Popover** (`#popover`)

Floating overlay for additional content.

**Key Properties:**

```typescript
zTrigger: 'hover' | 'click'
zPlacement: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | ...
zShowArrow: boolean
zOffset: number
```

**Usage Example:**

```html
<button
  z-button
  [zPopover]="popoverContent"
  zTrigger="click"
  zPlacement="bottom"
>
  Show Popover
</button>

<ng-template #popoverContent>
  <div class="p-4">
    <p>Popover content here</p>
  </div>
</ng-template>
```

---

#### **Progress Bar** (`#progress-bar`)

Linear progress indicator.

**Key Properties:**

```typescript
zValue: number(0 - 100);
zSize: 'sm' | 'md' | 'lg';
zType: 'default' | 'success' | 'warning' | 'destructive';
zShowLabel: boolean;
```

**Usage Example:**

```html
<z-progress-bar [zValue]="66" zSize="md" zType="success" zShowLabel="true" />
```

---

### R

#### **Radio** (`#radio`)

Single selection from multiple options.

**Usage Example:**

```html
<z-radio-group formControlName="plan">
  <z-radio zValue="free">
    <label>Free</label>
  </z-radio>
  <z-radio zValue="pro">
    <label>Pro ($9.99/mo)</label>
  </z-radio>
  <z-radio zValue="enterprise">
    <label>Enterprise (Contact us)</label>
  </z-radio>
</z-radio-group>
```

---

#### **Resizable** (`#resizable`)

Resizable panels with drag handles.

**Usage Example:**

```html
<z-resizable>
  <z-resizable-panel [zDefaultSize]="50">
    <div>Left panel content</div>
  </z-resizable-panel>

  <z-resizable-handle />

  <z-resizable-panel [zDefaultSize]="50">
    <div>Right panel content</div>
  </z-resizable-panel>
</z-resizable>
```

---

### S

#### **Segmented** (`#segmented`)

Toggle between multiple options (like tab buttons).

**Usage Example:**

```html
<z-segmented
  [zOptions]="carouselOptions2"
  [zValue]="currentSpacing()"
  (zChange)="onChange($event)"
/>
```

---

#### **Select** (`#select`)

Dropdown selection input.

**Features:**

- Searchable
- Multiple selection
- Disabled options
- Custom templates

**Usage Example:**

```html
<z-select formControlName="country" zPlaceholder="Select country">
  <z-select-item zValue="us">United States</z-select-item>
  <z-select-item zValue="uk">United Kingdom</z-select-item>
  <z-select-item zValue="ca">Canada</z-select-item>
</z-select>
```

---

#### **Sheet** (`#sheet`)

Side panel/drawer overlay.

**Service API:**

```typescript
sheetService.create({
  zTitle: string,
  zDescription: string,
  zContent: Component | string,
  zData?: any,
  zSide: 'left' | 'right' | 'top' | 'bottom',
  zWidth?: string,
  zHeight?: string,
  zOkText?: string,
  zOnOk?: (instance: any) => void
})
```

**Usage Example:**

```typescript
openSheet(): void {
  this._sheetService.create({
    zTitle: 'Edit Settings',
    zDescription: 'Modify your preferences',
    zContent: SettingsFormComponent,
    zSide: 'right',
    zWidth: '500px',
    zOkText: 'Save',
    zOnOk: (data) => console.log(data)
  });
}
```

---

#### **Skeleton** (`#skeleton`)

Loading placeholder with shimmer effect.

**Variants:**

- `text` - Text line placeholders
- `circle` - Circular placeholders (avatars)
- `rectangle` - Box placeholders
- Custom sizes

**Usage Example:**

```html
<z-skeleton zType="text" zWidth="200px" zHeight="16px" />
<z-skeleton zType="circle" zSize="48px" />
<z-skeleton zType="rectangle" zWidth="100%" zHeight="200px" />
```

---

#### **Slider** (`#slider`)

Range input slider.

**Key Properties:**

```typescript
zMin: number
zMax: number
zStep: number
zValue: number | number[] (for range)
zShowValue: boolean
```

**Usage Example:**

```html
<!-- Single value -->
<z-slider
  [zMin]="0"
  [zMax]="100"
  [zValue]="50"
  (zValueChange)="handleChange($event)"
/>

<!-- Range -->
<z-slider [zMin]="0" [zMax]="100" [zValue]="[25, 75]" zRange="true" />
```

---

#### **Switch** (`#switch`)

Toggle switch (on/off).

**Key Properties:**

```typescript
zSize: 'sm' | 'md' | 'lg';
zDisabled: boolean;
```

**Usage Example:**

```html
<z-switch [(ngModel)]="enabled">
  <label>Enable notifications</label>
</z-switch>
```

---

### T

#### **Table** (`#table`)

Data table with sorting, pagination, and selection.

**Features:**

- Column sorting
- Row selection
- Pagination
- Custom cell templates
- Responsive

**Usage Example:**

```typescript
// Component
readonly dataSource: Payment[] = [
  { id: '728ed52f', amount: 100, status: 'pending', email: 'm@example.com' },
  { id: '489e1d42', amount: 125, status: 'processing', email: 'example@gmail.com' },
];

readonly columns = ['id', 'status', 'email', 'amount'];
```

```html
<z-table [zDataSource]="dataSource" [zColumns]="columns">
  <ng-template zTableColumn="id" let-row> {{ row.id }} </ng-template>
  <ng-template zTableColumn="amount" let-row> ${{ row.amount }} </ng-template>
</z-table>
```

---

#### **Tabs** (`#tabs`)

Tab navigation for content sections.

**Variants:**

- Horizontal (default)
- Vertical
- With icons
- Closeable tabs

**Usage Example:**

```html
<z-tab-group>
  <z-tab zLabel="Overview" zValue="overview">
    <div>Overview content</div>
  </z-tab>
  <z-tab zLabel="Analytics" zValue="analytics">
    <div>Analytics content</div>
  </z-tab>
  <z-tab zLabel="Settings" zValue="settings">
    <div>Settings content</div>
  </z-tab>
</z-tab-group>
```

---

#### **Toast** (`#toast`)

Temporary notification messages.

**Service API (via ngx-sonner):**

```typescript
import { toast } from 'ngx-sonner';

toast.success('Operation completed!');
toast.error('Something went wrong');
toast.warning('Please be careful');
toast.info('FYI: New feature available');
toast.loading('Processing...');
```

**Usage Example:**

```typescript
showToast(): void {
  toast.success('Profile updated successfully!', {
    duration: 3000,
    position: 'top-right'
  });
}
```

---

#### **Toggle** (`#toggle`)

Single toggle button (pressed/not pressed).

**Usage Example:**

```html
<z-toggle [(ngModel)]="isActive">
  <z-icon zType="bold" />
</z-toggle>
```

---

#### **Toggle Group** (`#toggle-group`)

Multiple toggle buttons (toolbar style).

**Variants:**

- Single selection
- Multiple selection

**Usage Example:**

```typescript
// Component
items: ZardToggleGroupItem[] = [
  { value: 'bold', icon: 'bold', label: 'Bold', ariaLabel: 'Toggle bold' },
  { value: 'italic', icon: 'italic', label: 'Italic', ariaLabel: 'Toggle italic' },
  { value: 'underline', icon: 'underline', label: 'Underline', ariaLabel: 'Toggle underline' },
];
```

```html
<z-toggle-group
  [zItems]="items"
  zType="multiple"
  (zValueChange)="onToggleChange($event)"
/>
```

---

#### **Tooltip** (`#tooltip`)

Hover tooltips for additional context.

**Key Properties:**

```typescript
zTooltip: string | TemplateRef;
zPlacement: 'top' | 'bottom' | 'left' | 'right';
zShowArrow: boolean;
zDelay: number(ms);
```

**Usage Example:**

```html
<button
  z-button
  [zTooltip]="'Delete this item'"
  zPlacement="top"
  zShowArrow="true"
>
  <z-icon zType="trash" />
</button>
```

---

## 🎨 Common Patterns

### Form Integration

```typescript
// Reactive Forms
form = this._fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
});
```

```html
<form [formGroup]="form">
  <input z-input formControlName="name" />
  <input z-input type="email" formControlName="email" />
</form>
```

### Signal-based State

```typescript
// Component state with signals
readonly isLoading = signal(false);
readonly items = signal<Item[]>([]);
readonly selectedId = signal<string | null>(null);

// Computed values
readonly selectedItem = computed(() =>
  this.items().find(item => item.id === this.selectedId())
);
```

### Event Handling

```typescript
// Output events
handleClick(item: Item): void {
  console.log('Clicked:', item);
}

// Form submissions
onSubmit(): void {
  if (this.form.valid) {
    const formData = this.form.value;
    // Process form data
  }
}
```

## 🔧 Customization

### CSS Variables

All components use CSS variables for theming:

```scss
:host {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-destructive: #ef4444;
  --spacing-4: 1rem;
  --font-size-sm: 0.875rem;
  // ... etc
}
```

### Tailwind Classes

Components work seamlessly with Tailwind utility classes:

```html
<button z-button class="mt-4 w-full">Full Width Button</button>
```

## 📚 Additional Resources

- **Zardui Documentation**: [https://zardui.com](https://zardui.com)
- **Component Source**: `libs/ui/src/lib/zard/components/`
- **Lucide Icons**: [https://lucide.dev](https://lucide.dev)
- **Embla Carousel**: [https://www.embla-carousel.com](https://www.embla-carousel.com)

## 🐛 Testing Guidelines

When testing components:

1. **Visual Testing**: Check all variants (sizes, types, shapes)
2. **Interactive Testing**: Test hover states, clicks, keyboard navigation
3. **Form Testing**: Validate form integration and validation
4. **Responsive Testing**: Test on Desktop, Tablet, and Mobile viewports
5. **Accessibility**: Verify keyboard navigation and screen reader support

## 📝 Notes

- All components are **standalone** (no NgModules)
- Uses **Angular signals** exclusively (no decorators like `@Input()` or `@Output()`)
- **Reactive forms** only (no template-driven forms)
- **TypeScript 5.9+** required
- **Angular 21.1+** required

---

**Last Updated**: January 2026
**Component Count**: 40+
**Framework**: Angular 21.1 + Zardui
