# Translation Resolver & Pipe Usage Guide

## Overview

The translation system provides:

1. **TranslationResolver** - Preloads translations for a route
2. **TranslatePipe** - Translates keys in templates

## Setup

### 1. Configure Route with Resolver

```typescript
import { Routes } from '@angular/router';
import { translationResolver } from '@ihsan/core';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    resolve: {
      translations: translationResolver,
    },
  },
];
```

### 2. Use in Component

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, ITranslationData } from '@ihsan/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <h1>{{ 'dashboard.title' | translate }}</h1>
    <p>{{ 'dashboard.welcome' | translate : 'Welcome to dashboard' }}</p>
    <button>{{ 'common.save' | translate }}</button>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _translatePipe = inject(TranslatePipe);

  ngOnInit(): void {
    // Get preloaded translations from resolver
    const data = this._route.snapshot.data['translations'] as ITranslationData;

    if (data) {
      this._translatePipe.setTranslations(data.translations, data.language);
    }
  }
}
```

## Pipe Usage

### Basic Translation

```html
<!-- Simple translation -->
<h1>{{ 'user.title' | translate }}</h1>

<!-- With default value (shown if key not found) -->
<p>{{ 'user.description' | translate:'User Description' }}</p>
```

### Change Language

```typescript
import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';

export class LanguageSwitcherComponent {
  private readonly _translatePipe = inject(TranslatePipe);

  changeLanguage(lang: string): void {
    this._translatePipe.setLanguage(lang);
  }
}
```

```html
<button (click)="changeLanguage('en')">English</button>
<button (click)="changeLanguage('ar')">العربية</button>
```

## Resolver Parameters

The resolver accepts query parameters:

- `lang` - Language code (default: 'en')
- `category` - Filter by category (optional)

```typescript
// Navigate with language parameter
this._router.navigate(['/dashboard'], {
  queryParams: { lang: 'ar' },
});

// Navigate with category filter
this._router.navigate(['/dashboard'], {
  queryParams: { lang: 'en', category: 'admin' },
});
```

## API Reference

### TranslationResolver

```typescript
export const translationResolver: ResolveFn<ITranslationData>;
```

**Returns:** `ITranslationData`

```typescript
interface ITranslationData {
  translations: Record<string, string>;
  language: string;
}
```

### TranslatePipe

```typescript
@Pipe({ name: 'translate', standalone: true })
export class TranslatePipe implements PipeTransform
```

**Methods:**

- `transform(key: string, defaultValue?: string): string` - Translate a key
- `setLanguage(language: string, category?: string): void` - Change language
- `setTranslations(translations: Record<string, string>, language: string): void` - Set translations directly

## Example: Complete Component

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, ITranslationData } from '@ihsan/core';
import { ZdButtonModule } from '@ngzard/ui/button';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TranslatePipe, ZdButtonModule],
  template: `
    <div class="settings-container">
      <h1>{{ 'settings.title' | translate }}</h1>

      <section>
        <h2>{{ 'settings.language' | translate }}</h2>
        <zd-button
          (click)="changeLanguage('en')"
          [variant]="currentLang() === 'en' ? 'primary' : 'secondary'"
        >
          {{ 'settings.english' | translate }}
        </zd-button>
        <zd-button
          (click)="changeLanguage('ar')"
          [variant]="currentLang() === 'ar' ? 'primary' : 'secondary'"
        >
          {{ 'settings.arabic' | translate }}
        </zd-button>
      </section>

      <section>
        <p>
          {{
            'settings.description' | translate : 'Configure your preferences'
          }}
        </p>
      </section>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _translatePipe = inject(TranslatePipe);

  currentLang = signal<string>('en');

  ngOnInit(): void {
    const data = this._route.snapshot.data['translations'] as ITranslationData;

    if (data) {
      this._translatePipe.setTranslations(data.translations, data.language);
      this.currentLang.set(data.language);
    }
  }

  changeLanguage(lang: string): void {
    this._translatePipe.setLanguage(lang);
    this.currentLang.set(lang);
  }
}
```

## Without Resolver (Direct Usage)

You can use the pipe without the resolver:

```typescript
import { Component } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';

@Component({
  selector: 'app-simple',
  standalone: true,
  imports: [TranslatePipe],
  template: ` <h1>{{ 'app.title' | translate }}</h1> `,
})
export class SimpleComponent {
  // Pipe will automatically load translations on initialization
}
```

## Best Practices

1. **Use resolver for route-level components** - Preload translations before component renders
2. **Provide default values** - Use second parameter for fallback text
3. **Batch language changes** - Use `setLanguage()` to reload all translations at once
4. **Cache at route level** - Resolver caches translations for the entire route tree
5. **Use meaningful keys** - Structure: `feature.section.element` (e.g., `user.profile.title`)

## Error Handling

The resolver and pipe handle errors gracefully:

- **Resolver**: Returns empty translations object on error
- **Pipe**: Returns the key or default value if translation fails
- **Console warnings**: Errors are logged for debugging

```typescript
// If 'user.title' fails to load, shows 'User Management' instead
{{ 'user.title' | translate:'User Management' }}
```

## Integration with Translation Service

The pipe and resolver use the existing `TranslationService`:

```typescript
// Backend endpoint (public)
GET /api/translations/{language}?category={category}

// Response
{
  "language": "en",
  "translations": {
    "app.title": "My Application",
    "user.welcome": "Welcome, User!",
    "common.save": "Save",
    "common.cancel": "Cancel"
  }
}
```

---

**Created:** February 3, 2026  
**Version:** 1.0
