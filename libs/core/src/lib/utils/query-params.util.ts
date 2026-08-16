import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';

export type IQueryParamValues = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Drops null/undefined/'' entries and stringifies the rest. Callers must pass
 * `undefined` for any field currently at its default so it's omitted from the URL.
 */
export function toQueryParams(values: IQueryParamValues): Params {
  const params: Params = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined || value === '') continue;
    params[key] = String(value);
  }
  return params;
}

/**
 * Writes the full desired query-param state to the URL relative to the calling
 * route. Non-merge queryParams handling is intentional: every call supplies the
 * complete state, so keys omitted from `values` are dropped from the URL.
 * Angular's default `onSameUrlNavigation: 'ignore'` means a call that produces
 * the same URL as the current one is a no-op — do not "fix" this into a forced
 * reload, it's what prevents redundant refetches from debounced/no-op changes.
 */
export function updateQueryParams(
  router: Router,
  route: ActivatedRoute,
  values: IQueryParamValues,
  replaceUrl = true
): void {
  router.navigate([], {
    relativeTo: route,
    queryParams: toQueryParams(values),
    replaceUrl,
  });
}

/** Parses a page-number query param, guarding NaN/<1. */
export function queryParamNumber(
  map: ParamMap,
  key: string,
  fallback: number
): number {
  const raw = map.get(key);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

/** Parses a `'true'`/`'false'` string query param. Absence -> fallback. */
export function queryParamBoolean(
  map: ParamMap,
  key: string,
  fallback = false
): boolean {
  const raw = map.get(key);
  return raw === null ? fallback : raw === 'true';
}
