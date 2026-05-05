import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '@ihsan/core';
import { ArtistModel, CreateArtistCommand, UpdateArtistCommand, PaginatedList } from '../models';
import { IArtistQuery } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private get baseUrl(): string { return `${this._env.apiUrls['nasheed']}/api/artists`; }

  getAll(query: IArtistQuery): Observable<PaginatedList<ArtistModel>> {
    let params = new HttpParams();
    if (query.pageNumber !== undefined) params = params.set('pageNumber', query.pageNumber.toString());
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize.toString());
    if (query.searchTerm) params = params.set('searchTerm', query.searchTerm);
    if (query.status !== undefined) params = params.set('status', query.status.toString());
    if (query.isArchived !== undefined) params = params.set('isArchived', query.isArchived.toString());
    return this._http.get<PaginatedList<ArtistModel>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ArtistModel> {
    return this._http.get<ArtistModel>(`${this.baseUrl}/${id}`);
  }

  create(command: CreateArtistCommand, options?: { context?: import('@angular/common/http').HttpContext }): Observable<ArtistModel> {
    return this._http.post<ArtistModel>(this.baseUrl, command, options ?? {});
  }

  update(id: number, command: UpdateArtistCommand, options?: { context?: import('@angular/common/http').HttpContext }): Observable<ArtistModel> {
    return this._http.put<ArtistModel>(`${this.baseUrl}/${id}`, command, options ?? {});
  }

  delete(id: number): Observable<void> {
    return this._http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
