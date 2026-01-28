import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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

  // Public endpoint - Get translations for a language
  getTranslations(
    language: string,
    category?: string
  ): Observable<ITranslationsDto> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this._http.get<ITranslationsDto>(`${this._baseUrl}/${language}`, {
      params,
    });
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

    return this._http.get<IPaginatedList<ITranslationKeyDto>>(
      `${this._baseUrl}/keys`,
      { params }
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
