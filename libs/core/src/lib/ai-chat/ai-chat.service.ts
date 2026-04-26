import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
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
  IChatSendRequest,
  IChatSingleResponse,
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

  deleteChatSession(
    sessionId: string,
    context?: HttpContext
  ): Observable<void> {
    return this._http.delete<void>(`${this._base}/chat-sessions/${sessionId}`, {
      context,
    });
  }

  updateChatSessionTitle(
    sessionId: string,
    title: string,
    context?: HttpContext
  ): Observable<IAiChatSession> {
    return this._http.patch<IAiChatSession>(
      `${this._base}/chat-sessions/${sessionId}`,
      { title },
      { context }
    );
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

  // -------------------------------------------------------------------------
  // Chat – Send (Single & Stream)
  // -------------------------------------------------------------------------

  sendMessageSingle(
    request: IChatSendRequest,
    context?: HttpContext
  ): Observable<IChatSingleResponse> {
    return this._http.post<IChatSingleResponse>(
      `${this._base}/chat/single`,
      request,
      { context }
    );
  }

  /**
   * Returns a ReadableStream-backed AsyncGenerator of server-sent event text
   * chunks. Uses the native fetch API because HttpClient does not expose SSE.
   */
  async *sendMessageStream(
    request: IChatSendRequest,
    headers: Record<string, string> = {},
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const url = `${this._base}/chat/stream`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Chat stream failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const extracted = extractJsonObjects(buffer);
      buffer = extracted.rest;

      for (const rawJson of extracted.objects) {
        try {
          const parsed = JSON.parse(rawJson) as {
            content?: unknown;
          };
          if (parsed.content !== undefined && parsed.content !== null) {
            yield String(parsed.content);
          }
        } catch {
          // skip malformed JSON payloads and continue streaming
        }
      }
    }

    // Try to parse any completed object remaining in buffer at stream end.
    const extractedFinal = extractJsonObjects(buffer);
    for (const rawJson of extractedFinal.objects) {
      try {
        const parsed = JSON.parse(rawJson) as {
          content?: unknown;
        };
        if (parsed.content !== undefined && parsed.content !== null) {
          yield String(parsed.content);
        }
      } catch {
        // ignore incomplete or malformed trailing payload
      }
    }
  }
}

function extractJsonObjects(input: string): {
  objects: string[];
  rest: string;
} {
  const objects: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  let lastConsumedIndex = -1;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '{') {
      if (depth === 0) {
        start = i;
      }
      depth++;
      continue;
    }

    if (ch === '}') {
      if (depth > 0) {
        depth--;
        if (depth === 0 && start >= 0) {
          objects.push(input.slice(start, i + 1));
          lastConsumedIndex = i;
          start = -1;
        }
      }
    }
  }

  const rest =
    depth > 0 && start >= 0
      ? input.slice(start)
      : lastConsumedIndex >= 0
      ? input.slice(lastConsumedIndex + 1)
      : input;

  return { objects, rest };
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
