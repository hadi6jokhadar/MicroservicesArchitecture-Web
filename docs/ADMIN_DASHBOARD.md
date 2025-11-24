# Admin Dashboard Interface

## Overview

The admin dashboard interface consists of three main components:

1. **Floating Toolbar** (`shared-admin-toolbar`) - Top navigation bar
2. **Floating Sidebar** (`shared-admin-sidebar`) - Left navigation menu
3. **Content Area** (`app-admin-content`) - Main content display

## Components

### 1. Admin Toolbar (Shared Component)

**Location:** `libs/shared/src/lib/components/admin-toolbar/`

**Features:**

- Floating design with glassmorphism effect
- Transparent background with backdrop blur
- Menu toggle button
- Page title display
- Action buttons (notifications, account)
- Rounded corners (no sharp edges)

**Usage:**

```html
<shared-admin-toolbar (menuToggle)="onMenuToggle()" />
```

### 2. Admin Sidebar (Shared Component)

**Location:** `libs/shared/src/lib/components/admin-sidebar/`

**Features:**

- Centered vertically on the page
- Fixed height with scrollable content
- Background color from theme
- Toggle to show/hide labels
- Smooth animations and hover effects
- Rounded corners
- Custom scrollbar styling

**Usage:**

```html
<shared-admin-sidebar />
```

**Navigation Items:**

- Users
- Home
- Item1-6 (customizable)

### 3. Admin Content (Playground Component)

**Location:** `apps/playground/src/app/admin-content/`

**Features:**

- Proper spacing from toolbar and sidebar
- Responsive grid layout
- Sample content cards
- Rounded corners
- Hover effects

**Usage:**

```html
<app-admin-content />
```

## Ihsan Theme

The admin dashboard uses the new **Ihsan theme** based on vibrant amber and orange colors.

### Color Palette

- **Bright Amber:** `#FFCD00`
- **Orange:** `#FFAB02`
- **Blaze Orange:** `#FF5500`
- **Black:** `#000000`

### Theme Files

**Variables:** `apps/playground/src/styles/_variables.scss`

- Light mode: `[data-theme='ihsan']` or `[data-mode='light'][data-color-scheme='ihsan']`
- Dark mode: `[data-theme='ihsan-dark']` or `[data-mode='dark'][data-color-scheme='ihsan']`

**Material Theme:** `apps/playground/src/styles/_material-theme.scss`

- Uses Angular Material M3 API
- Orange palette for primary
- Yellow palette for tertiary

### Activating Ihsan Theme

The theme is automatically activated when navigating to the admin dashboard:

```typescript
constructor() {
  this._themeService.setColorScheme('ihsan');
}
```

Or manually:

```typescript
themeService.setColorScheme('ihsan');
themeService.setMode('dark'); // or 'light'
```

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│  Toolbar (Floating, Transparent)                │
└─────────────────────────────────────────────────┘

┌──────┐  ┌────────────────────────────────────┐
│      │  │                                    │
│ Side │  │  Content Area                      │
│ bar  │  │  (with spacing from toolbar        │
│      │  │   and sidebar)                     │
│ (Cen │  │                                    │
│ tered│  │  ┌──────┐  ┌──────┐  ┌──────┐    │
│ Scro │  │  │Card 1│  │Card 2│  │Card 3│    │
│ llab │  │  └──────┘  └──────┘  └──────┘    │
│ le)  │  │                                    │
│      │  │  ┌──────┐  ┌──────┐  ┌──────┐    │
└──────┘  │  │Card 4│  │Card 5│  │Card 6│    │
          │  └──────┘  └──────┘  └──────┘    │
          └────────────────────────────────────┘
```

## Design Features

### Rounded Corners

All components use rounded corners via CSS variables:

- `--border-radius-xl: 16px` - Toolbar, Sidebar, Cards
- `--border-radius-lg: 12px` - Nav items

### Spacing

- Toolbar: `var(--spacing-md)` from edges
- Sidebar: `var(--spacing-md)` from left, centered vertically
- Content: Proper margins to avoid overlap

### Animations

- Smooth transitions (0.3s ease)
- Hover effects with scale and transform
- Backdrop blur for glassmorphism

## Running the Demo

1. Start the playground app:

```bash
cd "C:\Users\Hady Joukhadar\Desktop\Projects\MicroservicesArchitecture\MicroservicesArchitecture-Web"
npx nx serve playground
```

2. Navigate to: `http://localhost:4201/admin`

Or from home page, click the "Admin Dashboard" button.

## Customization

### Adding Navigation Items

Edit `admin-sidebar.component.ts`:

```typescript
navItems: INavItem[] = [
  { icon: 'person', label: 'Users', route: '/users' },
  { icon: 'home', label: 'Home', route: '/home' },
  // Add more items...
];
```

### Changing Colors

Modify the Ihsan theme in `_variables.scss`:

```scss
[data-theme='ihsan'] {
  --primary-color: #your-color;
  --accent-color: #your-accent;
}
```

### Adjusting Layout

Modify spacing in component SCSS files:

- Toolbar: `admin-toolbar.component.scss`
- Sidebar: `admin-sidebar.component.scss`
- Content: `admin-content.component.scss`

## Architecture Compliance

✅ **Minimal Code** - Only essential functionality
✅ **Signals** - Using `signal()` for state management
✅ **Colocated Files** - All component files in same folder
✅ **CSS Variables** - All colors from theme variables
✅ **No Wrapper Divs** - Styling from `:host`
✅ **Rounded Corners** - No sharp edges anywhere
✅ **Material Components** - Using Angular Material
✅ **Standalone** - All components are standalone
