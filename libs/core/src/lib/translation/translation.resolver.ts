import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TranslationService } from './translation.service';

export interface ITranslationData {
  translations: Record<string, string>;
  language: string;
}

export const translationResolver: ResolveFn<ITranslationData> = (
  route,
  state
): Observable<ITranslationData> => {
  const translationService = inject(TranslationService);

  // Get language from localStorage, route params, or default to 'en'
  const savedLanguage =
    typeof window !== 'undefined' ? localStorage.getItem('app-language') : null;
  const language = savedLanguage || route.queryParams['lang'] || 'en';
  const category = route.queryParams['category'];

  return translationService.getTranslations(language, category).pipe(
    tap((data) => {
      // Cache translations in the service
      translationService.setTranslations(data.translations, data.language);
    }),
    map((data) => ({
      translations: data.translations,
      language: data.language,
    })),
    catchError((error) => {
      console.error('Failed to load translations:', error);
      // Set empty translations on error
      translationService.setTranslations({}, language);
      return of({
        translations: {},
        language,
      });
    })
  );
};
