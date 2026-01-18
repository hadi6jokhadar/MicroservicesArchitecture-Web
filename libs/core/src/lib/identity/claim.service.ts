import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import { IClaim, ICreateClaimRequest, IUpdateClaimRequest } from './models';

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.identity}/api/admin/claims`;

  getAllClaims(): Observable<IClaim[]> {
    return this._http.get<IClaim[]>(this._baseUrl);
  }

  getClaimById(id: number): Observable<IClaim> {
    return this._http.get<IClaim>(`${this._baseUrl}/${id}`);
  }

  createClaim(request: ICreateClaimRequest): Observable<object> {
    return this._http.post(this._baseUrl, request);
  }

  updateClaim(id: number, request: IUpdateClaimRequest): Observable<object> {
    return this._http.put(`${this._baseUrl}/${id}`, request);
  }

  deleteClaim(id: number): Observable<object> {
    return this._http.delete(`${this._baseUrl}/${id}`);
  }
}
