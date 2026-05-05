import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '@ihsan/core';
import { SearchResultModel } from '../models';
import { ISearchQuery } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private get baseUrl(): string { return `${this._env.apiUrls['nasheed']}/api/search`; }

  search(query: ISearchQuery): Observable<SearchResultModel[]> {
    let params = new HttpParams();
    if (query.query) params = params.set('query', query.query);
    if (query.topN !== undefined) params = params.set('topN', query.topN.toString());
    return this._http.get<SearchResultModel[]>(this.baseUrl, { params });
  }

  getSimilar(songId: number, topN = 10): Observable<SearchResultModel[]> {
    return this._http.get<SearchResultModel[]>(`${this.baseUrl}/songs/${songId}/similar`, {
      params: new HttpParams().set('topN', topN.toString()),
    });
  }
}
