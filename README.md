# MicroservicesArchitecture-Web

Modern Angular 20+ web application built with **Nx monorepo**, following **minimal code principles** and **best practices**.

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## 📚 Documentation

- **[docs/QUICK_START.md](./docs/QUICK_START.md)** - Quick reference for common tasks
- **[docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Detailed project structure and patterns
- **[docs/ADDING_NEW_APPS.md](./docs/ADDING_NEW_APPS.md)** - How to add multiple Angular applications
- **[docs/SETUP_COMPLETE.md](./docs/SETUP_COMPLETE.md)** - Setup completion summary
- **[.github/.copilot-instructions.md](./.github/.copilot-instructions.md)** - GitHub Copilot coding standards

## 🎯 Key Features

- ✅ **Angular 20+** with standalone components
- ✅ **Nx Monorepo** for scalable architecture
- ✅ **Angular Material** for UI components
- ✅ **Signal-based** inputs/outputs (NO `@Input`/`@Output`)
- ✅ **Dark/Light Mode** with CSS variables
- ✅ **RTL/LTR Support** for internationalization
- ✅ **TypeScript** with strict mode
- ✅ **Jest** for unit testing
- ✅ **Playwright** for E2E testing
- ✅ **ESLint** for code quality

## 🏗️ Project Structure

```
MicroservicesArchitecture-Web/
├── libs/
│   ├── core/           # Services, guards, interceptors, models
│   └── shared/         # Reusable components, pipes, directives
├── src/
│   ├── app/            # Main application
│   └── styles/         # Global styles and themes
└── e2e/                # End-to-end tests
```

## 🎨 Core Principles

### 1. MINIMAL CODE

Write only what's necessary. No over-engineering.

### 2. Naming Conventions

- `_privateVariable` - Private with underscore
- `publicVariable` - Public without prefix
- `observable$` - Observables with dollar sign
- `signalVariable` - Signals without prefix

### 3. Entity Pattern (MANDATORY)

Always create Interface + Class:

```typescript
export interface IUser {
  id: string;
  name: string;
}

export class User implements IUser {
  id: string;
  name: string;

  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
  }
}
```

### 4. Signal-Based Components

```typescript
// ✅ CORRECT
userId = input.required<string>();
userChanged = output<User>();

// ❌ WRONG
@Input() userId!: string;
@Output() userChanged = new EventEmitter<User>();
```

### 5. Dependency Injection

```typescript
export class UserService {
  private _http = inject(HttpClient);
}
```

## 🎨 Theming

### Switch Theme

```typescript
import { ThemeService } from '@core/services/theme.service';

private _themeService = inject(ThemeService);

switchTheme() {
  this._themeService.setTheme('dark');
}
```

### Available Themes

- `light` - Default
- `dark` - Dark mode
- `blue` - Blue theme
- `green` - Green theme

### RTL/LTR

- `ltr` - Left-to-right (default)
- `rtl` - Right-to-left

## 📦 Nx Commands

```bash
# Serve application
npx nx serve web-app

# Build application
npx nx build web-app

# Test specific library
npx nx test core

# Lint specific library
npx nx lint shared

# Generate component
npx nx g @nx/angular:component my-component --project=shared --standalone

# Generate service
npx nx g @nx/angular:service my-service --project=core

# Generate library
npx nx g @nx/angular:library my-feature --directory=libs/features/my-feature

# View dependency graph
npx nx graph
```

## ✅ Best Practices

- ✅ Write MINIMAL code - no over-engineering
- ✅ Use Angular Material components
- ✅ Private variables: `_variable`
- ✅ Observables: `variable$`
- ✅ Interface + Class for entities
- ✅ Signal `input()` and `output()` only
- ✅ CSS variables for theming
- ✅ SCSS: nest from `:host`
- ✅ Use `inject()` function
- ✅ Delete unused code immediately

## ❌ What NOT to Do

- ❌ Don't use `@Input()` / `@Output()`
- ❌ Don't create wrapper divs
- ❌ Don't hardcode colors
- ❌ Don't use flat SCSS
- ❌ Don't name private vars without `_`
- ❌ Don't name observables without `$`
- ❌ Don't use NgModules
- ❌ Don't use `any` type

## 📖 Resources

- [Angular Documentation](https://angular.dev)
- [Nx Documentation](https://nx.dev)
- [Angular Material](https://material.angular.io)
- [Angular Signals](https://angular.dev/guide/signals)

## 🛠️ Tech Stack

- **Angular 20+** - Modern web framework
- **Nx 22+** - Monorepo build system
- **TypeScript 5+** - Type-safe JavaScript
- **Angular Material 20** - UI component library
- **SCSS** - CSS preprocessor
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code quality

---

**Need Help?**

- Check `docs/QUICK_START.md` for quick reference
- Read `docs/PROJECT_STRUCTURE.md` for detailed documentation
- Review `.github/.copilot-instructions.md` for coding standards

## Nx Workspace Details

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/angular-standalone-tutorial?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
