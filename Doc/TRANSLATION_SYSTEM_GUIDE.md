# Translation System Guide

## Overview

This guide explains how to use the translation system in the Angular application. The translation system uses a **resolver-based caching approach** where translations are loaded once via HTTP on route initialization and cached for fast lookups throughout the application.

## Architecture

### Key Components

1. **TranslationResolver** - Loads translations from localStorage or API on route activation
2. **TranslationService** - Caches translations in signals and provides lookup methods
3. **TranslatePipe** - Pure pipe that reads from cached translations (NO API calls)

### Flow Diagram

```
Route Load → Resolver checks localStorage → Load from API if needed → Cache in Service → Pipe reads from cache
```

## Translation Files

Translation files are stored as JSON in `apps/admin/src/assets/i18n/`:

- `en.json` - English translations
- `ar.json` - Arabic translations

### File Structure

```json
{
  "common.save": "Save",
  "common.cancel": "Cancel",
  "page.title.dashboard": "Dashboard",
  "sidebar.pages.users": "Users",
  "sidebar.groups.system": "System",
  "login.email": "Email",
  "login.validation.emailRequired": "Email is required"
}
```

### Key Naming Conventions

Use **dot notation** to organize keys hierarchically:

- **Common actions**: `common.{action}` - e.g., `common.save`, `common.delete`
- **Page titles**: `page.title.{pageName}` - e.g., `page.title.dashboard`
- **Page subtitles**: `page.subtitle.{pageName}` - e.g., `page.subtitle.translations`
- **Component-specific**: `{component}.{element}` - e.g., `login.email`, `sidebar.darkMode`
- **Validation messages**: `{component}.validation.{field}{Error}` - e.g., `login.validation.emailRequired`
- **Table headers**: `{component}.table.{column}` - e.g., `translations.table.key`
- **Actions**: `{component}.actions.{action}` - e.g., `translations.actions.viewValues`
- **Dialog content**: `{component}.dialog.{element}` - e.g., `translations.dialog.addTitle`
- **Sidebar pages**: `sidebar.pages.{pageName}` - e.g., `sidebar.pages.dashboard`
- **Sidebar groups**: `sidebar.groups.{groupName}` - e.g., `sidebar.groups.user`

## Using the Translate Pipe

### Basic Usage

The translate pipe is the **primary way** to display translated text in templates:

```html
<!-- Simple translation -->
<h1>{{ 'page.title.dashboard' | translate }}</h1>

<!-- With default fallback value -->
<p>{{ 'unknown.key' | translate: 'Default Text' }}</p>

<!-- In component properties -->
<button [aria-label]="'common.save' | translate">
  {{ 'common.save' | translate }}
</button>
```

### In Component TypeScript

For programmatic access to translations:

```typescript
import { TranslationService } from '@ihsan/core';

export class MyComponent {
  private _translationService = inject(TranslationService);

  getTranslation(key: string, defaultValue?: string): string {
    return this._translationService.getCachedTranslation(key, defaultValue);
  }
}
```

### Dynamic Translation Keys

When the key is dynamic:

```html
<!-- Using computed or signal -->
@for (item of items(); track item.id) {
<span>{{ item.translationKey | translate }}</span>
}

<!-- With prefix -->
@for (status of statuses; track status) {
<span>{{ 'status.' + status | translate }}</span>
}
```

## Language Switching

### Current Implementation

Language switcher is available in the sidebar with:

- Dropdown menu showing available languages
- Current language stored in localStorage (`app-language` key)
- Page reload after language change to apply translations

### Programmatic Language Change

```typescript
onLanguageChange(languageCode: string): void {
  // Save to localStorage
  localStorage.setItem('app-language', languageCode);
  this.currentLanguage.set(languageCode);

  // Load new translations
  this._translationService.getTranslations(languageCode).subscribe({
    next: (data) => {
      this._translationService.setTranslations(data.translations, data.language);
      // Reload to apply translations
      window.location.reload();
    }
  });
}
```

## Adding New Translation Keys

### Step-by-Step Process

**CRITICAL: NEVER use hardcoded text in the application. ALWAYS use translation keys.**

1. **Identify the text** that needs translation
2. **Choose appropriate key name** following naming conventions
3. **Add to both `en.json` and `ar.json`** files
4. **Use translate pipe** in template

### Example: Adding a New Button

```typescript
// ❌ WRONG - Hardcoded text
<button z-button>Submit Form</button>

// ✅ CORRECT - Using translation key
<button z-button>{{ 'common.submit' | translate }}</button>
```

### Add to Translation Files

**en.json:**

```json
{
  "common.submit": "Submit Form"
}
```

**ar.json:**

```json
{
  "common.submit": "إرسال النموذج"
}
```

## RTL (Right-to-Left) Support

### Automatic RTL

The application automatically applies RTL layout when Arabic language is selected:

```typescript
// In app.ts - Global RTL handler
effect(() => {
  if (isPlatformBrowser(this._platformId)) {
    const currentLanguage =
      this._translationService.getCurrentLanguageSignal()();
    const htmlElement = document.documentElement;

    if (currentLanguage === 'ar') {
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.setAttribute('lang', 'ar');
    } else {
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.setAttribute('lang', currentLanguage);
    }
  }
});
```

**What Automatically Adapts to RTL:**

- ✅ **Document direction** - `dir` attribute set in app.ts when language changes
- ✅ **Dialogs** - Inherit RTL direction from document automatically (no logic in component)
- ✅ **Sheets** - Inherit RTL direction + position flipped via global CSS in styles.css
- ✅ **Zero component logic** - All RTL handled globally at app level

### RTL Helper Service (RtlService)

For programmatic RTL detection and sheet side flipping:

```typescript
import { RtlService } from '@ihsan/core';

export class MyComponent {
  private _rtlService = inject(RtlService);
  private _sheetService = inject(ZardSheetService);

  openSheet(): void {
    this._sheetService.create({
      zContent: MySheetComponent,
      // Auto-flips: 'right' → 'left' in Arabic
      zSide: this._rtlService.getSheetSide('right'),
      zHideFooter: true,
    });
  }
}
```

**RtlService API:**

| Method                    | Returns                                  | Description                                             |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| `isRtl()`                 | `boolean`                                | Returns true if current language is RTL                 |
| `isLanguageRtl(code)`     | `boolean`                                | Check if specific language code is RTL (ar, he, fa, ur) |
| `getDirection()`          | `'rtl' \| 'ltr'`                         | Get current text direction                              |
| `getSheetSide(side)`      | `'left' \| 'right' \| 'top' \| 'bottom'` | Flips horizontal sides for RTL                          |
| `getSheetTransform(side)` | `string`                                 | Get CSS transform for sheet animation                   |

### ExcludeRtlDirective - Force LTR for Specific Elements

Some components should remain LTR even in RTL mode (e.g., pagination, phone numbers, code blocks).

**Usage:**

```typescript
import { ExcludeRtlDirective } from '@ihsan/shared';

@Component({
  imports: [ExcludeRtlDirective, ZardPaginationImports],
  template: `
    <!-- Pagination stays LTR in both languages -->
    <z-pagination appExcludeRtl [zTotal]="totalPages()" />

    <!-- Phone numbers stay LTR -->
    <span appExcludeRtl>+1 (555) 123-4567</span>

    <!-- Code blocks stay LTR -->
    <code appExcludeRtl>const x = 10;</code>
  `
})
```

**What it does:**

- Sets `dir="ltr"` on the element
- Adds `.exclude-rtl` class for additional CSS control

**When to use:**

- ✅ Pagination controls
- ✅ Phone numbers
- ✅ Email addresses
- ✅ Code snippets
- ✅ Numeric data (sometimes)
- ✅ URLs

**When NOT to use:**

- ❌ Regular text content
- ❌ Buttons (should flip)
- ❌ Form inputs (should flip)
- ❌ Navigation menus (should flip)

### Global RTL CSS (styles.css)

```css
/* Dialogs inherit RTL direction */
[dir='rtl'] [data-slot='dialog'] {
  direction: rtl;
}

/* Sheets inherit RTL direction */
[dir='rtl'] [data-slot='sheet'] {
  direction: rtl;
}

/* Flip sheet positions for RTL */
[dir='rtl'] [data-slot='sheet'][data-side='left'] {
  left: auto;
  right: 0;
}

[dir='rtl'] [data-slot='sheet'][data-side='right'] {
  right: auto;
  left: 0;
}
```

### CSS for RTL

Use **logical CSS properties** instead of physical directions:

```scss
// ❌ WRONG - Physical properties
.element {
  margin-left: 1rem;
  padding-right: 2rem;
  border-left: 1px solid;
}

// ✅ CORRECT - Logical properties (RTL-aware)
.element {
  margin-inline-start: 1rem; // left in LTR, right in RTL
  padding-inline-end: 2rem; // right in LTR, left in RTL
  border-inline-start: 1px solid;
}
```

### Common Logical Properties

| Physical            | Logical                | Description          |
| ------------------- | ---------------------- | -------------------- |
| `margin-left`       | `margin-inline-start`  | Start of inline axis |
| `margin-right`      | `margin-inline-end`    | End of inline axis   |
| `padding-left`      | `padding-inline-start` | Start padding        |
| `padding-right`     | `padding-inline-end`   | End padding          |
| `border-left`       | `border-inline-start`  | Start border         |
| `border-right`      | `border-inline-end`    | End border           |
| `left`              | `inset-inline-start`   | Start position       |
| `right`             | `inset-inline-end`     | End position         |
| `text-align: left`  | `text-align: start`    | Align to start       |
| `text-align: right` | `text-align: end`      | Align to end         |

### RTL Helper Services

The application provides helper services and directives to make RTL support easier:

**RtlService** - Check current direction and adjust component behavior:

```typescript
import { RtlService } from '@ihsan/core';

export class MyComponent {
  private readonly _rtlService = inject(RtlService);

  ngOnInit() {
    // Check if current language is RTL
    if (this._rtlService.isRtl()) {
      // Apply RTL-specific logic
    }

    // Get current text direction
    const direction = this._rtlService.getDirection(); // 'rtl' or 'ltr'

    // Get sheet side adjusted for RTL
    const sheetSide = this._rtlService.getSheetSide('right');
    // Returns 'left' when RTL, 'right' when LTR
  }
}
```

**ExcludeRtlDirective** - Exclude specific components from RTL changes:

```html
<!-- Pagination stays LTR even in Arabic -->
<z-pagination
  appExcludeRtl
  [zTotal]="totalPages()"
  [(zPageIndex)]="currentPage"
/>

<!-- Phone number input stays LTR -->
<input appExcludeRtl type="tel" formControlName="phone" />

<!-- Code blocks stay LTR -->
<pre appExcludeRtl><code>{{ codeSnippet }}</code></pre>
```

**Components That Should Use `appExcludeRtl`:**

- Pagination controls
- Phone number inputs
- Numeric displays
- Code blocks
- Dates in numeric format (e.g., "2026-01-28")

## Best Practices

### ✅ DO

- **Always use translation keys** for ALL user-facing text
- Add translations for **both English and Arabic** simultaneously
- Use **descriptive key names** that indicate context
- Group related keys with **dot notation**
- Use **logical CSS properties** for RTL support
- Keep translation files **alphabetically organized**
- Provide **default fallback values** for critical text

### ❌ DON'T

- **Never hardcode text** in templates or components
- Don't use physical CSS properties (left, right, etc.)
- Don't call the translation API from components (use cached values)
- Don't create separate translation files for each component
- Don't use generic key names like `text1`, `label2`

## Translation File Organization

### Recommended Structure

```json
{
  "app.title": "Admin Portal",

  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",

  "page.title.dashboard": "Dashboard",
  "page.title.users": "Users",

  "sidebar.pages.dashboard": "Dashboard",
  "sidebar.pages.users": "Users",
  "sidebar.groups.user": "User Management",
  "sidebar.groups.system": "System",

  "login.title": "Welcome Back",
  "login.email": "Email",
  "login.password": "Password",
  "login.validation.emailRequired": "Email is required",

  "users.table.name": "Name",
  "users.table.email": "Email",
  "users.actions.edit": "Edit User",
  "users.dialog.addTitle": "Add New User"
}
```

## Troubleshooting

### Translation Not Updating

**Problem:** Changed translation file but text not updating

**Solution:**

1. Clear browser cache and localStorage
2. Reload the page (translations load on route activation)
3. Verify translation key matches exactly (case-sensitive)

### Missing Translation

**Problem:** Seeing translation key instead of text

**Solution:**

1. Check if key exists in current language file (`en.json` or `ar.json`)
2. Verify spelling of translation key
3. Check browser console for errors
4. Provide fallback value: `{{ 'key' | translate: 'Fallback' }}`

### RTL Layout Issues

**Problem:** Layout broken in Arabic (RTL)

**Solution:**

1. Replace physical CSS properties with logical properties
2. Use `margin-inline-start` instead of `margin-left`
3. Use `inset-inline-start` instead of `left`
4. Test layout in both LTR and RTL modes

## Performance Considerations

### Why This Architecture?

1. **Single HTTP request** - Translations loaded once via resolver
2. **Fast lookups** - Pipe reads from cached signal (instant)
3. **No API calls in templates** - Pure pipe with cached data
4. **Persistent storage** - localStorage prevents reload on navigation

### Optimization Tips

- Keep translation files reasonable size (< 100KB)
- Use lazy loading for feature-specific translations if needed
- Avoid dynamic string concatenation in templates
- Use computed signals for complex translation logic

## Examples

### Complete Component Example

```typescript
// user-list.component.ts
import { Component, signal, inject } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';
import { ZardButtonComponent, ZardTableComponent } from '@ihsan/ui';

@Component({
  selector: 'app-user-list',
  imports: [TranslatePipe, ZardButtonComponent, ZardTableComponent],
  template: `
    <div class="user-list">
      <h1>{{ 'page.title.users' | translate }}</h1>

      <button z-button>
        {{ 'users.actions.addUser' | translate }}
      </button>

      <z-table>
        <thead>
          <tr>
            <th>{{ 'users.table.name' | translate }}</th>
            <th>{{ 'users.table.email' | translate }}</th>
            <th>{{ 'users.table.role' | translate }}</th>
          </tr>
        </thead>
      </z-table>
    </div>
  `,
})
export class UserListComponent {
  // Component logic
}
```

### Translation Files for Above Component

**en.json:**

```json
{
  "page.title.users": "User Management",
  "users.actions.addUser": "Add User",
  "users.table.name": "Name",
  "users.table.email": "Email",
  "users.table.role": "Role"
}
```

**ar.json:**

```json
{
  "page.title.users": "إدارة المستخدمين",
  "users.actions.addUser": "إضافة مستخدم",
  "users.table.name": "الاسم",
  "users.table.email": "البريد الإلكتروني",
  "users.table.role": "الدور"
}
```

## Related Documentation

- [Angular Instructions](../../../.github/instructions/Angular.instructions.md) - Critical rules for translation usage
- [COMPONENT_USAGE_GUIDE.md](./COMPONENT_USAGE_GUIDE.md) - Zardui components reference
- Translation Service source code at `libs/core/src/lib/translation/`

---

**Version:** 1.0  
**Last Updated:** February 3, 2026  
**Maintained by:** Development Team
