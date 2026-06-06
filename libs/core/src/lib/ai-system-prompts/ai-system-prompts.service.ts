import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  IAiSystemPrompt,
  IUpsertAiSystemPromptRequest,
  SystemPromptScopeFilter,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class AiSystemPromptsService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/ai/prompts`;

  getPrompts(
    scope: SystemPromptScopeFilter = 'all'
  ): Observable<IAiSystemPrompt[]> {
    return this._http.get<IAiSystemPrompt[]>(`${this._baseUrl}/`, {
      params: { scope },
    });
  }

  getPromptById(id: string): Observable<IAiSystemPrompt> {
    return this._http.get<IAiSystemPrompt>(`${this._baseUrl}/${id}`);
  }

  createPrompt(
    request: IUpsertAiSystemPromptRequest,
    context?: HttpContext
  ): Observable<IAiSystemPrompt> {
    return this._http.post<IAiSystemPrompt>(`${this._baseUrl}/`, request, {
      context,
    });
  }

  updatePrompt(
    id: string,
    request: IUpsertAiSystemPromptRequest,
    context?: HttpContext
  ): Observable<IAiSystemPrompt> {
    return this._http.put<IAiSystemPrompt>(`${this._baseUrl}/${id}`, request, {
      context,
    });
  }

  deletePrompt(id: string): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`);
  }
}
