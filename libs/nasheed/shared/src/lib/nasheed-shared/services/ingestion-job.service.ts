import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ENVIRONMENT } from '@ihsan/core';
import {
  IngestionJobApiModel,
  IngestionJobModel,
  mapIngestionJobFromApi,
  PaginatedList,
  SongModel,
} from '../models';
import { IIngestionJobQuery } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class IngestionJobService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private get baseUrl(): string {
    return `${this._env.apiUrls['nasheed']}/api/ingestion`;
  }
  private get songsUrl(): string {
    return `${this._env.apiUrls['nasheed']}/api/songs`;
  }

  getAll(
    query: IIngestionJobQuery,
  ): Observable<PaginatedList<IngestionJobModel>> {
    let params = new HttpParams();
    if (query.pageNumber !== undefined)
      params = params.set('pageNumber', query.pageNumber.toString());
    if (query.pageSize !== undefined)
      params = params.set('pageSize', query.pageSize.toString());
    if (query.status !== undefined)
      params = params.set('status', query.status.toString());
    if (query.type !== undefined)
      params = params.set('type', query.type.toString());
    if (query.songId !== undefined)
      params = params.set('songId', query.songId.toString());
    return this._http
      .get<PaginatedList<IngestionJobApiModel>>(this.baseUrl, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map(mapIngestionJobFromApi),
        })),
      );
  }

  getById(id: number): Observable<IngestionJobModel> {
    return this._http
      .get<IngestionJobApiModel>(`${this.baseUrl}/${id}`)
      .pipe(map(mapIngestionJobFromApi));
  }

  retry(id: number): Observable<IngestionJobModel> {
    return this._http
      .post<IngestionJobApiModel>(`${this.baseUrl}/${id}/retry`, {})
      .pipe(map(mapIngestionJobFromApi));
  }

  remove(id: number): Observable<void> {
    return this._http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reindex(songId: number): Observable<IngestionJobModel> {
    return this._http
      .post<IngestionJobApiModel>(`${this.baseUrl}/songs/${songId}/reindex`, {})
      .pipe(map(mapIngestionJobFromApi));
  }

  getAnalysisStatus(songId: number): Observable<SongModel> {
    return this._http.get<SongModel>(`${this.songsUrl}/${songId}/analysis`);
  }
}
