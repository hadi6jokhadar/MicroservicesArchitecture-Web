import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ENVIRONMENT } from '../core/environment.token';
import { IPaginatedList } from '../file-manager';
import {
  ICreateTranslationKeyCommand,
  IGetTranslationKeysQuery,
  IImportTranslationsCommand,
  IImportTranslationsResult,
  ISetTranslationCommand,
  ITranslationKeyDto,
  ITranslationValueDto,
  ITranslationsDto,
  IUpdateTranslationKeyCommand,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.translation}/api/translations`;

  // Translation cache
  private readonly _translations = signal<Record<string, string>>({});
  private readonly _currentLanguage = signal<string>('en');

  readonly availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'tr', name: 'Turkish' },
  ];

  // Public endpoint - Get translations for a language
  getTranslations(
    language: string,
    category?: string
  ): Observable<ITranslationsDto> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this._http
      .get<ITranslationsDto>(`${this._baseUrl}/${language}`, {
        params,
      })
      .pipe(
        tap((data) => {
          this._translations.set(data.translations);
          this._currentLanguage.set(data.language);
        })
      );
  }

  // Get cached translations (for pipe usage)
  getCachedTranslations(): Record<string, string> {
    return this._translations();
  }

  // Get cached translation by key (for pipe usage)
  getCachedTranslation(key: string, defaultValue?: string): string {
    const translations = this._translations();
    return translations[key] || defaultValue || key;
  }

  // Get current language
  getCurrentLanguage(): string {
    return this._currentLanguage();
  }

  // Get current language as signal (for reactive updates)
  getCurrentLanguageSignal() {
    return this._currentLanguage;
  }

  // Set translations manually (for resolver)
  setTranslations(
    translations: Record<string, string>,
    language: string
  ): void {
    this._translations.set(translations);
    this._currentLanguage.set(language);
  }

  // Admin endpoints
  getTranslationKeys(
    query: IGetTranslationKeysQuery
  ): Observable<IPaginatedList<ITranslationKeyDto>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber.toString())
      .set('pageSize', query.pageSize.toString());

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }

    if (query.category) {
      params = params.set('category', query.category);
    }

    if (query.isArchived !== undefined) {
      params = params.set('isArchived', query.isArchived.toString());
    }

    if (query.tenantId) {
      params = params.set('tenantId', query.tenantId);
    }

    return this._http.get<IPaginatedList<ITranslationKeyDto>>(
      `${this._baseUrl}/keys`,
      { params }
    );
  }

  toggleArchive(id: number): Observable<ITranslationKeyDto> {
    return this._http.patch<ITranslationKeyDto>(
      `${this._baseUrl}/keys/${id}/toggle-archive`,
      {}
    );
  }

  createTranslationKey(
    command: ICreateTranslationKeyCommand,
    context?: HttpContext
  ): Observable<ITranslationKeyDto> {
    return this._http.post<ITranslationKeyDto>(
      `${this._baseUrl}/keys`,
      command,
      { context }
    );
  }

  updateTranslationKey(
    command: IUpdateTranslationKeyCommand,
    context?: HttpContext
  ): Observable<ITranslationKeyDto> {
    return this._http.put<ITranslationKeyDto>(
      `${this._baseUrl}/keys/${command.id}`,
      command,
      { context }
    );
  }

  deleteTranslationKey(id: number): Observable<boolean> {
    return this._http.delete<boolean>(`${this._baseUrl}/keys/${id}`);
  }

  setTranslation(
    command: ISetTranslationCommand,
    context?: HttpContext
  ): Observable<ITranslationValueDto> {
    return this._http.post<ITranslationValueDto>(
      `${this._baseUrl}/values`,
      command,
      { context }
    );
  }

  deleteTranslationValue(id: number): Observable<boolean> {
    return this._http.delete<boolean>(`${this._baseUrl}/values/${id}`);
  }

  importTranslations(
    command: IImportTranslationsCommand
  ): Observable<IImportTranslationsResult> {
    return this._http.post<IImportTranslationsResult>(
      `${this._baseUrl}/import`,
      command
    );
  }
}
