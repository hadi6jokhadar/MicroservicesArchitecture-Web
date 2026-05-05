import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '@ihsan/core';
import {
  SongModel,
  CreateSongCommand,
  UpdateSongCommand,
  PaginatedList,
  SearchResultModel,
} from '../models';
import { ISongQuery } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SongService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private get baseUrl(): string {
    return `${this._env.apiUrls['nasheed']}/api/songs`;
  }

  getAll(query: ISongQuery): Observable<PaginatedList<SongModel>> {
    let params = new HttpParams();
    if (query.pageNumber !== undefined)
      params = params.set('pageNumber', query.pageNumber.toString());
    if (query.pageSize !== undefined)
      params = params.set('pageSize', query.pageSize.toString());
    if (query.textFilter) params = params.set('textFilter', query.textFilter);
    if (query.status !== undefined)
      params = params.set('status', query.status.toString());
    if (query.isArchived !== undefined)
      params = params.set('isArchived', query.isArchived.toString());
    if (query.artistId !== undefined)
      params = params.set('artistId', query.artistId.toString());
    if (query.state !== undefined)
      params = params.set('state', query.state.toString());
    if (query.searchIndexStatus !== undefined)
      params = params.set(
        'searchIndexStatus',
        query.searchIndexStatus.toString(),
      );
    if (query.languageCode)
      params = params.set('languageCode', query.languageCode);
    if (query.copyrightRiskLevel)
      params = params.set('copyrightRiskLevel', query.copyrightRiskLevel);
    if (query.contentSafetyFlag)
      params = params.set('contentSafetyFlag', query.contentSafetyFlag);
    return this._http.get<PaginatedList<SongModel>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<SongModel> {
    return this._http.get<SongModel>(`${this.baseUrl}/${id}`);
  }

  create(
    command: CreateSongCommand,
    options?: { context?: import('@angular/common/http').HttpContext },
  ): Observable<SongModel> {
    return this._http.post<SongModel>(this.baseUrl, command, options ?? {});
  }

  update(
    id: number,
    command: UpdateSongCommand,
    options?: { context?: import('@angular/common/http').HttpContext },
  ): Observable<SongModel> {
    return this._http.put<SongModel>(
      `${this.baseUrl}/${id}`,
      command,
      options ?? {},
    );
  }

  delete(id: number): Observable<void> {
    return this._http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAnalysisStatus(id: number): Observable<SongModel> {
    return this._http.get<SongModel>(`${this.baseUrl}/${id}/analysis`);
  }

  getSimilar(id: number, topN: number = 10): Observable<SearchResultModel[]> {
    const params = new HttpParams().set('topN', topN.toString());
    return this._http.get<SearchResultModel[]>(
      `${this.baseUrl}/${id}/similar`,
      { params },
    );
  }
}
