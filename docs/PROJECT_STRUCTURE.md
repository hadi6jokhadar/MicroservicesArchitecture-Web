# MicroservicesArchitecture-Web

Angular 20+ web application built with Nx, following modern best practices and minimal code principles.

## 🏗️ Project Structure

```
MicroservicesArchitecture-Web/
├── .github/
│   └── .copilot-instructions.md     # GitHub Copilot coding standards
├── apps/                            # All applications
│   ├── web-app/                     # Main application
│   │   ├── project.json             # Project configuration
│   │   └── src/
│   │       ├── app/                 # Application code
│   │       ├── styles/              # App-specific styles
│   │       ├── index.html
│   │       ├── main.ts
│   │       └── styles.scss
│   └── playground/                  # Playground application
│       ├── project.json             # Project configuration
│       └── src/
│           ├── app/                 # Application code
│           ├── styles/              # App-specific styles
│           ├── index.html
│           ├── main.ts
│           └── styles.scss
├── libs/                            # Shared libraries
│   ├── core/                        # Core library
│   │   └── src/lib/
│   │       ├── models/              # Interfaces + Classes
│   │       ├── services/            # Injectable services
│   │       ├── guards/              # Route guards
│   │       └── interceptors/        # HTTP interceptors
│   └── shared/                      # Shared library
│       └── src/lib/
│           ├── components/          # Reusable components
│           ├── pipes/               # Custom pipes
│           ├── directives/          # Custom directives
│           └── utils/               # Utility functions
└── e2e/                             # End-to-end tests
```

## 🎯 Core Principles

### 1. **MINIMAL CODE**

- Write only what's necessary
- No over-engineering or premature optimization
- Delete unused code immediately
- Prefer built-in features over custom solutions

### 2. **Naming Conventions**

- **Private variables**: `_variableName` (underscore prefix)
- **Public variables**: `variableName` (no prefix)
- **Observables**: `variable$` (dollar suffix)
- **Signals**: `variableName` (no special prefix)

### 3. **Entity Pattern (MANDATORY)**

Always create both Interface and Class for each entity:

```typescript
// user.model.ts
export interface IUser {
  id: string;
  name: string;
  email: string;
}

export class User implements IUser {
  id: string;
  name: string;
  email: string;

  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.email = data.email || '';
  }

  get displayName(): string {
    return this.name;
  }
}
```

### 4. **Signal-Based Components (MANDATORY)**

**NEVER** use `@Input()` or `@Output()` decorators:

```typescript
// ❌ DON'T USE
@Input() userId!: string;
@Output() userChanged = new EventEmitter<User>();

// ✅ ALWAYS USE
userId = input.required<string>();
userChanged = output<User>();
```

### 5. **Component Organization (MANDATORY)**

All files related to a component must be colocated in the same folder:

```
user/
├── user.component.ts           # Component
├── user.component.html         # Template
├── user.component.scss         # Styles
├── user.service.ts             # Service
├── user.model.ts               # Entity (Interface + Class)
├── user.resolver.ts            # Resolver (if needed)
├── user.guard.ts               # Guard (if needed)
└── user.types.ts               # Type definitions (if needed)
```

**Example Structure:**

```typescript
// user/user.model.ts
export interface IUser {
  id: string;
  name: string;
}

export class User implements IUser {
  constructor(public id: string, public name: string) {}
}

// user/user.service.ts
export class UserService {
  private _http = inject(HttpClient);

  getUser(id: string) {
    return this._http.get<User>(`/api/users/${id}`);
  }
}

// user/user.component.ts
export class UserComponent {
  private _userService = inject(UserService);
  userId = input.required<string>();
  user = signal<User | null>(null);
}
```

**Key Rules:**

- ✅ Component and its service in same folder
- ✅ All related files (models, resolvers, guards) colocated
- ✅ No separate `/services`, `/models`, `/resolvers` folders per component
- ❌ Don't scatter component files across different directories

### 6. **Dependency Injection**

Use `inject()` function instead of constructor injection:

```typescript
export class UserService {
  private _http = inject(HttpClient);

  getUsers() {
    return this._http.get<User[]>('/api/users');
  }
}
```

## 🎨 Styling Standards

### CSS Variables

All colors and theme values use CSS variables:

```scss
:root {
  --primary-color: #3f51b5;
  --background-color: #ffffff;
  --text-color: #000000;
  --spacing-md: 16px;
}

[data-theme='dark'] {
  --background-color: #121212;
  --text-color: #ffffff;
}
```

### SCSS Nesting (MANDATORY)

- Always nest from `:host`
- Never wrap content in unnecessary divs
- Style the component host element directly

```scss
:host {
  display: flex;
  gap: var(--spacing-md);

  img {
    width: 100px;
    border-radius: var(--border-radius-md);

    &:hover {
      transform: scale(1.05);
    }
  }

  // RTL Support
  :host-context([dir='rtl']) & {
    flex-direction: row-reverse;
  }
}
```

## 📦 Angular Material

Use Material components for all UI elements. Import only needed modules:

```typescript
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  // ...
})
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Angular CLI 20+
- Nx CLI 22+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint
npm run lint
```

### Nx Commands

```bash
# Generate a new library
npx nx g @nx/angular:library --name=feature-name --directory=libs/feature-name

# Generate a component
npx nx g @nx/angular:component --name=component-name --project=shared

# Run specific project
npx nx serve web

# Run tests for specific project
npx nx test core

# Build specific project
npx nx build web
```

## 🎨 Theme Support

### Dynamic Theme System

The theme system uses a **flexible, dynamic approach** with separate color scheme and mode management:

```typescript
import { ThemeService } from '@web-app/core';

export class AppComponent {
  private _themeService = inject(ThemeService);

  // Set color scheme (any string)
  switchColorScheme() {
    this._themeService.setColorScheme('blue'); // 'default', 'blue', 'green', 'purple', etc.
  }

  // Set mode
  switchToLight() {
    this._themeService.setMode('light');
  }

  switchToDark() {
    this._themeService.setMode('dark');
  }

  // Toggle mode
  toggleMode() {
    this._themeService.toggleMode();
  }

  // Set both at once
  setFullTheme() {
    this._themeService.setTheme('blue', 'dark');
  }

  // Get current combined theme
  getCurrentTheme() {
    return this._themeService.getCurrentTheme(); // Returns 'blue-dark', 'light', etc.
  }

  // Direction
  toggleDirection() {
    this._themeService.toggleDirection();
  }
}
```

### Built-in Color Schemes

- `default` - Default violet/pink theme
- `blue` - Blue theme
- `green` - Green theme
- **Any custom string** - Add your own!

### Theme Modes

- `light` - Light mode
- `dark` - Dark mode

### HTML Attributes

The service automatically sets these attributes on `<html>`:

- `data-theme="blue-dark"` - Combined (backward compatible)
- `data-color-scheme="blue"` - Color scheme only
- `data-mode="dark"` - Mode only

### CSS Targeting

Target themes using flexible selectors:

```scss
// Target specific color scheme in light mode
[data-mode='light'][data-color-scheme='blue'] {
  --primary-color: #2196f3;
}

// Target specific color scheme in dark mode
[data-mode='dark'][data-color-scheme='blue'] {
  --primary-color: #64b5f6;
}

// Or use combined attribute for backward compatibility
[data-theme='blue-dark'] {
  --primary-color: #64b5f6;
}
```

### Adding Custom Themes

No TypeScript changes needed! Just add CSS:

1. Define CSS variables in `_variables.scss`
2. Define Material theme in `_material-theme.scss`
3. Use: `themeService.setColorScheme('your-theme-name')`

### RTL/LTR Support

- `ltr` - Left-to-right (default)
- `rtl` - Right-to-left

## ✅ Best Practices Checklist

- ✅ Write MINIMAL code
- ✅ Use Angular Material components
- ✅ Private variables: `_variable`
- ✅ Observables: `variable$`
- ✅ Interface + Class for entities
- ✅ Signal `input()` and `output()` only
- ✅ CSS variables for theming
- ✅ SCSS: nest from `:host`
- ✅ Use standalone components
- ✅ Use `inject()` function
- ✅ Support dark/light mode
- ✅ Support RTL/LTR
- ✅ Delete unused imports/code
- ✅ OnPush change detection

## ❌ What NOT to Do

- ❌ Don't use `@Input()` / `@Output()`
- ❌ Don't create wrapper divs
- ❌ Don't hardcode colors
- ❌ Don't use flat SCSS
- ❌ Don't skip Interface + Class pattern
- ❌ Don't name private vars without `_`
- ❌ Don't name observables without `$`
- ❌ Don't use NgModules
- ❌ Don't use `any` type
- ❌ Don't import entire Material library
- ❌ Don't over-engineer

## 📚 Resources

- [Angular Docs](https://angular.dev)
- [Nx Documentation](https://nx.dev)
- [Angular Material](https://material.angular.io)
- [Angular Signals](https://angular.dev/guide/signals)
- [Material Theming](https://material.angular.io/guide/theming)

## 📝 Code Minimalism Rules

1. No unused imports - remove immediately
2. No unused variables/methods - delete them
3. No "just in case" code
4. No premature optimization
5. No wrapper divs - style `:host`
6. Use Material instead of custom components
7. Import only needed Material modules
8. Inline simple templates (< 5 lines)
9. Keep functions under 20 lines
10. Keep components under 200 lines

---

**Remember**: Every line of code should have a clear purpose. When in doubt, write less.
