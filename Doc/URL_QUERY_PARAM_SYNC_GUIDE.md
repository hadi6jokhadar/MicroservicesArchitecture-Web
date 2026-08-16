# URL Query-Param Sync Guide

**Purpose:** How every list/table page's filters and pagination sync to the URL's query params, so a link to a filtered+paginated view can be shared/bookmarked, and browser back/forward works.
**Read When:**

- Creating a new list/table page (`fe-create-crud-page`/`fe-create-table` skills already bake this in — this doc explains the reasoning behind the template)
- Adding a new filter field to an existing list page
- Debugging why a shared link doesn't reproduce the expected filtered view, or why pagination/back-forward behaves unexpectedly
- Deciding whether a page's data-loading is genuinely server-paginated vs client-side filtered over a resolver-preloaded dataset (the two need different wiring — see below)

---

## Why this exists

Every list page previously kept filters and pagination as component-local state only — nothing was reflected in the URL. There was no way to reach a specific filtered/paginated view except by manually re-clicking filters after landing on the page. This guide covers the pattern that fixed that across all 18 list pages in the app (admin, nasheed/admin, polysnap/admin, and the shared identity feature lib).

## The key constraint: route reuse

No custom `RouteReuseStrategy` is registered anywhere in this app, so Angular's default reuse strategy keeps a list component **alive** when only its query params change — `ngOnInit` does **not** rerun. This means a one-time `ngOnInit()` read of the URL cannot restore state for browser back/forward navigation. The only correct mechanism is a **live subscription to `ActivatedRoute.queryParamMap`**, which fires on every navigation (initial mount, in-app changes, and back/forward alike) while the component instance stays the same.

## Shared utility

`libs/core/src/lib/utils/query-params.util.ts` (exported via `@ihsan/core`) — four small pure functions, no base class, no generic "list controller":

```typescript
toQueryParams(values): Params
updateQueryParams(router, route, values, replaceUrl = true): void
queryParamNumber(map, key, fallback): number
queryParamBoolean(map, key, fallback): boolean
```

Everything page-specific (field names, defaults, enum/sentinel coercion) stays hand-written per page — matching how each page's `loadData()` query-object literal is already hand-written. There is intentionally no base class or mixin; this repo's convention is to duplicate small per-feature logic rather than abstract it.

## The pattern (server-paginated pages)

Reference implementation: `apps/admin/src/app/features/translation/translations/translations.component.ts`.

1. **`queryParamMap` is the sole fetch trigger** — replaces any prior `ngOnInit()` load call and any `effect(() => { if (page > 1) loadData() })` page guard:
   ```typescript
   this._route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((map) => {
     this.restoreFromQueryParams(map);
     this.loadData();
   });
   ```
2. **`restoreFromQueryParams(map: ParamMap)`** patches the filter `FormGroup` with `{ emitEvent: false }` and sets `currentPage` via `queryParamNumber(map, 'page', 1)` — silent, so it never re-triggers a URL write.
3. **`writeStateToUrl(replaceUrl = true)`** reads `filterForm.getRawValue()` and calls `updateQueryParams(...)`. Every field at its default (including a Zardui `'all'`/`'__all__'` sentinel) is passed as `undefined` so it's dropped from the URL — reuse the exact defaults already used in that page's own `onClearFilters()` reset literal.
4. **Existing triggers keep their exact conditions** — per-field `valueChanges`, `debounceTime`, an explicit search-button-only field — only the terminal call changes from `loadData()` to `writeStateToUrl()`.
5. **The URL's page key is always the literal string `page`**, regardless of what the backend DTO calls it (`pageNumber`, `page`, etc.) — map between them inside `loadData()`, same as any other field-name mismatch (e.g. `searchTerm` vs the nasheed songs page's `textFilter`).
6. **`replaceUrl` convention:** filter changes → `true` (default; typing doesn't spam browser history). Page-number changes → `false` (normal push, so back/forward pages through results).
7. **Pagination binding** uses the explicit-handler form, not the two-way banana binding:
   ```html
   <z-pagination [zTotal]="totalPages()" [zPageIndex]="currentPage()" (zPageIndexChange)="onPageChange($event)" />
   ```
   ```typescript
   onPageChange(page: number): void {
     this.currentPage.set(page);
     this.writeStateToUrl(false);
   }
   ```
8. **Mutation refetch buses stay untouched** — a feature's `[feature]EventsService.[feature]Changed$` subject (fired by dialogs/sheets after create/edit/delete) calls `loadData()` directly and never touches the URL. A dialog-triggered refetch isn't a state change.

## The variant for client-side-filtered pages

Some pages (`ai-chat-sessions`, `ai-token-usage-logs`, `ai-settings`, `ai-system-prompts`) use a route resolver to preload the **entire unfiltered dataset once**, then filter/paginate it locally via `computed()` signals — there's no per-filter/per-page HTTP round trip.

For these:

- The `queryParamMap` subscription calls `restoreFromQueryParams(map)` **only** — never an unconditional `loadData()`. The `computed()`s already react to the restored form/page state; calling `loadData()` on every navigation would cause a wasted refetch on every filter change, and an actively wrong one on pure page-number navigation (which never needs a server call at all here).
- `restoreFromQueryParams` must explicitly do `this.filterValues.set(this.filterForm.getRawValue())` after the silent `patchValue` — the `filterValues` signal that feeds the `computed()`s is normally kept in sync by `valueChanges`, which `{ emitEvent: false }` intentionally suppresses.
- **If one field is genuinely server-only** with no client-side equivalent filter (e.g. `ai-settings`/`ai-system-prompts`'s `scope` selector, which changes what the service fetches and has no matching clause in `filteredSettings`/`filteredPrompts`), compare its restored value against the value already held in the form *before* patching, and call `loadData()` only when it actually changed:
  ```typescript
  private restoreFromQueryParams(map: ParamMap): void {
    const previousScope = this.filterForm.controls.scope.value;
    this.currentPage.set(queryParamNumber(map, 'page', 1));
    const restoredScope = (map.get('scope') as AiSettingsScopeFilter) || 'all';
    this.filterForm.patchValue({ /* ... */ scope: restoredScope }, { emitEvent: false });
    this.filterValues.set(this.filterForm.getRawValue());
    if (restoredScope !== previousScope) {
      this.loadData();
    }
  }
  ```
  This correctly skips a refetch on pure page-number navigation (scope unchanged) while still refetching when scope actually differs — via `onSearch()`, a shared link, or browser back/forward. See `ai-settings.component.ts`/`ai-system-prompts.component.ts` for the full implementation.
- These pages' whole-form `valueChanges` subscription is deliberately **not** wired to `writeStateToUrl()` — matching how `translations.component.ts`'s own explicit-search-button-only `searchTerm` field behaves, the URL only updates on `onSearch()`/`onClearFilters()` (both already call `loadData()` directly), not on every keystroke/selection. This avoids refetching on every keystroke and keeps the URL representing "the last confirmed search," not live-as-you-type state.

## Multi-mount consideration

`libs/shared/src/lib/features/identity/` (users/roles/claims) is mounted at different route paths across three apps (`apps/admin`, `apps/nasheed/admin`, `apps/polysnap/admin`). `updateQueryParams()` always navigates via `relativeTo: route` with empty commands (`router.navigate([], { relativeTo: route, ... })`), which is base-path-agnostic — never introduce a hardcoded absolute path here.

## Pages covered

| App | Pages |
|---|---|
| admin | translations, tenants, audit log, notifications, backup history, categories, ai-settings, ai-system-prompts, ai-token-usage-logs, ai-chat-sessions |
| nasheed/admin | songs, artists, ingestion |
| polysnap/admin | snap-requests |
| shared identity (all 3 apps) | users (full pattern), roles, claims (filter-only, no pagination) |

Filter-only pages (roles, claims, categories) apply the same `restoreFromQueryParams`/`writeStateToUrl` pair without a `page` key or `onPageChange` — there's no pagination to sync.

## Related files

- `libs/core/src/lib/utils/query-params.util.ts` — the shared utility
- `apps/admin/src/app/features/translation/translations/translations.component.ts` — reference implementation
- `.claude/instructions/Angular.instructions.md` section "2d. URL-Synced List/Filter State" — the AI-instruction-facing version of this same pattern
- `.claude/skills/fe-create-table/SKILL.md`, `.claude/skills/fe-create-crud-page/SKILL.md` — scaffolding templates that bake this in for new pages
- `.claude/skills/fe-verify-table/SKILL.md` — audit checklist for verifying an existing page follows this pattern
