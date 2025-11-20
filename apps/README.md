# Apps Directory

This directory contains all Angular applications in the workspace.

## Structure

```
apps/
├── web-app/          # Main application
│   ├── project.json  # Project configuration
│   └── src/
│       ├── app/
│       ├── styles/
│       ├── index.html
│       ├── main.ts
│       └── styles.scss
│
└── playground/       # Playground application
    ├── project.json  # Project configuration
    └── src/
        ├── app/
        ├── styles/
        ├── index.html
        ├── main.ts
        └── styles.scss
```

## Adding New Applications

When creating new applications, they should be placed in this `apps/` directory:

```bash
# Generate a new application (Nx will create it in apps/)
npx nx generate @nx/angular:application my-new-app

# Or manually create:
apps/
└── my-new-app/
    ├── project.json
    └── src/
```

## Configuration Files

Each app is **self-contained** with all configs inside its folder:

- `project.json` - Nx project configuration
- `tsconfig.json` - TypeScript root config (optional)
- `tsconfig.app.json` - Application build config
- `tsconfig.spec.json` - Test config
- `jest.config.ts` - Jest test config
- `eslint.config.mjs` - ESLint config (optional)

All apps extend from the workspace root `tsconfig.base.json` for shared settings.

Each app has its own configuration files at the workspace root:

- `project.<app-name>.json` - Nx project configuration
- `tsconfig.<app-name>.json` - TypeScript base config
- `tsconfig.<app-name>.app.json` - App TypeScript config
- `tsconfig.<app-name>.spec.json` - Test TypeScript config
- `jest.config.<app-name>.ts` - Jest test config
- `eslint.<app-name>.config.mjs` - ESLint config

## Running Applications

```bash
# Serve an application
npx nx serve web-app        # Port 4200
npx nx serve playground     # Port 4201

# Build an application
npx nx build web-app
npx nx build playground

# Test an application
npx nx test web-app
npx nx test playground

# Lint an application
npx nx lint web-app
npx nx lint playground
```

## Design Patterns

All applications follow the established design patterns:

- ✅ Signal-based architecture
- ✅ Standalone components
- ✅ Reactive forms
- ✅ Angular Material UI
- ✅ CSS variables for theming
- ✅ RTL/LTR support
- ✅ Dark/Light mode support

See `.github/.copilot-instructions.md` for complete coding standards.
