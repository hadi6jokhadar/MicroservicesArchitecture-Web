# ThemeService Export Fix

## Issue

The `ThemeService` was not being exported from the `@ihsan/core` library, causing build errors:

```
TS2305: Module '"@ihsan/core"' has no exported member 'ThemeService'.
TS2305: Module '"@ihsan/core"' has no exported member 'ThemeMode'.
```

## Root Cause

The `ThemeService` exists in `libs/core/src/lib/services/theme.service.ts` but was not included in the library's public API exports (`libs/core/src/index.ts`).

## Solution

Added the ThemeService export to `libs/core/src/index.ts`:

```typescript
// Services
export * from './lib/services/theme.service';
```

This exports:

- ✅ `ThemeService` - The theme management service
- ✅ `ThemeMode` - Type for 'light' | 'dark'
- ✅ `Direction` - Type for 'ltr' | 'rtl'

## Usage

Now you can import ThemeService from `@ihsan/core`:

```typescript
import { ThemeService, ThemeMode } from '@ihsan/core';

@Component({...})
export class MyComponent {
  private _themeService = inject(ThemeService);

  constructor() {
    this._themeService.setColorScheme('ihsan');
    this._themeService.setMode('dark');
  }
}
```

## Files Modified

- ✅ `libs/core/src/index.ts` - Added ThemeService export

## Result

✅ Build errors resolved
✅ ThemeService available from `@ihsan/core`
✅ Admin dashboard can set Ihsan theme
✅ Theme tester component works correctly
