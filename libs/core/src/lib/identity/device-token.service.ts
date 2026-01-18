import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  IDeviceToken,
  IAddDeviceTokenRequest,
  IUpdateDeviceTokenRequest,
  IGetBatchDeviceTokensRequest,
  IDeleteBatchDeviceTokensRequest,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class DeviceTokenService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.identity}/api/devicetokens`;

  addDeviceToken(request: IAddDeviceTokenRequest): Observable<object> {
    return this._http.post(this._baseUrl, request);
  }

  getDeviceTokenById(id: number): Observable<IDeviceToken> {
    return this._http.get<IDeviceToken>(`${this._baseUrl}/${id}`);
  }

  getUserDeviceTokens(userId: number): Observable<IDeviceToken[]> {
    return this._http.get<IDeviceToken[]>(`${this._baseUrl}/user/${userId}`);
  }

  getUserDeviceTokensByPlatform(
    userId: number,
    platform: string
  ): Observable<IDeviceToken[]> {
    const params = new HttpParams().set('platform', platform);
    return this._http.get<IDeviceToken[]>(
      `${this._baseUrl}/user/${userId}/platform`,
      { params }
    );
  }

  updateDeviceToken(
    id: number,
    request: IUpdateDeviceTokenRequest
  ): Observable<object> {
    return this._http.put(`${this._baseUrl}/${id}`, request);
  }

  deleteDeviceToken(id: number): Observable<object> {
    return this._http.delete(`${this._baseUrl}/${id}`);
  }

  deleteAllUserDeviceTokens(userId: number): Observable<object> {
    return this._http.delete(`${this._baseUrl}/user/${userId}`);
  }

  getBatchDeviceTokens(
    request: IGetBatchDeviceTokensRequest
  ): Observable<IDeviceToken[]> {
    return this._http.post<IDeviceToken[]>(`${this._baseUrl}/batch`, request);
  }

  deleteBatchDeviceTokens(
    request: IDeleteBatchDeviceTokensRequest
  ): Observable<object> {
    return this._http.delete(`${this._baseUrl}/batch`, { body: request });
  }

  getTenantDeviceTokens(): Observable<IDeviceToken[]> {
    return this._http.get<IDeviceToken[]>(`${this._baseUrl}/tenant`);
  }
}
