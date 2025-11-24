# ESLint Configuration Fix

## Issue

The ESLint configuration for `libs/shared` and `libs/core` was set to require the prefix `"lib"` for component selectors, but the `project.json` files specify `"shared-"` as the prefix.

This caused lint errors:

```
The selector should start with one of these prefixes: "lib"
```

## Solution

Updated the ESLint configuration files to match the project configuration:

### Files Modified:

1. `libs/shared/eslint.config.mjs`
2. `libs/core/eslint.config.mjs`

### Changes:

Changed the `@angular-eslint/component-selector` and `@angular-eslint/directive-selector` prefix from `"lib"` to `"shared"`:

```javascript
// Before
prefix: 'lib',

// After
prefix: 'shared',
```

## Result

✅ ESLint now correctly validates component selectors with the `shared-` prefix
✅ No more lint errors for `shared-admin-toolbar` and `shared-admin-sidebar` components
✅ Consistent configuration across project.json and ESLint config

## Component Selector Convention

All components in `libs/core` and `libs/shared` should use the `shared-` prefix:

```typescript
@Component({
  selector: 'shared-my-component', // ✅ Correct
  // ...
})
```

```html
<!-- Usage -->
<shared-my-component></shared-my-component>
```
