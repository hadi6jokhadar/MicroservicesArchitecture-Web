# Angular Project Design Pattern Guide

## Project Overview

This is a lightweight Angular 20 project using Nx workspace management, standalone components, signals-based state management, and the Zardui UI component library. The project emphasizes minimal code, clean architecture, and strict naming conventions.

## Project Structure

```
MicroservicesArchitecture-Web/
├── apps/
│   └── admin/
│       └── src/app/
│           ├── pages/                 # Page layout component with sidebar
│           │   ├── pages.component.ts
│           │   ├── pages.component.html
│           │   ├── pages.component.scss
│           │   └── pages.routes.ts
│           ├── features/               # Lazy-loaded feature modules
│           │   └── identity/
│           │       ├── identity.component.ts
│           │       ├── identity.routes.ts
│           │       ├── users/
│           │       ├── roles/
│           │       └── claims/
│           └── shared/                 # Global shared components/services
├── libs/
│   ├── core/                           # Core services, guards, models
│   ├── shared/                         # Reusable components & utilities
│   │   └── src/lib/components/
│   │       └── sidebar/
│   └── ui/                             # Zardui wrapper components
```

## Component Organization

### Folder Structure (Colocation Pattern)

Every component should have all its files in the same folder:

```
feature-name/
├── feature-name.component.ts          # Component logic
├── feature-name.component.html        # Template
├── feature-name.component.scss        # Styles
├── feature-name.service.ts            # Feature service (if needed)
├── feature-name.model.ts              # Models/interfaces (if needed)
└── feature-name.routes.ts             # Nested routes (if needed)
```

**Example:**

```
identity/
├── identity.component.ts
├── identity.component.html
├── identity.component.scss
├── identity.routes.ts
├── users/
│   ├── users.component.ts
│   ├── users.component.html
│   └── users.component.scss
├── roles/
│   ├── roles.component.ts
│   ├── roles.component.html
│   └── roles.component.scss
└── claims/
    ├── claims.component.ts
    ├── claims.component.html
    └── claims.component.scss
```

## Naming Conventions

### Variables & Properties

```typescript
// Private variables (underscore prefix)
private _httpClient = inject(HttpClient);
private _userService = inject(UserService);

// Public variables (no prefix)
public userName: string = '';

// Observables (dollar sign suffix)
private data$ = this._http.get('/api/data');

// Signals (no special suffix)
userName = signal<string>('');
isLoading = signal<boolean>(false);
```

### Files & Folders

- **Components**: `kebab-case.component.ts`
- **Services**: `kebab-case.service.ts`
- **Models**: `kebab-case.model.ts`
- **Routes**: `kebab-case.routes.ts`
- **Folders**: `kebab-case`

### CSS Classes

```typescript
// Use kebab-case and nest from :host
:host {
  .container { }
  .header { }
  .footer { }
}
```

## Component Patterns

### Standalone Components (MANDATORY)

All components must be standalone:

```typescript
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss'],
})
export class FeatureNameComponent {
  // Component logic
}
```

### Signals (MANDATORY)

Always use signals for state management:

```typescript
// Input signals (typed)
userId = input.required<string>();
userName = input<string>('default');

// Output signals (emit events)
userSelected = output<User>();

// Local state signals
isLoading = signal<boolean>(false);
users = signal<User[]>([]);

// Computed signals (derived state)
userCount = computed(() => this.users().length);
```

### Dependency Injection

Use the `inject()` function:

```typescript
private _http = inject(HttpClient);
private _userService = inject(UserService);
private _router = inject(Router);
private _platformId = inject(PLATFORM_ID);
```

### Reactive Forms (MANDATORY)

Always use typed FormGroup with interfaces:

```typescript
interface IUserForm {
  email: string;
  password: string;
}

export class LoginComponent {
  private _fb = inject(FormBuilder);

  userForm = this._fb.group<IUserForm>({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      // Use formValue
    }
  }
}
```

### Models/Entities Pattern

Always create Interface + Class pairs:

```typescript
export interface IUser {
  id: string;
  email: string;
  name: string;
}

export class UserClass implements IUser {
  id: string;
  email: string;
  name: string;

  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || '';
    this.email = data.email || '';
    this.name = data.name || '';
  }
}
```

## UI Components (Zardui First Policy)

### MANDATORY: Always Check Zardui First

Before creating any custom UI component, verify if Zardui provides it.

**Available Zardui Components:**
Accordion, Alert, Alert Dialog, Avatar, Badge, Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Checkbox, Combobox, Command, Date Picker, Dialog, Divider, Dropdown, Empty, Form, Icon, Input, Input Group, Kbd, Layout, Loader, Menu, Pagination, Popover, Progress Bar, Radio, Resizable, Segmented, Select, Sheet, Skeleton, Slider, Switch, Table, Tabs, Toast, Toggle, Toggle Group, Tooltip.

### Import Zardui Components

```typescript
import {
  ZardButtonComponent,
  ZardInputComponent,
  ZardDialogComponent,
} from '@ihsan/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ZardButtonComponent, ZardInputComponent],
  template: `
    <button z-button zType="primary">Click me</button>
    <input z-input placeholder="Enter text" />
  `,
})
export class ExampleComponent {}
```

### Icons (ZardIcon Type)

Always use valid ZardIcon values from the reference:

```typescript
import { ZardIcon } from '@ihsan/ui';

sidebarPages = signal<ISidebarPage[]>([
  {
    label: 'Users',
    icon: 'users' as ZardIcon, // ✅ Valid icon
    route: '/users',
  },
]);
```

See [ZARD_ICON_REFERENCE.md](./ZARD_ICON_REFERENCE.md) for all available icons.

## Routing Pattern

### Feature Route Configuration

Each feature module defines its own routes:

```typescript
// features/identity/identity.routes.ts
import { Routes } from '@angular/router';
import { IdentityComponent } from './identity.component';
import { UsersComponent } from './users/users.component';

export const identityRoutes: Routes = [
  {
    path: '',
    component: IdentityComponent,
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
];
```

### Parent Route Configuration

Parent routes lazy-load feature routes:

```typescript
// pages/pages.routes.ts
import { Routes } from '@angular/router';
import { identityRoutes } from '../features/identity/identity.routes';

export const pagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'identity',
        loadChildren: () => Promise.resolve(identityRoutes),
      },
    ],
  },
];
```

## Styling Standards

### Core Principles

1. **Nest from `:host`**: Always nest styles starting from the host element
2. **No Wrapper Divs**: Style the host directly
3. **CSS Variables**: Use for colors and theme values
4. **Logical Properties**: Use `inline`, `block` instead of `left`, `right`, `top`, `bottom`
5. **Responsive Design**: Handle Desktop (1024+), Tablet (768-1023), Mobile (< 768)

### SCSS Structure

```scss
:host {
  display: flex;
  flex-direction: column;

  .header {
    padding-block: 1rem;
    color: var(--foreground);
  }

  .content {
    flex: 1;
    padding-inline: 1rem;
  }

  .footer {
    margin-block-start: auto;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .header {
      padding-block: 0.5rem;
    }
  }
}
```

### Logical Properties Mapping

```scss
// ❌ DON'T use physical properties
margin-left: 1rem;
padding-right: 2rem;
border-top: 1px solid;

// ✅ DO use logical properties
margin-inline-start: 1rem;
padding-inline-end: 2rem;
border-block-start: 1px solid;
```

## State Management with Signals

### Local Component State

```typescript
export class UsersComponent {
  isLoading = signal<boolean>(false);
  users = signal<User[]>([]);
  error = signal<string | null>(null);

  private _userService = inject(UserService);

  loadUsers(): void {
    this.isLoading.set(true);
    this._userService.getUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => this.error.set(err.message),
      complete: () => this.isLoading.set(false),
    });
  }
}
```

### Sequential Timeline Edit Pattern

For editors that store ordered timestamps such as LRC lines, use a dedicated signal toggle to control whether edits should cascade to following rows.

```typescript
readonly cascadeFollowingLineTimes = signal(false);

updateLineTime(index: number, nextValueSeconds: number): void {
  const lines = [...this.editableLrcLines()];
  const previous = lines[index].time;
  const delta = nextValueSeconds - previous;

  lines[index] = { ...lines[index], time: nextValueSeconds };

  if (this.cascadeFollowingLineTimes() && Math.abs(delta) > Number.EPSILON) {
    for (let lineIndex = index + 1; lineIndex < lines.length; lineIndex++) {
      lines[lineIndex] = {
        ...lines[lineIndex],
        time: Math.max(0, lines[lineIndex].time + delta),
      };
    }
  }

  this.gatherLyricsFromInputs(lines);
}
```

Rules:

- Apply the delta only to rows after the edited row.
- Keep rows before the edited row unchanged.
- Clamp resulting times to zero when shifting backward.
- Keep the behavior opt in via a UI toggle.

## Error Handling

### Global Error Interceptor (Default)

By default, all HTTP errors are automatically caught by the error interceptor and displayed as toast notifications:

```typescript
export class UserService {
  private readonly _http = inject(HttpClient);

  createUser(user: ICreateUserRequest) {
    // ✅ Interceptor automatically shows toast on error
    return this._http.post<IUserDto>('/api/users', user);
  }
}
```

### Component-Level Error Handling

For auth components, forms, or custom error UI, skip automatic toast and handle errors manually:

```typescript
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';

export class LoginComponent {
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    // Skip automatic toast
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._authService.login(request, context).subscribe({
      next: () => this._router.navigate(['/dashboard']),
      error: (error) => {
        // Extract formatted error message (includes validation errors)
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
}
```

**Important:** Use `<z-alert>` component from Zardui - no custom CSS needed!

**For complete error handling guide, see:**

- [ERROR_HANDLER_USAGE_GUIDE.md](./ERROR_HANDLER_USAGE_GUIDE.md) - Complete documentation
- [ERROR_HANDLER_QUICK_REFERENCE.md](./ERROR_HANDLER_QUICK_REFERENCE.md) - Quick reference

### Derived State (Computed)

```typescript
import { computed } from '@angular/core';

export class UsersComponent {
  users = signal<User[]>([]);

  userCount = computed(() => this.users().length);
  hasUsers = computed(() => this.users().length > 0);
  noUsers = computed(() => this.users().length === 0);
}
```

### Event Handling with Output

```typescript
export class UserItemComponent {
  user = input.required<User>();
  userSelected = output<User>();

  onSelect(): void {
    this.userSelected.emit(this.user());
  }
}
```

## Change Detection

All components use **OnPush** strategy:

```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-feature',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class FeatureComponent {}
```

## Best Practices

### DO ✅

- Use standalone components
- Use signals for all state
- Use `input()` and `output()` for component communication
- Colocate component files
- Follow naming conventions strictly
- Use Zardui components
- Use reactive forms with typed FormGroup
- Keep components simple and focused
- Delete unused imports immediately
- Use logical CSS properties
- Add unique `id` attributes to interactive elements

### DON'T ❌

- Create custom UI components that Zardui provides
- Use `@Input()` or `@Output()` decorators
- Use `[(ngModel)]` (template-driven forms)
- Create NgModules
- Use `any` type
- Create test files (`.spec.ts`)
- Add wrapper divs (style `:host` instead)
- Hardcode colors (use CSS variables)
- Use physical CSS properties (`left`, `right`)
- Chain commands with `&` in terminals

## Common File Templates

### Component Template

```typescript
import { Component, input, output, signal } from '@angular/core';
import { ZardButtonComponent } from '@ihsan/ui';

@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [ZardButtonComponent],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss'],
})
export class FeatureNameComponent {
  // Inputs
  featureId = input.required<string>();

  // Outputs
  itemSelected = output<Item>();

  // State
  isLoading = signal<boolean>(false);

  onItemSelect(item: Item): void {
    this.itemSelected.emit(item);
  }
}
```

### Service Template

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FeatureService {
  private _http = inject(HttpClient);
  private readonly API_URL = '/api/features';

  getFeatures() {
    return this._http.get<Feature[]>(this.API_URL);
  }
}
```

## Documentation Resources

- **Error Handling**: See [ERROR_HANDLER_USAGE_GUIDE.md](./ERROR_HANDLER_USAGE_GUIDE.md) - Complete error handling guide
- **ZardUI Icons**: See [ZARD_ICON_REFERENCE.md](./ZARD_ICON_REFERENCE.md)
- **Angular Instructions**: See [.github/instructions/Angular.instructions.md](.github/instructions/Angular.instructions.md)
- **Component Usage**: See [COMPONENT_USAGE_GUIDE.md](./COMPONENT_USAGE_GUIDE.md)

## Chart.js Integration

Chart.js is installed as `chart.js` in `package.json`. Always use tree-shaken imports — never import the full bundle.

### Setup (one-time at module level)

```typescript
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register only what you use — place at top of component file, outside the class
Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);
```

### Canvas access with `@ViewChild`

```typescript
@ViewChild('myCanvas') myCanvas!: ElementRef<HTMLCanvasElement>;
private _chart: Chart | null = null;
```

### Critical: `@ViewChild` inside `@if` blocks

When a `<canvas>` is inside an `@if` / `@else` block the element is not yet in the DOM immediately after setting the signal that triggers rendering. Always call `detectChanges()` before building the chart:

```typescript
export class StatsComponent implements AfterViewInit, OnDestroy {
  private readonly _cdr = inject(ChangeDetectorRef);
  private _initialized = false;

  ngAfterViewInit(): void {
    this._initialized = true;
    const s = this.stats();
    if (s) this._buildCharts(s); // already rendered — safe to access @ViewChild
  }

  loadData(): void {
    this._service.getData().subscribe({
      next: (data) => {
        this.stats.set(data); // triggers re-render inside @if
        this.isLoading.set(false);
        if (this._initialized) {
          this._cdr.detectChanges(); // ← flush Angular CD so <canvas> enters DOM
          this._buildCharts(data); // now @ViewChild refs are valid
        }
      },
    });
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
    this._chart = null;
  }

  private _buildCharts(data: IStats): void {
    // Destroy previous instance before recreating
    this._chart?.destroy();
    this._chart = new Chart(this.myCanvas.nativeElement, {
      /* config */
    });
  }
}
```

### Key rules

- **Always destroy before recreate** — call `chart.destroy()` before creating a new `Chart` instance on the same canvas.
- **Register once** — `Chart.register(...)` at module level (outside the class), not inside `ngOnInit` or a method.
- **`_initialized` flag** — gate chart building on `AfterViewInit` so you never access a `@ViewChild` before the view is ready.
- **`ChangeDetectorRef.detectChanges()`** — required any time chart data arrives via HTTP and the canvas is inside a conditional block.

---

**Last Updated:** April 28, 2026  
**Version:** 1.2
