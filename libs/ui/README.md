# @ngzard/ui Configuration

## Setup Complete ✅

The @ngzard/ui library has been manually configured for your project.

### What's Been Set Up

1. **UI Library Structure**

   - `libs/ui/src/lib/components/` - Components directory
   - `libs/ui/src/lib/utils/` - Utility functions (including `cn` helper)

2. **Styles**

   - `apps/admin/src/styles.css` - Global styles with Tailwind directives and CSS variables
   - Theme variables for light/dark mode support

3. **Dependencies**

   - `@ngzard/ui` - UI component library
   - `clsx` - Conditional class names
   - `tailwind-merge` - Merge Tailwind classes
   - `class-variance-authority` - Component variants

4. **Path Aliases**
   - `@ihsan/ui` - Access UI library components and utils

## Usage

### Import Components

```typescript
import { Button } from '@ngzard/ui/button';
import { Card } from '@ngzard/ui/card';
```

### Use Utility Functions

```typescript
import { cn } from '@ihsan/ui';

// Merge class names
const className = cn('base-class', condition && 'conditional-class');
```

### Add Components

To add new @ngzard/ui components:

```bash
npx @ngzard/ui add button
npx @ngzard/ui add card
npx @ngzard/ui add input
# etc.
```

Components will be added to `libs/ui/src/lib/components/`

## Available Components

Visit [ngzard documentation](https://ngzard.dev) for the full list of available components.

## CSS Variables

The theme uses CSS variables defined in `styles.css`:

- Light mode: Default root variables
- Dark mode: `.dark` class variables

Customize by modifying the CSS variables in `apps/admin/src/styles.css`
