import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  IAiChatMessage,
  IAiChatMessageFile,
  IAiChatMessageFileFilter,
  IAiChatMessageFilter,
  IAiChatSession,
  IAiChatSessionFilter,
  IAiTokenUsageLog,
  IAiTokenUsageLogFilter,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private readonly _base = `${this._env.apiUrls.ai}/api/v1`;

  // -------------------------------------------------------------------------
  // Chat Sessions
  // -------------------------------------------------------------------------

  getChatSessions(
    filter: IAiChatSessionFilter = {}
  ): Observable<IAiChatSession[]> {
    const params = buildParams(filter);
    return this._http.get<IAiChatSession[]>(`${this._base}/chat-sessions/`, {
      params,
    });
  }

  // -------------------------------------------------------------------------
  // Chat Messages
  // -------------------------------------------------------------------------

  getChatMessages(
    filter: IAiChatMessageFilter = {}
  ): Observable<IAiChatMessage[]> {
    const params = buildParams(filter);
    return this._http.get<IAiChatMessage[]>(`${this._base}/chat-messages/`, {
      params,
    });
  }

  // -------------------------------------------------------------------------
  // Chat Message Files
  // -------------------------------------------------------------------------

  getChatMessageFiles(
    filter: IAiChatMessageFileFilter = {}
  ): Observable<IAiChatMessageFile[]> {
    const params = buildParams(filter);
    return this._http.get<IAiChatMessageFile[]>(
      `${this._base}/chat-message-files/`,
      { params }
    );
  }

  // -------------------------------------------------------------------------
  // Token Usage Logs
  // -------------------------------------------------------------------------

  getTokenUsageLogs(
    filter: IAiTokenUsageLogFilter = {}
  ): Observable<IAiTokenUsageLog[]> {
    const params = buildParams(filter);
    return this._http.get<IAiTokenUsageLog[]>(
      `${this._base}/token-usage-logs/`,
      { params }
    );
  }
}

// ---------------------------------------------------------------------------
// Helper — builds HttpParams from a plain filter object, skipping undefined/null
// ---------------------------------------------------------------------------
function buildParams(
  filter:
    | Record<string, string | number | undefined | null>
    | IAiChatSessionFilter
    | IAiChatMessageFilter
    | IAiChatMessageFileFilter
    | IAiTokenUsageLogFilter
): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
