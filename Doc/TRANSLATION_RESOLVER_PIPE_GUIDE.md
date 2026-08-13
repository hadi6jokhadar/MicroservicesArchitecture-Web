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
import { TranslatePipe, TranslationService, ITranslationData } from '@ihsan/core';

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
  private readonly _translationService = inject(TranslationService);

  ngOnInit(): void {
    // Get preloaded translations from resolver
    const data = this._route.snapshot.data['translations'] as ITranslationData;

    if (data) {
      this._translationService.setTranslations(data.translations, data.language);
    }
  }
}
```

> **Note:** `setTranslations()` lives on `TranslationService` (`libs/core/src/lib/translation/translation.service.ts`), not on `TranslatePipe`. The resolver (`translationResolver` in `libs/core/src/lib/translation/translation.resolver.ts`) already calls it internally via a `tap()` before the route activates, so most components never need to call it themselves — this manual pattern is only needed if you read `route.snapshot.data` yourself instead of relying on the resolver having already populated the cache.

## Pipe Usage

### Basic Translation

```html
<!-- Simple translation -->
<h1>{{ 'user.title' | translate }}</h1>

<!-- With default value (shown if key not found) -->
<p>{{ 'user.description' | translate:'User Description' }}</p>
```

### Change Language

`TranslatePipe` has no `setLanguage()` method — it is a pure read-only view over whatever is currently cached in `TranslationService`. Changing language means fetching the new language's translations and re-caching them via `TranslationService`, then reloading so every already-rendered pipe instance picks up the change (this is exactly what the sidebar language switcher does — see `libs/shared/src/lib/components/sidebar/sidebar.component.ts`):

```typescript
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslationService } from '@ihsan/core';

export class LanguageSwitcherComponent {
  private readonly _translationService = inject(TranslationService);
  private readonly _platformId = inject(PLATFORM_ID);

  changeLanguage(lang: string): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.setItem('app-language', lang);
    }

    this._translationService.getTranslations(lang).subscribe({
      next: (data) => {
        this._translationService.setTranslations(data.translations, data.language);
        // Reload so every rendered `| translate` pipe re-reads the new cache
        if (isPlatformBrowser(this._platformId)) {
          window.location.reload();
        }
      },
      error: (error) => console.error('Failed to change language:', error),
    });
  }
}
```

```html
<button (click)="changeLanguage('en')">English</button>
<button (click)="changeLanguage('ar')">العربية</button>
```

## Resolver Parameters

The resolver picks the language in this precedence order, then accepts one query parameter for category filtering:

- `localStorage.getItem('app-language')` - checked first (browser only; skipped during SSR) — this is how the language chosen via the sidebar switcher persists across navigations
- `lang` query param - used if no saved language exists
- `'en'` - default if neither is present
- `category` - filter by category (optional query param, no localStorage equivalent)

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
@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform
```

`pure: false` is intentional — an impure pipe is required so every rendered `| translate` instance re-evaluates after `TranslationService.setTranslations()` updates the cache (e.g. after a language change), not just when its own input binding changes.

**Methods:**

- `transform(key: string, arg1?: string | Record<string, unknown>, arg2?: Record<string, unknown>): string` — Translate a key. `arg1` may be a default-value string (with `arg2` as interpolation params), or `arg1` itself may be the params object directly:
  ```html
  {{ 'user.title' | translate }}
  {{ 'user.title' | translate : 'User Management' }}
  {{ 'user.greeting' | translate : 'Hello {{name}}' : { name: user().name } }}
  ```
  Params are substituted via a `{{paramKey}}` placeholder replacement inside the resolved string.

`TranslatePipe` itself has **no** `setLanguage()` or `setTranslations()` methods — it only reads from the cache. Those two methods live on `TranslationService` (see below); the pipe is a thin, injectable, impure read of `TranslationService.getCachedTranslation()`.

### TranslationService (cache read/write — used by both the resolver and the pipe)

```typescript
class TranslationService {
  getTranslations(language: string, category?: string): Observable<ITranslationsDto>; // fetches from API and re-caches
  getCachedTranslations(): Record<string, string>;
  getCachedTranslation(key: string, defaultValue?: string, params?: Record<string, unknown>): string; // what the pipe calls
  getCurrentLanguage(): string;
  getCurrentLanguageSignal(): Signal<string>;
  setTranslations(translations: Record<string, string>, language: string): void; // cache write, no HTTP call
}
```

Source: `libs/core/src/lib/translation/translation.service.ts`.

## Example: Complete Component

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslationService, ITranslationData } from '@ihsan/core';
import { ZardButtonComponent } from '@ihsan/ui';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TranslatePipe, ZardButtonComponent],
  template: `
    <div class="settings-container">
      <h1>{{ 'settings.title' | translate }}</h1>

      <section>
        <h2>{{ 'settings.language' | translate }}</h2>
        <button
          z-button
          [zType]="currentLang() === 'en' ? 'default' : 'outline'"
          (click)="changeLanguage('en')"
        >
          {{ 'settings.english' | translate }}
        </button>
        <button
          z-button
          [zType]="currentLang() === 'ar' ? 'default' : 'outline'"
          (click)="changeLanguage('ar')"
        >
          {{ 'settings.arabic' | translate }}
        </button>
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
  private readonly _translationService = inject(TranslationService);

  currentLang = signal<string>('en');

  ngOnInit(): void {
    const data = this._route.snapshot.data['translations'] as ITranslationData;

    if (data) {
      this._translationService.setTranslations(data.translations, data.language);
      this.currentLang.set(data.language);
    }
  }

  changeLanguage(lang: string): void {
    this._translationService.getTranslations(lang).subscribe((result) => {
      this._translationService.setTranslations(result.translations, result.language);
      this.currentLang.set(result.language);
    });
  }
}
```

> `z-button`/`ZardButtonComponent` is this project's actual button component (`@ihsan/ui`, per `Doc/ZARDUI_AI_REFERENCE.md`) — there is no `@ngzard/ui/button` package or `zd-button`/`ZdButtonModule` in this codebase.

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
  // The pipe does NOT auto-fetch. It only ever reads whatever TranslationService
  // currently has cached in its `_translations` signal. In every app in this
  // monorepo (`apps/admin`, `apps/nasheed/admin`, `apps/polysnap/admin`), every
  // top-level route already attaches `translationResolver` in `app.routes.ts`,
  // so by the time any routed component renders, the cache is already populated
  // and this component needs no extra wiring. Only a component rendered wholly
  // outside the router (or before any resolver has run) would see raw keys.
}
```

## Best Practices

1. **Use resolver for route-level components** - Preload translations before component renders
2. **Provide default values** - Use second parameter for fallback text
3. **Batch language changes via `TranslationService`** - Call `getTranslations(lang)` then `setTranslations(...)` to reload all cached translations at once (see "Change Language" above); there is no `setLanguage()` shortcut
4. **Cache at route level** - Resolver caches translations for the entire route tree
5. **Use meaningful keys** - Structure: `feature.section.element` (e.g., `user.profile.title`)

## Error Handling

The resolver and pipe handle errors gracefully:

- **Resolver**: Catches the HTTP error, logs it via `console.error('Failed to load translations:', error)`, and falls back to an empty translations object for the requested language so the route still activates
- **Pipe**: Returns the key or default value if translation fails (never throws)

```typescript
// If 'user.title' fails to load, shows 'User Management' instead
{{ 'user.title' | translate:'User Management' }}
```

## Integration with Translation Service

The pipe and resolver both delegate to the existing `TranslationService`, which calls the Translation microservice through the Gateway (never a hardcoded per-service port — see root `CLAUDE.md`'s Cross-Stack Communication Rules):

```typescript
// Backend endpoint (public, versioned) — built as `${environment.apiUrls.gateway}/api/v1/translations/{language}`
GET /api/v1/translations/{language}?category={category}

// Response (ITranslationsDto)
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
**Version:** 1.1
**Last Updated:** August 13, 2026

### Changelog

- **1.1 (Aug 13, 2026):** Audited against current source and corrected several inaccuracies: `TranslatePipe` never had `setLanguage()`/`setTranslations()` methods (those live on `TranslationService`); the pipe's `transform()` also accepts an interpolation-params argument, not just a default-value string; the backend endpoint is versioned (`/api/v1/translations/{language}`), not `/api/translations/{language}`; and the `ZdButtonModule`/`@ngzard/ui/button` example referenced a package that doesn't exist in this repo (replaced with the actual `ZardButtonComponent`/`@ihsan/ui`).
