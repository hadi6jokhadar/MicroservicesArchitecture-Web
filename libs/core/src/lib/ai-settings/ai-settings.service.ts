import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  AiSettingsScopeFilter,
  IAiProviderSetting,
  IUpsertAiProviderSettingRequest,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class AiSettingsService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.ai}/api/v1/settings`;

  getSettings(
    scope: AiSettingsScopeFilter = 'all'
  ): Observable<IAiProviderSetting[]> {
    return this._http.get<IAiProviderSetting[]>(`${this._baseUrl}/`, {
      params: { scope },
    });
  }

  getSettingById(id: string): Observable<IAiProviderSetting> {
    return this._http.get<IAiProviderSetting>(`${this._baseUrl}/${id}`);
  }

  getSettingByKey(key: string): Observable<IAiProviderSetting | null> {
    return this._http.get<IAiProviderSetting | null>(
      `${this._baseUrl}/by-key/${encodeURIComponent(key)}`
    );
  }

  createSetting(
    request: IUpsertAiProviderSettingRequest,
    context?: HttpContext
  ): Observable<IAiProviderSetting> {
    return this._http.post<IAiProviderSetting>(`${this._baseUrl}/`, request, {
      context,
    });
  }

  updateSetting(
    id: string,
    request: IUpsertAiProviderSettingRequest,
    context?: HttpContext
  ): Observable<IAiProviderSetting> {
    return this._http.put<IAiProviderSetting>(
      `${this._baseUrl}/${id}`,
      request,
      {
        context,
      }
    );
  }

  deleteSetting(id: string): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`);
  }
}
