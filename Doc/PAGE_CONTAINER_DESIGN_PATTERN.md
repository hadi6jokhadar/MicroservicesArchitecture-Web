# Page Container Design Pattern

## Overview

All pages routed through the admin application use a **seamless container design** managed centrally by the `main-content` element in `pages.component.scss`. This ensures consistent styling across all pages without requiring each page to redefine container properties.

## How It Works

The `pages.component.scss` defines the base container styling for all routed pages:

```scss
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem; // Desktop padding
  background-color: var(--background);
  color: var(--foreground);

  @media (max-width: 768px) {
    padding: 1rem; // Tablet padding
  }

  @media (max-width: 480px) {
    padding: 0.75rem; // Mobile padding
  }
}
```

## Rules for Page Components

### ✅ DO:

- **Style only page-specific content** - components, sections, form elements
- **Use `display: block`** for `:host` if needed for layout
- **Reuse the base styling** - padding, background, and text color are inherited
- **Add content-specific spacing** using margin/padding on child elements

### ❌ DON'T:

- **Duplicate padding** on `:host` - it breaks the seamless design
- **Override background-color or color** - use CSS variables inherited from main-content
- **Add unnecessary wrapper divs** - style elements directly

## Example: Proper Page Styling

```typescript
// ✅ CORRECT
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {}
```

```scss
:host {
  display: block;
}

.dashboard-container {
  h1 {
    margin: 0 0 1rem 0; // Content-specific spacing
    font-size: 2rem;
    font-weight: 600;
  }
}
```

```html
<div class="dashboard-container">
  <h1>Dashboard</h1>
  <!-- Page content here -->
</div>
```

## Responsive Design

Padding adjusts automatically across breakpoints:

- **Desktop (>768px)**: 1.5rem padding
- **Tablet (≤768px)**: 1rem padding
- **Mobile (≤480px)**: 0.75rem padding

Each page component **does not need to define breakpoints** for container padding—they inherit this automatically.

## Benefits

1. **Consistency** - All pages have identical spacing and background
2. **Maintainability** - Update styling in one place affects all pages
3. **Responsive** - Mobile adjustments work automatically across the app
4. **Seamless Navigation** - Users don't see design shifts when routing between pages

---

**Last Updated:** January 18, 2026
