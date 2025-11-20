# Troubleshooting Guide

Common issues and their solutions for MicroservicesArchitecture-Web.

## 🚨 Common Build/Serve Errors

### Error: Cannot find module '@angular/animations/browser'

**Cause:** Missing `@angular/animations` package dependency.

**Solution:**

```bash
# Install the animations package matching your Angular version
npm install @angular/animations@~20.3.0
```

**Why it happens:** Angular Material and platform-browser animations require this package, but it's not always included by default.

---

### Error: Undefined function `mat.define-palette()`

**Cause:** Angular Material 20+ changed from M2 (define-palette) to M3 (define-theme) theming API.

**Solution:** Update your Material theme files to use the new M3 API:

```scss
// ❌ OLD M2 API (Angular Material <20)
@use '@angular/material' as mat;
$light-primary: mat.define-palette(mat.$indigo-palette);
$light-theme: mat.define-light-theme(...);

// ✅ NEW M3 API (Angular Material 20+)
@use '@angular/material' as mat;
$light-theme: mat.define-theme(
  (
    color: (
      theme-type: light,
      primary: mat.$violet-palette,
    ),
  )
);
```

**Example fix for `_material-theme.scss`:**

```scss
// Angular Material 20+ uses M3 theming system
@use '@angular/material' as mat;

@include mat.core();

// M3 Light theme
$light-theme: mat.define-theme(
  (
    color: (
      theme-type: light,
      primary: mat.$violet-palette,
    ),
  )
);

html {
  @include mat.all-component-themes($light-theme);
}

// M3 Dark theme
[data-theme='dark'] {
  $dark-theme: mat.define-theme(
    (
      color: (
        theme-type: dark,
        primary: mat.$violet-palette,
      ),
    )
  );

  @include mat.all-component-themes($dark-theme);
}
```

---

### Error: The current directory isn't part of an Nx workspace

**Cause:** Running Nx commands from wrong directory or in PowerShell with unquoted paths containing spaces.

**Solution:**

```powershell
# ✅ CORRECT: Use quotes for paths with spaces
cd "C:\Users\Hady Joukhadar\Desktop\Projects\MicroservicesArchitecture\MicroservicesArchitecture-Web"
npx nx serve playground

# OR use semicolon to chain commands in PowerShell
cd "C:\Users\Hady Joukhadar\Desktop\Projects\MicroservicesArchitecture\MicroservicesArchitecture-Web" ; npx nx serve playground

# ❌ WRONG: No quotes with spaces in path
cd C:\Users\Hady Joukhadar\Desktop\Projects\...
```

**PowerShell Path Rules:**

- Always quote paths with spaces: `"C:\Path With Spaces"`
- Use semicolon (`;`) not `&&` to chain commands in PowerShell
- `&&` is for CMD/Bash, not PowerShell

---

### Error: Cannot find tsconfig file 'tsconfig.app.json'

**Cause:** After moving config files into app folders, project.json still uses relative paths. Angular executors run from workspace root, not project root.

**Solution:** Update paths in `project.json` to be relative to workspace root:

```json
{
  "targets": {
    "build": {
      "options": {
        "outputPath": "dist/playground",
        "index": "apps/playground/src/index.html",
        "browser": "apps/playground/src/main.ts",
        "tsConfig": "apps/playground/tsconfig.app.json",
        "styles": ["apps/playground/src/styles.scss"]
      }
    },
    "test": {
      "options": {
        "jestConfig": "apps/playground/jest.config.ts"
      }
    }
  }
}
```

**Key principle:** All paths in `project.json` must be relative to workspace root, even though `project.json` is inside the app folder.

---

## 📦 Dependency Issues

### Peer Dependency Conflicts

**Cause:** Version mismatches between Angular packages.

**Solution:**

```bash
# Check all Angular packages are the same version
npm list @angular/core @angular/common @angular/material

# If versions differ, update to match:
npm install @angular/package-name@~20.3.0
```

**Prevention:** Always install Angular packages with matching version ranges (`~20.3.0`).

---

## 🔧 PowerShell Terminal Commands

### Best Practices for PowerShell

```powershell
# ✅ Correct command chaining
cd "C:\Path\With Spaces" ; npm install

# ✅ Running background processes
cd "C:\workspace" ; npx nx serve app --port=4200

# ❌ Don't use && (bash syntax)
cd path && npm install  # This fails in PowerShell

# ❌ Don't use unquoted paths with spaces
cd C:\Path With Spaces  # This fails
```

### Common PowerShell Commands

```powershell
# Navigate to workspace
cd "C:\Users\YourName\Desktop\Projects\MicroservicesArchitecture\MicroservicesArchitecture-Web"

# Install dependencies
npm install

# Serve applications
npx nx serve web-app        # Port 4200
npx nx serve playground     # Port 4201

# Build applications
npx nx build web-app
npx nx build playground

# Run tests
npx nx test web-app
npx nx test playground

# Reset Nx cache (when things don't work)
npx nx reset
```

---

## 🏗️ Project Structure Issues

### Nx Console Not Showing Projects

**Cause:** Missing or incorrect `project.json` files, or duplicate project.json at root.

**Solution:**

1. Ensure each app has `project.json` in its folder:
   - `apps/web-app/project.json`
   - `apps/playground/project.json`
2. Remove any `project.json` at workspace root
3. Restart VS Code or reload window
4. Check `nx.json` has correct configuration:

```json
{
  "workspaceLayout": {
    "appsDir": "apps",
    "libsDir": "libs"
  }
}
```

---

## 🧪 Testing Issues

### Jest Configuration Not Found

**Cause:** Missing or incorrect path to `jest.config.ts` in `project.json`.

**Solution:**

```json
{
  "targets": {
    "test": {
      "executor": "@nx/jest:jest",
      "options": {
        "jestConfig": "apps/playground/jest.config.ts"
      }
    }
  }
}
```

Ensure `jest.config.ts` exists in the app folder and extends workspace preset:

```typescript
export default {
  displayName: 'playground',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/playground',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
};
```

---

## 🎨 Styling Issues

### CSS Variables Not Working

**Cause:** Missing CSS variable definitions or incorrect theme setup.

**Solution:**

1. Check `src/styles/_variables.scss` exists and is imported in `styles.scss`
2. Ensure theme service is initialized in `main.ts` or app component
3. Verify CSS variables are defined in `:root`:

```scss
:root {
  --primary-color: #6200ee;
  --background-color: #ffffff;
  --text-color: #000000;
}

[data-theme='dark'] {
  --background-color: #121212;
  --text-color: #ffffff;
}
```

---

## 🔄 Cache Issues

### Nx Cache Causing Problems

**Cause:** Stale Nx cache after major changes.

**Solution:**

```bash
# Clear Nx cache
npx nx reset

# Clear npm cache (if needed)
npm cache clean --force

# Reinstall dependencies (if needed)
rm -rf node_modules package-lock.json
npm install
```

---

## 🌐 Port Conflicts

### Port Already in Use

**Cause:** Another application or previous serve process still running on the port.

**Solution:**

```powershell
# Check what's using the port (PowerShell)
netstat -ano | findstr :4200
netstat -ano | findstr :4201

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
npx nx serve playground --port=4202
```

---

## 📚 Import Path Issues

### Cannot find module '@core/...' or '@shared/...'

**Cause:** TypeScript path mappings not configured correctly.

**Solution:**

1. Check `tsconfig.base.json` has path mappings:

```json
{
  "compilerOptions": {
    "paths": {
      "@core": ["libs/core/src/index.ts"],
      "@core/*": ["libs/core/src/lib/*"],
      "@shared": ["libs/shared/src/index.ts"],
      "@shared/*": ["libs/shared/src/lib/*"]
    }
  }
}
```

2. Ensure app's `tsconfig.app.json` extends base config:

```json
{
  "extends": "../../tsconfig.base.json"
}
```

3. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

## 🆘 Getting Help

### Quick Diagnostics

```bash
# Check Nx workspace status
npx nx report

# List all projects
npx nx show projects

# Show project details
npx nx show project playground

# Check project graph
npx nx graph
```

### When Nothing Works

1. **Clear everything and start fresh:**

```bash
# Clear Nx cache
npx nx reset

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Restart VS Code
```

2. **Verify installation:**

```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Check Nx version
npx nx --version
```

---

## 📖 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Nx Documentation](https://nx.dev)
- [Angular Material Documentation](https://material.angular.io)
- [PowerShell Documentation](https://docs.microsoft.com/powershell)

---

**Still having issues?** Check the other documentation files:

- `PROJECT_STRUCTURE.md` - Architecture and patterns
- `QUICK_START.md` - Common tasks and examples
- `SETUP_COMPLETE.md` - What's already configured
