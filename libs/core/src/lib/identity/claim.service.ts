import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import { IClaim, ICreateClaimRequest, IUpdateClaimRequest } from './models';

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/admin/claims`;

  getAllClaims(): Observable<IClaim[]> {
    return this._http.get<IClaim[]>(this._baseUrl);
  }

  getClaimById(id: number): Observable<IClaim> {
    return this._http.get<IClaim>(`${this._baseUrl}/${id}`);
  }

  createClaim(
    request: ICreateClaimRequest,
    context?: HttpContext
  ): Observable<IClaim> {
    return this._http.post<IClaim>(this._baseUrl, request, { context });
  }

  updateClaim(
    id: number,
    request: IUpdateClaimRequest,
    context?: HttpContext
  ): Observable<IClaim> {
    return this._http.put<IClaim>(`${this._baseUrl}/${id}`, request, {
      context,
    });
  }

  deleteClaim(id: number): Observable<boolean> {
    return this._http.delete<boolean>(`${this._baseUrl}/${id}`);
  }
}
