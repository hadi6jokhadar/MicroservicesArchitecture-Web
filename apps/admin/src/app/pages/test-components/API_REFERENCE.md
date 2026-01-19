# Test Components API Reference

## 📋 Quick Index

### Component State & Properties (Alphabetically Sorted)

#### Accordion

- `defaults: string[]` - Default expanded items

#### Alert Dialog

- Methods: `showAlertDialog()`

#### Avatar

- No specific state (uses HTML variants)

#### Badge

- No specific state (uses HTML variants)

#### Breadcrumb

- No specific state (uses HTML variants)

#### Button & Button Group

- No specific state (uses HTML variants)

#### Calendar

```typescript
selectedDates: signal<Date[] | null>;
dateRange: signal<Date[] | null>;
minDate: Date;
maxDate: Date;
DAYS_IN_FUTURE: number = 30;
MILLISECONDS_PER_DAY: number = 24 * 60 * 60 * 1000;
```

Methods: `formatDate(date?, label?): string`

#### Card

- No specific state (uses HTML variants)

#### Carousel

```typescript
// Configuration
carouselOptions: { loop: boolean; align: 'start' | 'center' | 'end' }
plugins: EmblaPluginType[]
carouselOptions2: Array<{ value: string; label: string }>

// State
isAutoplayActive: signal<boolean>
currentSlide: signal<number>
totalSlides: signal<number>
slides: string[]
scrollProgress: signal<number>
slidesInView: signal<number[]>
canScrollPrev: signal<boolean>
canScrollNext: signal<boolean>
currentSpacing: signal<'sm' | 'md' | 'lg' | 'xl'>

// Computed
contentSpacingClass: computed<string>
itemSpacingClass: computed<string>
```

Methods:

- `onCarouselInit(api: EmblaCarouselType): void`
- `onSlideChange(): void`
- `toggleAutoplay(): Promise<void>`
- `toggleLoop(): void`
- `goToPrevious(): void`
- `goToNext(): void`
- `goToSlide(index: number): void`
- `onChange(value: string): void`

#### Checkbox

```typescript
checked: boolean = true;
```

#### Combobox

```typescript
frameworkControl: FormControl<string | null>
frameworks: ZardComboboxOption[]
frameworksWithDisabled: ZardComboboxOption[]
techGroups: ZardComboboxGroup[]
```

Methods:

- `onSelect(option: ZardComboboxOption): void`
- `onComboboxSelect(option: ZardComboboxOption): void`
- `setValue(): void`
- `clearValue(): void`
- `logValue(): void`

#### Command

```typescript
lastCommand: signal<string>;
```

Methods:

- `handleCommand(option: ZardCommandOption): void`
- `handleKeyDown(event: KeyboardEvent): void`

#### Date Picker

- Uses Calendar properties (see Calendar section)

#### Dialog

Methods: `openDialog(): void`

#### Divider

- No specific state (uses HTML variants)

#### Dropdown

```typescript
selectedValue: signal<string>;
```

#### Empty

Methods: `onActionClick(): void`

#### Form

```typescript
form: FormGroup;
messageLength: signal<number>;
contactForm: FormGroup;
```

Methods: `log(value: string): void`

#### Icon

- No specific state (uses HTML variants)

#### Input & Input Group

```typescript
smallValue: string;
defaultValue: string;
largeValue: string;
```

#### Kbd

- No specific state (uses HTML variants)

#### Loader

- No specific state (uses HTML variants)

#### Menu

- No specific state (uses HTML variants)

#### Pagination

```typescript
totalPages: number = 5;
currentPage: signal<number>;
pages: signal<number[]>;
```

Methods:

- `goToPage(page: number): void`
- `goToPreviousCustom(): void`
- `goToNextCustom(): void`

#### Popover

```typescript
CURRENCIES: Array<{ symbol: string; code: string }>;
currency: signal<string>;
```

#### Progress Bar

```typescript
progress: number = 66;
```

#### Radio

- No specific state (uses HTML variants)

#### Resizable

- No specific state (uses HTML variants)

#### Segmented

- Uses Carousel spacing properties (see Carousel section)

#### Select

- No specific state (uses HTML variants)

#### Sheet

```typescript
placement: signal<'right' | 'left' | 'top' | 'bottom' | null | undefined>;
```

Methods:

- `openSheetBasic(): void`
- `openSheetSize(): void`
- `openWideSheet(): void`
- `openTallSheet(): void`
- `openCustomSheet(): void`
- `openTopSheet(): void`

#### Skeleton

- No specific state (uses HTML variants)

#### Slider

- No specific state (uses HTML variants)

#### Switch

- No specific state (uses HTML variants)

#### Table

```typescript
dataSource: Payment[]
columns: string[]
```

#### Tabs

- No specific state (uses HTML variants)

#### Toast

- Uses external `toast` from 'ngx-sonner' (no component state)

#### Toggle & Toggle Group

```typescript
items: ZardToggleGroupItem[]
```

Methods: `onToggleChange(value: string | string[]): void`

#### Tooltip

```typescript
showArrow: boolean = true;
```

---

## 🔧 General Properties & Methods

### Dependency Injection

```typescript
private readonly _fb: FormBuilder
private readonly _dialogService: ZardDialogService
private readonly _alertDialogService: ZardAlertDialogService
private readonly _sheetService: ZardSheetService
private readonly _pluginsService: ZardCarouselPluginsService
private readonly _destroyRef: DestroyRef
private readonly _zData: iDialogData | null
```

### Utility Properties

```typescript
protected readonly Math = Math
protected event: string = 'none'
```

### Event Handlers

```typescript
onShow(): void
onHide(): void
```

---

## 📊 Type Definitions

### Payment (Table Demo)

```typescript
interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
}
```

### Person (Table Demo)

```typescript
interface Person {
  key: string;
  name: string;
  age: number;
  address: string;
}
```

### Dialog Data

```typescript
interface iDialogData {
  name: string;
  username: string;
}
```

### Combobox Types

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

### Toggle Types

```typescript
interface ZardToggleGroupItem {
  value: string;
  icon?: string;
  label: string;
  ariaLabel?: string;
}
```

### Command Types

```typescript
interface ZardCommandOption {
  value: string;
  label: string;
  icon?: string;
  shortcut?: string;
}
```

---

## 🎯 Usage Patterns

### Signals Pattern

All reactive state uses Angular signals:

```typescript
readonly selectedValue = signal<Type>(initialValue);

// Read
const value = this.selectedValue();

// Write
this.selectedValue.set(newValue);
this.selectedValue.update(currentValue => newValue);
```

### Computed Values

```typescript
readonly computedValue = computed(() => {
  return this.dependency1() + this.dependency2();
});
```

### Form Control Pattern

```typescript
private readonly _fb = inject(FormBuilder);

form = this._fb.group({
  fieldName: ['', Validators.required],
});
```

### Service Injection Pattern

```typescript
private readonly _service = inject(ServiceClass);

method(): void {
  this._service.doSomething();
}
```

---

## 📁 File Organization

### Main Files

- `test-components.component.ts` - Component logic (1255 lines)
- `test-components.component.html` - Templates (3671 lines)
- `test-components.component.scss` - Styles (111 lines)
- `README.md` - Component documentation
- `API_REFERENCE.md` - This file

### Auxiliary Files

- `test/test.ts` - Test content component for dialogs/sheets
- `test/test.html` - Test content template
- `test/test.scss` - Test content styles

---

## 🔍 Quick Lookup Tables

### Components with State Management

| Component    | Has State | State Type           | Methods          |
| ------------ | --------- | -------------------- | ---------------- |
| Accordion    | ✅        | Array                | -                |
| Calendar     | ✅        | Signals              | formatDate()     |
| Carousel     | ✅        | Signals + Computed   | 10+ methods      |
| Checkbox     | ✅        | Boolean              | -                |
| Combobox     | ✅        | FormControl + Arrays | 5 methods        |
| Command      | ✅        | Signal               | 2 methods        |
| Dialog       | ❌        | Service-based        | openDialog()     |
| Form         | ✅        | FormGroup            | log()            |
| Pagination   | ✅        | Signals              | 3 methods        |
| Popover      | ✅        | Signal               | -                |
| Progress Bar | ✅        | Number               | -                |
| Sheet        | ✅        | Signal               | 6 methods        |
| Table        | ✅        | Array                | -                |
| Toggle       | ✅        | Array                | onToggleChange() |

### Components Without Internal State

- Alert, Alert Dialog, Avatar, Badge, Breadcrumb
- Button, Button Group, Card, Date Picker, Divider
- Dropdown, Empty, Icon, Input, Input Group, Kbd
- Loader, Menu, Radio, Resizable, Segmented, Select
- Skeleton, Slider, Switch, Tabs, Toast, Tooltip

---

**Last Updated**: January 2026
**Total Methods**: 35+
**Total Properties**: 50+
**Lines of Code**: ~5,000+
