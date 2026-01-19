# Zardui AI Reference Guide

**Version:** 2.0  
**Date:** January 20, 2026  
**Purpose:** Comprehensive AI-optimized reference for using Zardui components in Angular applications

---

## 🎯 Critical Rules for AI

1. **ALWAYS use Zardui components** - Never create custom UI components that Zardui provides
2. **Import from `@ihsan/ui`** - Never import directly from `@zardui/angular`
3. **Use signals** - All inputs/outputs must use Angular signals (`input()`, `output()`)
4. **Follow variant system** - Use `zType`, `zSize`, `zShape` for customization
5. **Standalone components** - All components are standalone (no NgModules)
6. **TypeScript strict typing** - All properties must be properly typed

---

## 📦 Installation & Import Pattern

### Import Pattern (MANDATORY)

```typescript
// ✅ CORRECT - Import from local wrapper
import {
  ZardButtonComponent,
  ZardInputDirective,
  ZardDialogService,
  ZardCardComponent,
} from '@ihsan/ui';

// ❌ WRONG - Never import directly
import { ZardButtonComponent } from '@zardui/angular';
```

### Component Registration

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    // ... other Zardui components
  ],
  templateUrl: './my-component.component.html',
})
export class MyComponent {}
```

---

## 🧩 Complete Component Catalog (43 Components)

### A - Accordion

**Purpose:** Collapsible content panels with expand/collapse functionality

**Import:**

```typescript
import { ZardAccordionComponent, ZardAccordionItemComponent } from '@ihsan/ui';
```

**Properties:**

- `zType: 'single' | 'multiple'` - Single or multiple panels can be expanded
- `zDefaultValue: string | string[]` - Default expanded items
- `zCollapsible: boolean` - Whether panels can be fully collapsed

**Usage:**

```html
<z-accordion zType="single" zDefaultValue="item-1" [zCollapsible]="true">
  <z-accordion-item zValue="item-1" zTitle="Section 1">
    <p>Content for section 1</p>
  </z-accordion-item>
  <z-accordion-item zValue="item-2" zTitle="Section 2">
    <p>Content for section 2</p>
  </z-accordion-item>
</z-accordion>
```

**When to use:**

- FAQ sections
- Settings panels
- Multi-step forms
- Content organization

---

### A - Alert

**Purpose:** Display important messages or notifications

**Import:**

```typescript
import { ZardAlertComponent } from '@ihsan/ui';
```

**Properties:**

- `zType: 'default' | 'destructive'` - Visual style (info or error)
- `zIcon: string | TemplateRef` - Icon to display
- `zTitle: string` - Alert title
- `zDescription: string | TemplateRef` - Alert message

**Usage:**

```html
<!-- Success Alert -->
<z-alert
  zIcon="circle-check"
  zTitle="Success"
  zDescription="Your changes have been saved"
>
</z-alert>

<!-- Error Alert -->
<z-alert
  zType="destructive"
  zIcon="circle-x"
  zTitle="Error"
  zDescription="Something went wrong"
>
</z-alert>
```

**When to use:**

- Form validation feedback
- Success/error messages
- Important notifications
- Warning messages

---

### A - Alert Dialog

**Purpose:** Modal dialog for critical confirmations (destructive actions)

**Import:**

```typescript
import { ZardAlertDialogService } from '@ihsan/ui';
```

**Service Injection:**

```typescript
private readonly _alertDialogService = inject(ZardAlertDialogService);
```

**API:**

```typescript
this._alertDialogService.confirm({
  zTitle: string,
  zDescription: string,
  zConfirmText: string,
  zCancelText: string,
});
```

**Usage:**

```typescript
// Component
deleteItem(): void {
  this._alertDialogService.confirm({
    zTitle: 'Delete Item',
    zDescription: 'This action cannot be undone. Are you sure?',
    zConfirmText: 'Delete',
    zCancelText: 'Cancel',
  });
}
```

```html
<!-- Template -->
<button z-button zType="destructive" (click)="deleteItem()">Delete</button>
```

**When to use:**

- Delete confirmations
- Destructive actions
- Critical decisions
- Irreversible operations

---

### A - Avatar

**Purpose:** Display user profile images with fallback initials

**Import:**

```typescript
import { ZardAvatarComponent, ZardAvatarGroupComponent } from '@ihsan/ui';
```

**Properties:**

- `zSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'` - Avatar size
- `zShape: 'circle' | 'square'` - Shape style
- `zSrc: string` - Image URL
- `zAlt: string` - Alt text for accessibility
- `zFallback: string` - Fallback initials when image fails

**Usage:**

```html
<!-- Single Avatar -->
<z-avatar
  zSize="lg"
  zShape="circle"
  zSrc="https://example.com/avatar.jpg"
  zAlt="User Name"
  zFallback="UN"
>
</z-avatar>

<!-- Avatar Group -->
<z-avatar-group zMax="3" zSize="md">
  <z-avatar zSrc="user1.jpg" zFallback="U1" />
  <z-avatar zSrc="user2.jpg" zFallback="U2" />
  <z-avatar zSrc="user3.jpg" zFallback="U3" />
  <z-avatar zSrc="user4.jpg" zFallback="U4" />
</z-avatar-group>
```

**When to use:**

- User profiles
- Comment sections
- Team member lists
- User mentions

---

### B - Badge

**Purpose:** Small status indicators or labels

**Import:**

```typescript
import { ZardBadgeComponent } from '@ihsan/ui';
```

**Properties:**

- `zType: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'`
- `zSize: 'sm' | 'md' | 'lg'`
- `zShape: 'default' | 'rounded' | 'pill'`

**Usage:**

```html
<!-- Status Badge -->
<z-badge zType="success" zSize="sm" zShape="pill">Active</z-badge>

<!-- Count Badge -->
<z-badge zType="primary" zShape="circle">5</z-badge>

<!-- Warning Badge -->
<z-badge zType="warning">Pending</z-badge>
```

**When to use:**

- Status indicators
- Notification counts
- Labels and tags
- Category markers

---

### B - Breadcrumb

**Purpose:** Navigation trail showing page hierarchy

**Import:**

```typescript
import { ZardBreadcrumbImports } from '@ihsan/ui';
```

**Components included:**

- `ZardBreadcrumbComponent`
- `ZardBreadcrumbItemComponent`
- `ZardBreadcrumbLinkComponent`
- `ZardBreadcrumbPageComponent`
- `ZardBreadcrumbSeparatorDirective`

**Properties:**

- `zSeparator: string | TemplateRef` - Separator between items (default: '/')

**Usage:**

```html
<z-breadcrumb>
  <z-breadcrumb-item>
    <a z-breadcrumb-link href="/">Home</a>
  </z-breadcrumb-item>
  <z-breadcrumb-item>
    <a z-breadcrumb-link href="/products">Products</a>
  </z-breadcrumb-item>
  <z-breadcrumb-item zCurrent="true">
    <span z-breadcrumb-page>Details</span>
  </z-breadcrumb-item>
</z-breadcrumb>
```

**When to use:**

- Multi-level navigation
- E-commerce product pages
- Documentation sites
- File system navigation

---

### B - Button

**Purpose:** Clickable actions and triggers

**Import:**

```typescript
import { ZardButtonComponent } from '@ihsan/ui';
```

**Properties:**

- `zType: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' | 'ghost' | 'link'`
- `zSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `zShape: 'default' | 'rounded' | 'pill' | 'circle'`
- `zLoading: boolean` - Show loading spinner
- `zDisabled: boolean` - Disable button

**Usage:**

```html
<!-- Primary Button -->
<button z-button zType="primary" zSize="md">Click Me</button>

<!-- Loading Button -->
<button z-button zType="primary" [zLoading]="isLoading">Save Changes</button>

<!-- Icon Button -->
<button z-button zType="ghost" zShape="circle">
  <z-icon name="settings" />
</button>

<!-- Destructive Button -->
<button z-button zType="destructive" zSize="sm">Delete</button>
```

**When to use:**

- Form submissions
- Actions and commands
- Navigation triggers
- Modal confirmations

---

### B - Button Group

**Purpose:** Group related buttons together

**Import:**

```typescript
import {
  ZardButtonGroupComponent,
  ZardButtonGroupDividerComponent,
} from '@ihsan/ui';
```

**Properties:**

- `zOrientation: 'horizontal' | 'vertical'` - Layout direction

**Usage:**

```html
<!-- Horizontal Group -->
<z-button-group zOrientation="horizontal">
  <button z-button zType="outline">Left</button>
  <button z-button zType="outline">Center</button>
  <button z-button zType="outline">Right</button>
</z-button-group>

<!-- With Dividers -->
<z-button-group>
  <button z-button zType="outline">Action 1</button>
  <z-button-group-divider />
  <button z-button zType="outline">Action 2</button>
</z-button-group>
```

**When to use:**

- Text alignment controls
- View mode toggles
- Toolbar actions
- Pagination controls

---

### C - Calendar

**Purpose:** Date picker with single or range selection

**Import:**

```typescript
import { ZardCalendarComponent, CalendarValue } from '@ihsan/ui';
```

**Properties:**

- `zMode: 'single' | 'range'` - Selection mode
- `zValue: Date | Date[]` - Selected date(s)
- `zMin: Date` - Minimum selectable date
- `zMax: Date` - Maximum selectable date
- `zDisabledDates: (date: Date) => boolean` - Function to disable specific dates
- `zSize: 'sm' | 'md' | 'lg'` - Calendar size

**Events:**

- `(zValueChange): Date | Date[]` - Emitted when date selection changes

**Usage:**

```typescript
// Component
readonly selectedDate = signal<Date | null>(null);
readonly minDate = new Date();
readonly maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

onDateChange(date: Date | null): void {
  this.selectedDate.set(date);
}
```

```html
<!-- Single Date Selection -->
<z-calendar
  zMode="single"
  [zValue]="selectedDate()"
  [zMin]="minDate"
  [zMax]="maxDate"
  (zValueChange)="onDateChange($event)"
>
</z-calendar>

<!-- Range Selection -->
<z-calendar
  zMode="range"
  [zValue]="dateRange()"
  (zValueChange)="dateRange.set($event)"
>
</z-calendar>
```

**When to use:**

- Date input fields
- Booking systems
- Date range filters
- Event scheduling

---

### C - Card

**Purpose:** Container for content with optional header, footer, and padding

**Import:**

```typescript
import { ZardCardComponent } from '@ihsan/ui';
```

**Properties:**

- `zPadding: 'none' | 'sm' | 'md' | 'lg'` - Internal padding
- `zElevation: 'none' | 'sm' | 'md' | 'lg'` - Shadow depth

**Usage:**

```html
<!-- Basic Card -->
<z-card zPadding="md">
  <header>Card Title</header>
  <p>Card content goes here</p>
  <footer>Card Footer</footer>
</z-card>

<!-- Card with custom styling -->
<z-card zPadding="lg" zElevation="md">
  <div class="card-header">
    <h2>User Profile</h2>
  </div>
  <div class="card-body">
    <p>User information</p>
  </div>
</z-card>
```

**When to use:**

- Dashboard widgets
- Product cards
- User profiles
- Content sections

---

### C - Carousel

**Purpose:** Image/content slider with navigation controls

**Import:**

```typescript
import {
  ZardCarouselComponent,
  ZardCarouselContentComponent,
  ZardCarouselItemComponent,
  ZardCarouselPluginsService,
} from '@ihsan/ui';
import { type EmblaCarouselType, type EmblaPluginType } from 'embla-carousel';
```

**Properties:**

- `zOptions: { loop: boolean; align: 'start' | 'center' | 'end' }` - Carousel config
- `zPlugins: EmblaPluginType[]` - Embla plugins (autoplay, etc.)

**Events:**

- `(zCarouselInit): EmblaCarouselType` - Emitted when carousel initializes
- `(zSlideChange): void` - Emitted when slide changes

**Usage:**

```typescript
// Component
readonly carouselOptions = { loop: true, align: 'start' as const };
readonly plugins: EmblaPluginType[] = [];

onCarouselInit(api: EmblaCarouselType): void {
  // Handle carousel initialization
}

onSlideChange(): void {
  // Handle slide change
}
```

```html
<z-carousel
  [zOptions]="carouselOptions"
  [zPlugins]="plugins"
  (zCarouselInit)="onCarouselInit($event)"
  (zSlideChange)="onSlideChange()"
>
  <z-carousel-content>
    <z-carousel-item>
      <img src="slide1.jpg" alt="Slide 1" />
    </z-carousel-item>
    <z-carousel-item>
      <img src="slide2.jpg" alt="Slide 2" />
    </z-carousel-item>
  </z-carousel-content>
</z-carousel>
```

**When to use:**

- Image galleries
- Product showcases
- Hero sections
- Testimonials

---

### C - Checkbox

**Purpose:** Binary selection (checked/unchecked)

**Import:**

```typescript
import { ZardCheckboxComponent } from '@ihsan/ui';
```

**Properties:**

- `zDisabled: boolean` - Disable checkbox
- `zId: string` - Unique identifier

**Form Integration:**

```typescript
// Component
readonly form = inject(FormBuilder).group({
  agree: [false, Validators.requiredTrue],
});
```

```html
<!-- Standalone -->
<z-checkbox [(ngModel)]="checked" zId="terms">
  I agree to terms and conditions
</z-checkbox>

<!-- With Reactive Forms -->
<z-checkbox formControlName="agree" zId="agree"> Accept terms </z-checkbox>
```

**When to use:**

- Form agreements
- Multi-select lists
- Feature toggles
- Task lists

---

### C - Combobox

**Purpose:** Searchable dropdown with autocomplete

**Import:**

```typescript
import {
  ZardComboboxComponent,
  ZardComboboxOption,
  ZardComboboxGroup,
} from '@ihsan/ui';
```

**Types:**

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

**Usage:**

```typescript
// Component
readonly frameworkControl = new FormControl<string | null>(null);
readonly frameworks: ZardComboboxOption[] = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
];

onSelect(option: ZardComboboxOption): void {
  this.frameworkControl.setValue(option.value);
}
```

```html
<z-combobox
  [zFormControl]="frameworkControl"
  [zOptions]="frameworks"
  zPlaceholder="Select framework..."
  (zSelect)="onSelect($event)"
>
</z-combobox>

<!-- Grouped Options -->
<z-combobox
  [zFormControl]="techControl"
  [zGroups]="techGroups"
  zPlaceholder="Select technology..."
>
</z-combobox>
```

**When to use:**

- Framework/library selection
- Country/city pickers
- Tag selection
- Searchable dropdowns

---

### C - Command

**Purpose:** Command palette for quick actions

**Import:**

```typescript
import {
  ZardCommandComponent,
  ZardCommandInputComponent,
  ZardCommandListComponent,
  ZardCommandOptionComponent,
  ZardCommandOptionGroupComponent,
  ZardCommandDividerComponent,
  ZardCommandEmptyComponent,
  ZardCommandOption,
} from '@ihsan/ui';
```

**Types:**

```typescript
interface ZardCommandOption {
  value: string;
  label: string;
  icon?: string;
  shortcut?: string;
}
```

**Usage:**

```typescript
// Component
handleCommand(option: ZardCommandOption): void {
  console.log('Command selected:', option.value);
}
```

```html
<z-command>
  <z-command-input zPlaceholder="Type a command..." />
  <z-command-list>
    <z-command-option-group zHeading="Actions">
      <z-command-option
        zValue="new"
        zLabel="New File"
        zIcon="file-plus"
        (zSelect)="handleCommand($event)"
      >
      </z-command-option>
      <z-command-option
        zValue="save"
        zLabel="Save"
        zIcon="save"
        zShortcut="Ctrl+S"
      >
      </z-command-option>
    </z-command-option-group>

    <z-command-divider />

    <z-command-option-group zHeading="Navigation">
      <z-command-option zValue="home" zLabel="Go Home" zIcon="home">
      </z-command-option>
    </z-command-option-group>

    <z-command-empty>No results found</z-command-empty>
  </z-command-list>
</z-command>
```

**When to use:**

- Keyboard shortcuts
- Quick actions
- Search interfaces
- Admin panels

---

### D - Date Picker

**Purpose:** Date input field with calendar popup

**Import:**

```typescript
import { ZardDatePickerComponent } from '@ihsan/ui';
```

**Properties:**

- Same as Calendar component
- `zPlaceholder: string` - Placeholder text
- `zFormat: string` - Date format string

**Usage:**

```html
<z-date-picker
  zMode="single"
  [zValue]="selectedDate()"
  zPlaceholder="Pick a date"
  (zValueChange)="selectedDate.set($event)"
>
</z-date-picker>
```

**When to use:**

- Form date inputs
- Birthday fields
- Appointment booking
- Date filters

---

### D - Dialog

**Purpose:** Modal dialogs for complex interactions

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
// Component
openDialog(): void {
  this._dialogService.open(MyDialogComponent, {
    data: { name: 'John', username: 'john_doe' },
    zSize: 'md',
    zTitle: 'User Details',
  });
}

// Dialog Component
export class MyDialogComponent {
  protected readonly _data = inject<MyData>(Z_MODAL_DATA);
}
```

```html
<!-- Dialog Component Template -->
<div class="dialog-content">
  <h2>{{ _data.name }}</h2>
  <p>Username: {{ _data.username }}</p>
</div>
```

**When to use:**

- Complex forms
- Multi-step workflows
- Image previews
- User details

---

### D - Divider

**Purpose:** Separator lines between content sections

**Import:**

```typescript
import { ZardDividerComponent } from '@ihsan/ui';
```

**Properties:**

- `zOrientation: 'horizontal' | 'vertical'` - Divider direction

**Usage:**

```html
<!-- Horizontal -->
<div>Section 1</div>
<z-divider zOrientation="horizontal" />
<div>Section 2</div>

<!-- Vertical -->
<div class="flex">
  <div>Column 1</div>
  <z-divider zOrientation="vertical" />
  <div>Column 2</div>
</div>
```

**When to use:**

- Content separation
- Menu items
- Layout sections
- List items

---

### D - Dropdown (Menu)

**Purpose:** Context menus and dropdown actions

**Import:**

```typescript
import { ZardDropdownImports } from '@ihsan/ui';
```

**Components included:**

- `ZardDropdownDirective`
- `ZardDropdownMenuContentComponent`
- `ZardDropdownMenuItemComponent`

**Usage:**

```html
<button z-button zDropdown>Actions</button>
<z-dropdown-menu-content>
  <z-dropdown-menu-item (click)="edit()">
    <z-icon name="edit" />
    Edit
  </z-dropdown-menu-item>
  <z-dropdown-menu-item (click)="delete()">
    <z-icon name="trash" />
    Delete
  </z-dropdown-menu-item>
</z-dropdown-menu-content>
```

**When to use:**

- Action menus
- Context menus
- User profile menus
- Settings dropdowns

---

### E - Empty

**Purpose:** Empty state placeholders

**Import:**

```typescript
import { ZardEmptyComponent } from '@ihsan/ui';
```

**Properties:**

- `zIcon: string` - Icon to display
- `zTitle: string` - Empty state title
- `zDescription: string` - Description text

**Usage:**

```html
<z-empty
  zIcon="inbox"
  zTitle="No messages"
  zDescription="You don't have any messages yet"
>
  <button z-button zType="primary">Send Message</button>
</z-empty>
```

**When to use:**

- Empty lists
- No search results
- No data states
- First-time experiences

---

### F - Form

**Purpose:** Form field components with labels and validation

**Import:**

```typescript
import { ZardFormImports } from '@ihsan/ui';
```

**Components included:**

- `ZardFormFieldComponent`
- `ZardFormLabelDirective`
- `ZardFormControlDirective`
- `ZardFormDescriptionDirective`
- `ZardFormErrorDirective`

**Usage:**

```typescript
// Component
readonly form = inject(FormBuilder).group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
});
```

```html
<form [formGroup]="form">
  <z-form-field>
    <label z-form-label for="email">Email</label>
    <input
      z-input
      zId="email"
      type="email"
      formControlName="email"
      placeholder="Enter your email"
    />
    <span z-form-description>We'll never share your email</span>
    <span z-form-error *ngIf="form.get('email')?.hasError('required')">
      Email is required
    </span>
    <span z-form-error *ngIf="form.get('email')?.hasError('email')">
      Invalid email format
    </span>
  </z-form-field>

  <z-form-field>
    <label z-form-label for="password">Password</label>
    <input
      z-input
      zId="password"
      type="password"
      formControlName="password"
      placeholder="Enter password"
    />
    <span z-form-error *ngIf="form.get('password')?.hasError('minlength')">
      Password must be at least 8 characters
    </span>
  </z-form-field>
</form>
```

**When to use:**

- Login/signup forms
- Settings forms
- Multi-field forms
- Form validation

---

### I - Icon

**Purpose:** SVG icons from Lucide icon library

**Import:**

```typescript
import { ZardIconComponent, ZARD_ICONS } from '@ihsan/ui';
```

**Properties:**

- `name: string` - Icon name from Lucide library
- `size: number | string` - Icon size (default: 24)
- `strokeWidth: number` - Stroke width (default: 2)
- `color: string` - Icon color

**Usage:**

```html
<!-- Basic Icon -->
<z-icon name="home" />

<!-- Sized Icon -->
<z-icon name="settings" [size]="32" />

<!-- Colored Icon -->
<z-icon name="check" color="green" />

<!-- In Button -->
<button z-button zType="primary">
  <z-icon name="plus" />
  Add New
</button>
```

**Available Icons:** See [Lucide Icons](https://lucide.dev/icons/)

**When to use:**

- Button icons
- Navigation icons
- Status indicators
- Visual enhancement

---

### I - Input

**Purpose:** Text input fields

**Import:**

```typescript
import { ZardInputDirective } from '@ihsan/ui';
```

**Properties:**

- `zSize: 'sm' | 'md' | 'lg'` - Input size
- `zId: string` - Unique identifier
- `type: string` - Input type (text, email, password, etc.)
- `placeholder: string` - Placeholder text
- `disabled: boolean` - Disable input

**Usage:**

```html
<!-- Basic Input -->
<input z-input zId="name" type="text" placeholder="Enter name" />

<!-- Sized Input -->
<input z-input zSize="lg" zId="email" type="email" />

<!-- With Form Control -->
<input z-input zId="username" formControlName="username" />
```

**When to use:**

- Form fields
- Search boxes
- Text entry
- User input

---

### I - Input Group

**Purpose:** Input fields with prefix/suffix addons

**Import:**

```typescript
import { ZardInputGroupComponent } from '@ihsan/ui';
```

**Usage:**

```html
<!-- With Prefix -->
<z-input-group>
  <span z-input-prefix>https://</span>
  <input z-input zId="url" placeholder="example.com" />
</z-input-group>

<!-- With Suffix -->
<z-input-group>
  <input z-input zId="price" type="number" placeholder="0.00" />
  <span z-input-suffix>USD</span>
</z-input-group>

<!-- With Icon -->
<z-input-group>
  <z-icon name="search" z-input-prefix />
  <input z-input zId="search" placeholder="Search..." />
</z-input-group>
```

**When to use:**

- URL inputs
- Price fields
- Search boxes
- Unit inputs

---

### K - Kbd

**Purpose:** Keyboard key indicators

**Import:**

```typescript
import { ZardKbdComponent, ZardKbdGroupComponent } from '@ihsan/ui';
```

**Usage:**

```html
<!-- Single Key -->
<z-kbd>Ctrl</z-kbd>

<!-- Key Combination -->
<z-kbd-group>
  <z-kbd>Ctrl</z-kbd>
  <z-kbd>S</z-kbd>
</z-kbd-group>

<!-- In Documentation -->
<p>Press <z-kbd>Esc</z-kbd> to close</p>
```

**When to use:**

- Keyboard shortcuts
- Documentation
- Help text
- Command palettes

---

### L - Loader

**Purpose:** Loading spinners and indicators

**Import:**

```typescript
import { ZardLoaderComponent } from '@ihsan/ui';
```

**Properties:**

- `zSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` - Loader size
- `zType: 'spinner' | 'dots' | 'pulse'` - Animation type

**Usage:**

```html
<!-- Spinner -->
<z-loader zSize="md" zType="spinner" />

<!-- Dots -->
<z-loader zSize="lg" zType="dots" />

<!-- In Button -->
<button z-button [zLoading]="isLoading">Save Changes</button>
```

**When to use:**

- Loading states
- Async operations
- Data fetching
- Processing indicators

---

### M - Menu

**Purpose:** Navigation menus and menu bars

**Import:**

```typescript
import { ZardMenuImports } from '@ihsan/ui';
```

**Components included:**

- `ZardMenubarComponent`
- `ZardMenubarMenuComponent`
- `ZardMenubarTriggerComponent`
- `ZardMenubarContentComponent`
- `ZardMenubarItemComponent`
- `ZardMenubarDividerComponent`

**Usage:**

```html
<z-menubar>
  <z-menubar-menu>
    <button z-menubar-trigger>File</button>
    <z-menubar-content>
      <z-menubar-item (click)="newFile()">
        <z-icon name="file-plus" />
        New File
      </z-menubar-item>
      <z-menubar-item (click)="open()">
        <z-icon name="folder-open" />
        Open
      </z-menubar-item>
      <z-menubar-divider />
      <z-menubar-item (click)="exit()">Exit</z-menubar-item>
    </z-menubar-content>
  </z-menubar-menu>
</z-menubar>
```

**When to use:**

- Application menus
- Navigation bars
- Context menus
- Action menus

---

### P - Pagination

**Purpose:** Page navigation controls

**Import:**

```typescript
import { ZardPaginationImports } from '@ihsan/ui';
```

**Components included:**

- `ZardPaginationComponent`
- `ZardPaginationContentComponent`
- `ZardPaginationItemComponent`

**Usage:**

```typescript
// Component
readonly currentPage = signal(1);
readonly totalPages = 10;

goToPage(page: number): void {
  this.currentPage.set(page);
}
```

```html
<z-pagination
  [zTotal]="totalPages"
  [zCurrent]="currentPage()"
  (zPageChange)="goToPage($event)"
>
</z-pagination>
```

**When to use:**

- Data tables
- Search results
- Blog posts
- Product listings

---

### P - Popover

**Purpose:** Floating overlays for additional content

**Import:**

```typescript
import { ZardPopoverComponent, ZardPopoverDirective } from '@ihsan/ui';
```

**Properties:**

- `zPosition: 'top' | 'bottom' | 'left' | 'right'` - Popover position
- `zAlign: 'start' | 'center' | 'end'` - Alignment

**Usage:**

```html
<button z-button zPopover>More Info</button>
<z-popover zPosition="top" zAlign="center">
  <div class="popover-content">
    <h3>Additional Information</h3>
    <p>This is extra content in the popover</p>
  </div>
</z-popover>
```

**When to use:**

- Help text
- Additional info
- User profiles
- Color pickers

---

### P - Progress Bar

**Purpose:** Progress indicators for tasks

**Import:**

```typescript
import { ZardProgressBarComponent } from '@ihsan/ui';
```

**Properties:**

- `zValue: number` - Progress value (0-100)
- `zMax: number` - Maximum value (default: 100)
- `zSize: 'sm' | 'md' | 'lg'` - Bar size

**Usage:**

```html
<!-- Basic Progress -->
<z-progress-bar [zValue]="66" />

<!-- With Label -->
<z-progress-bar [zValue]="progress()"> {{ progress() }}% </z-progress-bar>

<!-- Sized Progress -->
<z-progress-bar [zValue]="75" zSize="lg" />
```

**When to use:**

- File uploads
- Form completion
- Loading progress
- Task completion

---

### R - Radio

**Purpose:** Single selection from multiple options

**Import:**

```typescript
import { ZardRadioComponent } from '@ihsan/ui';
```

**Usage:**

```typescript
// Component
readonly selectedOption = signal('option1');
```

```html
<!-- Radio Group -->
<div class="radio-group">
  <z-radio
    name="options"
    value="option1"
    [(ngModel)]="selectedOption"
    zId="opt1"
  >
    Option 1
  </z-radio>

  <z-radio
    name="options"
    value="option2"
    [(ngModel)]="selectedOption"
    zId="opt2"
  >
    Option 2
  </z-radio>

  <z-radio
    name="options"
    value="option3"
    [(ngModel)]="selectedOption"
    zId="opt3"
  >
    Option 3
  </z-radio>
</div>
```

**When to use:**

- Form options
- Settings selection
- Multiple choice
- Payment methods

---

### R - Resizable

**Purpose:** Resizable panels and containers

**Import:**

```typescript
import {
  ZardResizableComponent,
  ZardResizablePanelComponent,
  ZardResizableHandleComponent,
} from '@ihsan/ui';
```

**Usage:**

```html
<z-resizable zOrientation="horizontal">
  <z-resizable-panel zDefaultSize="50">
    <div>Left Panel</div>
  </z-resizable-panel>

  <z-resizable-handle />

  <z-resizable-panel zDefaultSize="50">
    <div>Right Panel</div>
  </z-resizable-panel>
</z-resizable>
```

**When to use:**

- Split panes
- Code editors
- File explorers
- Dashboard layouts

---

### S - Segmented

**Purpose:** Toggle between multiple options

**Import:**

```typescript
import { ZardSegmentedComponent } from '@ihsan/ui';
```

**Usage:**

```typescript
// Component
readonly selectedView = signal('grid');
readonly viewOptions = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
];
```

```html
<z-segmented
  [zOptions]="viewOptions"
  [zValue]="selectedView()"
  (zValueChange)="selectedView.set($event)"
>
</z-segmented>
```

**When to use:**

- View toggles
- Filter options
- Display modes
- Spacing controls

---

### S - Select

**Purpose:** Dropdown selection

**Import:**

```typescript
import { ZardSelectComponent, ZardSelectItemComponent } from '@ihsan/ui';
```

**Usage:**

```html
<z-select zPlaceholder="Select option" [(ngModel)]="selectedValue">
  <z-select-item value="option1">Option 1</z-select-item>
  <z-select-item value="option2">Option 2</z-select-item>
  <z-select-item value="option3">Option 3</z-select-item>
</z-select>
```

**When to use:**

- Form dropdowns
- Country selection
- Category filters
- Sort options

---

### S - Sheet

**Purpose:** Side panels and drawers

**Import:**

```typescript
import { ZardSheetService } from '@ihsan/ui';
```

**Service Injection:**

```typescript
private readonly _sheetService = inject(ZardSheetService);
```

**Usage:**

```typescript
// Component
openSheet(): void {
  this._sheetService.open(MySheetComponent, {
    data: { userId: 123 },
    zPosition: 'right',
    zSize: 'md',
  });
}
```

**Properties:**

- `zPosition: 'right' | 'left' | 'top' | 'bottom'` - Sheet position
- `zSize: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Sheet size

**When to use:**

- Filters panel
- Settings drawer
- User profile
- Shopping cart

---

### S - Skeleton

**Purpose:** Loading placeholders

**Import:**

```typescript
import { ZardSkeletonComponent } from '@ihsan/ui';
```

**Properties:**

- `zShape: 'rectangle' | 'circle' | 'text'` - Shape type
- `zWidth: string` - Width (CSS value)
- `zHeight: string` - Height (CSS value)

**Usage:**

```html
<!-- Text Skeleton -->
<z-skeleton zShape="text" zWidth="100%" />

<!-- Circle Avatar -->
<z-skeleton zShape="circle" zWidth="48px" zHeight="48px" />

<!-- Card Skeleton -->
<z-card>
  <z-skeleton zShape="rectangle" zWidth="100%" zHeight="200px" />
  <z-skeleton zShape="text" zWidth="80%" />
  <z-skeleton zShape="text" zWidth="60%" />
</z-card>
```

**When to use:**

- Loading states
- Content placeholders
- Initial page load
- Lazy loading

---

### S - Slider

**Purpose:** Range input control

**Import:**

```typescript
import { ZardSliderComponent } from '@ihsan/ui';
```

**Properties:**

- `zMin: number` - Minimum value
- `zMax: number` - Maximum value
- `zStep: number` - Step increment
- `zValue: number | number[]` - Current value(s)

**Usage:**

```html
<!-- Single Value -->
<z-slider [zMin]="0" [zMax]="100" [zStep]="1" [(ngModel)]="volume"> </z-slider>

<!-- Range Slider -->
<z-slider [zMin]="0" [zMax]="1000" [zStep]="10" [(ngModel)]="priceRange">
</z-slider>
```

**When to use:**

- Volume controls
- Price ranges
- Brightness settings
- Filter ranges

---

### S - Switch

**Purpose:** Toggle switch control

**Import:**

```typescript
import { ZardSwitchComponent } from '@ihsan/ui';
```

**Properties:**

- `zDisabled: boolean` - Disable switch
- `zId: string` - Unique identifier

**Usage:**

```html
<!-- Basic Switch -->
<z-switch [(ngModel)]="isEnabled" zId="notifications">
  Enable Notifications
</z-switch>

<!-- With Form Control -->
<z-switch formControlName="darkMode" zId="darkMode"> Dark Mode </z-switch>
```

**When to use:**

- Feature toggles
- Settings
- Enable/disable options
- Preferences

---

### T - Table

**Purpose:** Data tables with sorting and selection

**Import:**

```typescript
import { ZardTableComponent } from '@ihsan/ui';
```

**Usage:**

```typescript
// Component
readonly dataSource = signal<User[]>([
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
]);

readonly columns = ['id', 'name', 'email', 'actions'];
```

```html
<z-table [zDataSource]="dataSource()" [zColumns]="columns">
  <ng-template #headerTemplate let-column>
    <th>{{ column | titlecase }}</th>
  </ng-template>

  <ng-template #rowTemplate let-row>
    <td>{{ row.id }}</td>
    <td>{{ row.name }}</td>
    <td>{{ row.email }}</td>
    <td>
      <button z-button zSize="sm" (click)="edit(row)">Edit</button>
    </td>
  </ng-template>
</z-table>
```

**When to use:**

- Data grids
- User lists
- Product tables
- Reports

---

### T - Tabs

**Purpose:** Tab navigation and content panels

**Import:**

```typescript
import { ZardTabGroupComponent, ZardTabComponent } from '@ihsan/ui';
```

**Usage:**

```html
<z-tab-group>
  <z-tab zLabel="Overview">
    <p>Overview content</p>
  </z-tab>

  <z-tab zLabel="Details">
    <p>Details content</p>
  </z-tab>

  <z-tab zLabel="Settings">
    <p>Settings content</p>
  </z-tab>
</z-tab-group>
```

**When to use:**

- Multi-section content
- Settings pages
- Product details
- User profiles

---

### T - Toast

**Purpose:** Temporary notification messages

**Import:**

```typescript
import { toast } from 'ngx-sonner';
```

**Usage:**

```typescript
// Component
showSuccess(): void {
  toast.success('Changes saved successfully!');
}

showError(): void {
  toast.error('Something went wrong');
}

showInfo(): void {
  toast.info('New update available');
}

showWarning(): void {
  toast.warning('This action cannot be undone');
}

showCustom(): void {
  toast('Custom message', {
    description: 'Additional details',
    duration: 5000,
  });
}
```

**When to use:**

- Success messages
- Error notifications
- Info alerts
- Temporary feedback

---

### T - Toggle

**Purpose:** Toggle button control

**Import:**

```typescript
import { ZardToggleComponent } from '@ihsan/ui';
```

**Properties:**

- `zPressed: boolean` - Toggle state
- `zDisabled: boolean` - Disable toggle

**Usage:**

```html
<z-toggle [(zPressed)]="isBold">
  <z-icon name="bold" />
</z-toggle>
```

**When to use:**

- Text formatting
- View options
- Feature toggles
- Toolbar buttons

---

### T - Toggle Group

**Purpose:** Group of toggle buttons (single or multiple selection)

**Import:**

```typescript
import { ZardToggleGroupComponent, ZardToggleGroupItem } from '@ihsan/ui';
```

**Types:**

```typescript
interface ZardToggleGroupItem {
  value: string;
  label: string;
  icon?: string;
  ariaLabel?: string;
}
```

**Usage:**

```typescript
// Component
readonly items: ZardToggleGroupItem[] = [
  { value: 'left', label: 'Left', icon: 'align-left' },
  { value: 'center', label: 'Center', icon: 'align-center' },
  { value: 'right', label: 'Right', icon: 'align-right' },
];

onToggleChange(value: string | string[]): void {
  console.log('Selected:', value);
}
```

```html
<!-- Single Selection -->
<z-toggle-group
  zType="single"
  [zItems]="items"
  (zValueChange)="onToggleChange($event)"
>
</z-toggle-group>

<!-- Multiple Selection -->
<z-toggle-group
  zType="multiple"
  [zItems]="items"
  (zValueChange)="onToggleChange($event)"
>
</z-toggle-group>
```

**When to use:**

- Text alignment
- View modes
- Filter options
- Toolbar controls

---

### T - Tooltip

**Purpose:** Hover tooltips for additional information

**Import:**

```typescript
import { ZardTooltipDirective } from '@ihsan/ui';
```

**Properties:**

- `zTooltip: string | TemplateRef` - Tooltip content
- `zPosition: 'top' | 'bottom' | 'left' | 'right'` - Position
- `zShowArrow: boolean` - Show arrow (default: true)

**Usage:**

```html
<!-- Basic Tooltip -->
<button z-button zTooltip="Click to save">Save</button>

<!-- Positioned Tooltip -->
<button z-button zTooltip="Delete item" zPosition="top">
  <z-icon name="trash" />
</button>

<!-- No Arrow -->
<span zTooltip="Additional info" [zShowArrow]="false"> Hover me </span>
```

**When to use:**

- Icon explanations
- Help text
- Additional context
- Keyboard shortcuts

---

## 🎨 Variant System

### Common Variant Properties

**zType** - Visual style variants:

- `default` - Standard appearance
- `primary` - Primary brand color
- `secondary` - Secondary color
- `success` - Success/positive state
- `warning` - Warning/caution state
- `destructive` - Danger/error state
- `outline` - Outlined style
- `ghost` - Minimal style
- `link` - Link-like appearance

**zSize** - Size variants:

- `xs` - Extra small
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large
- `2xl` - Double extra large

**zShape** - Shape variants:

- `default` - Standard shape
- `rounded` - Slightly rounded
- `pill` - Fully rounded
- `circle` - Circular (for icons)
- `square` - Square shape

---

## 🔧 Form Integration Patterns

### Reactive Forms Pattern

```typescript
// Component
import { FormBuilder, Validators } from '@angular/forms';
import { inject } from '@angular/core';

export class MyFormComponent {
  private readonly _fb = inject(FormBuilder);

  readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false],
  });

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <z-form-field>
    <label z-form-label for="email">Email</label>
    <input z-input zId="email" formControlName="email" />
    <span z-form-error *ngIf="form.get('email')?.hasError('required')">
      Email is required
    </span>
  </z-form-field>

  <z-form-field>
    <label z-form-label for="password">Password</label>
    <input z-input zId="password" type="password" formControlName="password" />
  </z-form-field>

  <z-checkbox formControlName="remember" zId="remember">
    Remember me
  </z-checkbox>

  <button z-button zType="primary" type="submit" [disabled]="!form.valid">
    Login
  </button>
</form>
```

### Template-Driven Forms (NgModel)

```typescript
// Component
export class MyComponent {
  readonly email = signal('');
  readonly password = signal('');
  readonly remember = signal(false);
}
```

```html
<input z-input [(ngModel)]="email" zId="email" />
<input z-input [(ngModel)]="password" type="password" zId="password" />
<z-checkbox [(ngModel)]="remember" zId="remember">Remember</z-checkbox>
```

---

## 🎯 Service-Based Components

### Dialog Service

```typescript
import { ZardDialogService, Z_MODAL_DATA } from '@ihsan/ui';

// Parent Component
export class ParentComponent {
  private readonly _dialogService = inject(ZardDialogService);

  openDialog(): void {
    this._dialogService.open(UserDialogComponent, {
      data: { userId: 123, name: 'John' },
      zSize: 'md',
      zTitle: 'User Details',
    });
  }
}

// Dialog Component
export class UserDialogComponent {
  protected readonly _data = inject<{ userId: number; name: string }>(
    Z_MODAL_DATA
  );
}
```

### Sheet Service

```typescript
import { ZardSheetService } from '@ihsan/ui';

export class MyComponent {
  private readonly _sheetService = inject(ZardSheetService);

  openSheet(): void {
    this._sheetService.open(FiltersSheetComponent, {
      data: { currentFilters: [] },
      zPosition: 'right',
      zSize: 'md',
    });
  }
}
```

### Alert Dialog Service

```typescript
import { ZardAlertDialogService } from '@ihsan/ui';

export class MyComponent {
  private readonly _alertDialogService = inject(ZardAlertDialogService);

  confirmDelete(): void {
    this._alertDialogService.confirm({
      zTitle: 'Delete Item',
      zDescription: 'Are you sure? This cannot be undone.',
      zConfirmText: 'Delete',
      zCancelText: 'Cancel',
    });
  }
}
```

---

## 🏗️ Component Composition Patterns

### Card with Avatar and Badge

```html
<z-card zPadding="md">
  <div class="flex items-center gap-4">
    <z-avatar zSize="lg" zSrc="user.jpg" zFallback="JD" />
    <div>
      <h3>John Doe</h3>
      <z-badge zType="success" zSize="sm">Online</z-badge>
    </div>
  </div>
</z-card>
```

### Button with Icon and Loading

```html
<button z-button zType="primary" [zLoading]="isSaving()">
  <z-icon name="save" *ngIf="!isSaving()" />
  Save Changes
</button>
```

### Input with Validation

```html
<z-form-field>
  <label z-form-label for="email">Email</label>
  <z-input-group>
    <z-icon name="mail" z-input-prefix />
    <input z-input zId="email" formControlName="email" />
  </z-input-group>
  <span z-form-error *ngIf="form.get('email')?.hasError('required')">
    Required
  </span>
  <span z-form-error *ngIf="form.get('email')?.hasError('email')">
    Invalid email
  </span>
</z-form-field>
```

### Dropdown Menu with Icons

```html
<button z-button zDropdown>
  Actions
  <z-icon name="chevron-down" />
</button>
<z-dropdown-menu-content>
  <z-dropdown-menu-item (click)="edit()">
    <z-icon name="edit" />
    Edit
  </z-dropdown-menu-item>
  <z-dropdown-menu-item (click)="duplicate()">
    <z-icon name="copy" />
    Duplicate
  </z-dropdown-menu-item>
  <z-dropdown-menu-item (click)="delete()">
    <z-icon name="trash" />
    Delete
  </z-dropdown-menu-item>
</z-dropdown-menu-content>
```

---

## 📋 Complete Import Reference

### Individual Components

```typescript
import {
  // Layout
  ZardAccordionComponent,
  ZardAccordionItemComponent,
  ZardCardComponent,
  ZardDividerComponent,
  ZardResizableComponent,
  ZardResizablePanelComponent,
  ZardResizableHandleComponent,
  ZardTabGroupComponent,
  ZardTabComponent,

  // Navigation
  ZardBreadcrumbImports, // Import group
  ZardMenuImports, // Import group
  ZardPaginationComponent,
  ZardPaginationImports, // Import group
  ZardSegmentedComponent,

  // Forms
  ZardButtonComponent,
  ZardButtonGroupComponent,
  ZardButtonGroupDividerComponent,
  ZardCalendarComponent,
  ZardCheckboxComponent,
  ZardComboboxComponent,
  ZardDatePickerComponent,
  ZardFormImports, // Import group
  ZardInputDirective,
  ZardInputGroupComponent,
  ZardRadioComponent,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardSliderComponent,
  ZardSwitchComponent,
  ZardToggleComponent,
  ZardToggleGroupComponent,

  // Data Display
  ZardAvatarComponent,
  ZardAvatarGroupComponent,
  ZardBadgeComponent,
  ZardEmptyComponent,
  ZardIconComponent,
  ZardKbdComponent,
  ZardKbdGroupComponent,
  ZardProgressBarComponent,
  ZardSkeletonComponent,
  ZardTableComponent,

  // Feedback
  ZardAlertComponent,
  ZardAlertDialogService,
  ZardDialogService,
  ZardLoaderComponent,
  ZardPopoverComponent,
  ZardPopoverDirective,
  ZardTooltipDirective,

  // Advanced
  ZardCarouselComponent,
  ZardCarouselContentComponent,
  ZardCarouselItemComponent,
  ZardCarouselPluginsService,
  ZardCommandComponent,
  ZardCommandInputComponent,
  ZardCommandListComponent,
  ZardCommandOptionComponent,
  ZardCommandOptionGroupComponent,
  ZardCommandDividerComponent,
  ZardCommandEmptyComponent,
  ZardDropdownImports, // Import group
  ZardSheetService,

  // Types & Constants
  CalendarValue,
  ZardComboboxOption,
  ZardComboboxGroup,
  ZardCommandOption,
  ZardToggleGroupItem,
  Z_MODAL_DATA,
  ZARD_ICONS,
  mergeClasses,
  type zAlign,
  type zPosition,
} from '@ihsan/ui';
```

### Import Groups

Some components are exported as groups for convenience:

```typescript
// Breadcrumb
import { ZardBreadcrumbImports } from '@ihsan/ui';
// Includes: ZardBreadcrumbComponent, ZardBreadcrumbItemComponent,
//           ZardBreadcrumbLinkComponent, ZardBreadcrumbPageComponent,
//           ZardBreadcrumbSeparatorDirective

// Menu
import { ZardMenuImports } from '@ihsan/ui';
// Includes: ZardMenubarComponent, ZardMenubarMenuComponent,
//           ZardMenubarTriggerComponent, ZardMenubarContentComponent,
//           ZardMenubarItemComponent, ZardMenubarDividerComponent

// Pagination
import { ZardPaginationImports } from '@ihsan/ui';
// Includes: ZardPaginationComponent, ZardPaginationContentComponent,
//           ZardPaginationItemComponent

// Form
import { ZardFormImports } from '@ihsan/ui';
// Includes: ZardFormFieldComponent, ZardFormLabelDirective,
//           ZardFormControlDirective, ZardFormDescriptionDirective,
//           ZardFormErrorDirective

// Dropdown
import { ZardDropdownImports } from '@ihsan/ui';
// Includes: ZardDropdownDirective, ZardDropdownMenuContentComponent,
//           ZardDropdownMenuItemComponent
```

---

## 🚀 Quick Decision Tree for Component Selection

### Need a button?

→ Use `ZardButtonComponent`

### Need input field?

→ Use `ZardInputDirective`

### Need dropdown selection?

- Searchable? → Use `ZardComboboxComponent`
- Simple select? → Use `ZardSelectComponent`
- Action menu? → Use `ZardDropdownImports`

### Need date input?

- Calendar only? → Use `ZardCalendarComponent`
- With input field? → Use `ZardDatePickerComponent`

### Need modal/overlay?

- Full modal? → Use `ZardDialogService`
- Side panel? → Use `ZardSheetService`
- Confirmation? → Use `ZardAlertDialogService`
- Floating info? → Use `ZardPopoverComponent`
- Hover tip? → Use `ZardTooltipDirective`

### Need notification?

- Temporary toast? → Use `toast` from ngx-sonner
- Persistent alert? → Use `ZardAlertComponent`

### Need data display?

- Table? → Use `ZardTableComponent`
- List? → Use `ZardCardComponent` with `*ngFor`
- Empty state? → Use `ZardEmptyComponent`

### Need loading state?

- Spinner? → Use `ZardLoaderComponent`
- Placeholder? → Use `ZardSkeletonComponent`
- Progress? → Use `ZardProgressBarComponent`

### Need navigation?

- Tabs? → Use `ZardTabGroupComponent`
- Breadcrumbs? → Use `ZardBreadcrumbImports`
- Menu? → Use `ZardMenuImports`
- Pagination? → Use `ZardPaginationImports`

### Need toggle control?

- On/Off? → Use `ZardSwitchComponent`
- Checkbox? → Use `ZardCheckboxComponent`
- Radio? → Use `ZardRadioComponent`
- Button toggle? → Use `ZardToggleComponent` or `ZardToggleGroupComponent`

---

## ✅ Best Practices for AI Code Generation

### 1. Always Import from @ihsan/ui

```typescript
// ✅ CORRECT
import { ZardButtonComponent } from '@ihsan/ui';

// ❌ WRONG
import { ZardButtonComponent } from '@zardui/angular';
```

### 2. Use Signals for Reactivity

```typescript
// ✅ CORRECT
readonly selectedValue = signal('');
readonly items = signal<Item[]>([]);

// ❌ WRONG
selectedValue = '';
items: Item[] = [];
```

### 3. Provide Unique IDs

```html
<!-- ✅ CORRECT -->
<input z-input zId="unique-email-input" />

<!-- ❌ WRONG -->
<input z-input />
```

### 4. Use Proper TypeScript Typing

```typescript
// ✅ CORRECT
readonly form: FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

// ❌ WRONG
readonly form: any;
```

### 5. Follow Variant Naming

```html
<!-- ✅ CORRECT -->
<button z-button zType="primary" zSize="lg" zShape="pill">
  <!-- ❌ WRONG -->
  <button z-button type="primary" size="lg" shape="pill"></button>
</button>
```

### 6. Use Service Injection Pattern

```typescript
// ✅ CORRECT
private readonly _dialogService = inject(ZardDialogService);

// ❌ WRONG
constructor(private dialogService: ZardDialogService) {}
```

### 7. Handle Form Validation Properly

```html
<!-- ✅ CORRECT -->
<span z-form-error *ngIf="form.get('email')?.hasError('required')">
  Email is required
</span>

<!-- ❌ WRONG -->
<span class="error">Email is required</span>
```

### 8. Use Composition Over Custom Components

```html
<!-- ✅ CORRECT - Compose Zardui components -->
<z-card zPadding="md">
  <div class="flex items-center gap-4">
    <z-avatar zSize="lg" />
    <div>
      <h3>Title</h3>
      <z-badge zType="success">Active</z-badge>
    </div>
  </div>
</z-card>

<!-- ❌ WRONG - Don't create custom card component -->
<app-custom-user-card [user]="user"></app-custom-user-card>
```

---

## 🎓 Common Patterns & Recipes

### Login Form

```typescript
// Component
readonly form = inject(FormBuilder).group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  remember: [false],
});

onSubmit(): void {
  if (this.form.valid) {
    // Handle login
  }
}
```

```html
<z-card zPadding="lg">
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <z-form-field>
      <label z-form-label for="email">Email</label>
      <input z-input zId="email" type="email" formControlName="email" />
      <span z-form-error *ngIf="form.get('email')?.hasError('required')">
        Email is required
      </span>
      <span z-form-error *ngIf="form.get('email')?.hasError('email')">
        Invalid email format
      </span>
    </z-form-field>

    <z-form-field>
      <label z-form-label for="password">Password</label>
      <input
        z-input
        zId="password"
        type="password"
        formControlName="password"
      />
      <span z-form-error *ngIf="form.get('password')?.hasError('minlength')">
        Password must be at least 8 characters
      </span>
    </z-form-field>

    <z-checkbox formControlName="remember" zId="remember">
      Remember me
    </z-checkbox>

    <button z-button zType="primary" type="submit" [disabled]="!form.valid">
      Login
    </button>
  </form>
</z-card>
```

### Data Table with Actions

```typescript
// Component
readonly users = signal<User[]>([]);
readonly columns = ['id', 'name', 'email', 'status', 'actions'];

editUser(user: User): void {
  this._dialogService.open(EditUserComponent, { data: { user } });
}

deleteUser(user: User): void {
  this._alertDialogService.confirm({
    zTitle: 'Delete User',
    zDescription: `Delete ${user.name}?`,
    zConfirmText: 'Delete',
    zCancelText: 'Cancel',
  });
}
```

```html
<z-table [zDataSource]="users()" [zColumns]="columns">
  <ng-template #headerTemplate let-column>
    <th>{{ column | titlecase }}</th>
  </ng-template>

  <ng-template #rowTemplate let-row>
    <td>{{ row.id }}</td>
    <td>{{ row.name }}</td>
    <td>{{ row.email }}</td>
    <td>
      <z-badge [zType]="row.status === 'active' ? 'success' : 'default'">
        {{ row.status }}
      </z-badge>
    </td>
    <td>
      <button z-button zSize="sm" zType="ghost" (click)="editUser(row)">
        <z-icon name="edit" />
      </button>
      <button z-button zSize="sm" zType="ghost" (click)="deleteUser(row)">
        <z-icon name="trash" />
      </button>
    </td>
  </ng-template>
</z-table>
```

### Search with Filters

```typescript
// Component
readonly searchQuery = signal('');
readonly selectedCategory = signal<string | null>(null);
readonly categories: ZardComboboxOption[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'tech', label: 'Technology' },
  { value: 'health', label: 'Health' },
];

onSearch(): void {
  // Perform search
}
```

```html
<div class="search-bar">
  <z-input-group>
    <z-icon name="search" z-input-prefix />
    <input
      z-input
      zId="search"
      [(ngModel)]="searchQuery"
      placeholder="Search..."
      (keyup.enter)="onSearch()"
    />
  </z-input-group>

  <z-combobox
    [zFormControl]="categoryControl"
    [zOptions]="categories"
    zPlaceholder="Category"
  >
  </z-combobox>

  <button z-button zType="primary" (click)="onSearch()">Search</button>
</div>
```

### Profile Card

```html
<z-card zPadding="lg">
  <div class="profile-header">
    <z-avatar zSize="2xl" [zSrc]="user.avatar" [zFallback]="user.initials" />
    <div class="profile-info">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <z-badge zType="success" zSize="sm">Online</z-badge>
    </div>
  </div>

  <z-divider zOrientation="horizontal" />

  <div class="profile-actions">
    <button z-button zType="primary">
      <z-icon name="user-plus" />
      Follow
    </button>
    <button z-button zType="outline">
      <z-icon name="mail" />
      Message
    </button>
  </div>
</z-card>
```

---

## 📚 Additional Resources

- **Live Demos:** http://localhost:4200/test-components
- **Lucide Icons:** https://lucide.dev/icons/
- **Zardui Package:** `@zardui/angular`
- **Local Wrapper:** `@ihsan/ui`

---

## 🔄 Version History

- **v2.0** (January 20, 2026) - Complete AI-optimized reference with all 43 components
- **v1.0** - Initial component library integration

---

**Last Updated:** January 20, 2026  
**Components:** 43  
**Framework:** Angular 21.1 + Zardui  
**Optimization:** AI Code Generation
