# Theme Tester Component

## Overview

A reusable theme testing component that allows you to test and customize theme colors, switch between light/dark modes, and preview all UI components with the current theme.

## Location

- **Component**: `libs/shared/src/lib/components/theme-tester/`
- **Exported from**: `@web-app/shared`

## Features

### 1. Theme Selection

- Switch between predefined themes: Light, Dark, Blue, Green
- Quick toggle between Light and Dark modes
- Themes are persisted in localStorage

### 2. Text Direction Control

- Toggle between LTR (Left-to-Right) and RTL (Right-to-Left)
- Direction is persisted in localStorage

### 3. Custom Color Picker

- Pick custom primary and accent colors using color pickers
- Apply custom colors dynamically to CSS variables
- Reset to default theme colors

### 4. Live Preview

Preview all theme elements including:

- **Color Swatches**: Primary, Accent, Success, Error, Warning, Info
- **Typography**: Headings, body text, secondary text, disabled text
- **Buttons**: All button variants (primary, secondary, success, error, warning, info)
- **Cards**: Card layouts with headers, body, and footers
- **Form Elements**: Inputs, selects, checkboxes
- **Alerts**: Success, error, warning, and info alerts

## Usage in Any Project

### 1. Import the Component

```typescript
import { ThemeTesterComponent } from '@web-app/shared';
```

### 2. Add Route

```typescript
{
  path: 'theme-tester',
  loadComponent: () =>
    import('@web-app/shared').then((m) => m.ThemeTesterComponent),
}
```

### 3. Link to Theme Tester

```html
<a routerLink="/theme-tester">Theme Tester</a>
```

Or with Material Button:

```html
<button mat-raised-button routerLink="/theme-tester">
  <mat-icon>palette</mat-icon>
  Theme Tester
</button>
```

## Implementation in Playground

The theme tester has been integrated into the playground app:

1. **Route**: `/theme-tester`
2. **Navigation**: Available from home page via "Theme Tester" button
3. **Back Navigation**: Back button returns to home page

## How It Works

### Theme Service Integration

The component uses the **dynamic** `ThemeService` from `@web-app/core`:

**Color Scheme Management:**

- `setColorScheme(scheme: string)`: Set color scheme (e.g., 'default', 'blue', 'green', or any custom name)
- `colorScheme`: Signal for current color scheme

**Mode Management:**

- `setMode(mode: 'light' | 'dark')`: Set theme mode
- `toggleMode()`: Toggle between light and dark modes
- `mode`: Signal for current mode ('light' or 'dark')

**Combined Management:**

- `setTheme(scheme: string, mode: ThemeMode)`: Set both color scheme and mode at once
- `getCurrentTheme()`: Get combined theme string (e.g., 'blue-dark', 'light')

**Direction:**

- `setDirection(dir)`: Set text direction (ltr/rtl)
- `toggleDirection()`: Toggle between LTR and RTL
- `direction`: Signal for current text direction

### Dynamic Theme System

The theme service uses a **flexible, dynamic approach**:

- **Color Scheme**: Any string value (not limited to predefined themes)
- **Mode**: Either 'light' or 'dark'
- **HTML Attributes**: Sets 3 attributes for maximum CSS flexibility:
  - `data-theme`: Combined value (e.g., 'blue-dark') for backward compatibility
  - `data-color-scheme`: Color scheme only (e.g., 'blue')
  - `data-mode`: Mode only (e.g., 'dark')

### Custom Color Application

Custom colors are applied by setting CSS variables on the document root:

```typescript
document.documentElement.style.setProperty('--primary-color', color);
document.documentElement.style.setProperty('--accent-color', color);
```

### CSS Variables Used

All colors reference the standard CSS variables defined in `_variables.scss`:

- `--primary-color` and variants (50-900)
- `--accent-color` and variants (50-900)
- `--background-color`, `--background-color-secondary`, `--background-color-tertiary`
- `--text-color`, `--text-color-secondary`, `--text-color-tertiary`, `--text-color-disabled`
- `--border-color`, `--border-color-light`, `--border-color-dark`
- `--success-color`, `--error-color`, `--warning-color`, `--info-color`

## Testing Theme Changes

1. Navigate to `/theme-tester`
2. **Select a color scheme**: Default, Blue, or Green
3. **Select a mode**: Light or Dark (or use Toggle Mode button)
4. Try custom colors using the color pickers
5. Observe how all components update in real-time
6. Test RTL/LTR direction changes
7. All changes are automatically persisted to localStorage

## Adding Custom Color Schemes

The theme system is fully dynamic. To add a new color scheme (e.g., 'purple'):

### 1. Add CSS Variables (\_variables.scss)

```scss
// Purple Light Mode
[data-mode='light'][data-color-scheme='purple'] {
  --primary-color: #9c27b0;
  --primary-color-50: #f3e5f5;
  // ... other color variables
}

// Purple Dark Mode
[data-mode='dark'][data-color-scheme='purple'] {
  --primary-color: #ba68c8;
  --background-color: #121212;
  // ... darker variants
}
```

### 2. Add Material Theme (\_material-theme.scss)

```scss
[data-mode='light'][data-color-scheme='purple'] {
  $purple-theme: mat.define-theme(
    (
      color: (
        theme-type: light,
        primary: mat.$purple-palette,
      ),
    )
  );
  @include mat.all-component-themes($purple-theme);
}

[data-mode='dark'][data-color-scheme='purple'] {
  $purple-dark-theme: mat.define-theme(
    (
      color: (
        theme-type: dark,
        primary: mat.$purple-palette,
      ),
    )
  );
  @include mat.all-component-themes($purple-dark-theme);
}
```

### 3. Use It

```typescript
// Set color scheme
themeService.setColorScheme('purple');

// Or set both scheme and mode
themeService.setTheme('purple', 'dark');
```

**No TypeScript changes required!** The theme service accepts any string as a color scheme name.

## Responsive Design

The component is fully responsive:

- Stacked layout on mobile devices
- Grid layouts adapt to screen size
- Touch-friendly controls

## Future Enhancements

Potential improvements:

- Export theme configuration as JSON
- Import custom theme presets
- Share theme via URL parameters
- More granular color customization
- Theme comparison side-by-side
- Accessibility testing indicators
