import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '@ihsan/core';
import {
  ICreateSnapRequestCommand,
  IGetSnapRequestsQuery,
  ISnapRequestDto,
  ISnapRequestPaginatedList,
  IUpdateSnapRequestCommand,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class SnapRequestService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.polySnap}/api/v1/snap-requests`;

  getSnapRequests(
    query?: IGetSnapRequestsQuery
  ): Observable<ISnapRequestPaginatedList<ISnapRequestDto>> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach((key) => {
        const value = (query as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, String(value));
        }
      });
    }
    return this._http.get<ISnapRequestPaginatedList<ISnapRequestDto>>(
      this._baseUrl,
      { params }
    );
  }

  getSnapRequestById(id: number): Observable<ISnapRequestDto> {
    return this._http.get<ISnapRequestDto>(`${this._baseUrl}/${id}`);
  }

  createSnapRequest(
    command: ICreateSnapRequestCommand,
    context?: HttpContext
  ): Observable<ISnapRequestDto> {
    return this._http.post<ISnapRequestDto>(this._baseUrl, command, {
      context,
    });
  }

  updateSnapRequest(
    id: number,
    command: IUpdateSnapRequestCommand,
    context?: HttpContext
  ): Observable<ISnapRequestDto> {
    return this._http.put<ISnapRequestDto>(
      `${this._baseUrl}/${id}`,
      command,
      { context }
    );
  }

  deleteSnapRequest(id: number): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`);
  }
}
