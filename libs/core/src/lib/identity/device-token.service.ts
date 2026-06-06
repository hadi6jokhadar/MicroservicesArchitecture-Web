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
  private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/device-tokens`;

  addDeviceToken(request: IAddDeviceTokenRequest): Observable<IDeviceToken> {
    return this._http.post<IDeviceToken>(this._baseUrl, request);
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
  ): Observable<IDeviceToken> {
    return this._http.put<IDeviceToken>(`${this._baseUrl}/${id}`, request);
  }

  deleteDeviceToken(id: number): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`);
  }

  deleteAllUserDeviceTokens(userId: number): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/user/${userId}`);
  }

  getBatchDeviceTokens(
    request: IGetBatchDeviceTokensRequest
  ): Observable<Record<number, IDeviceToken[]>> {
    return this._http.post<Record<number, IDeviceToken[]>>(
      `${this._baseUrl}/batch`,
      request
    );
  }
  deleteBatchDeviceTokens(
    request: IDeleteBatchDeviceTokensRequest
  ): Observable<number> {
    return this._http.delete<number>(`${this._baseUrl}/batch`, {
      body: request,
    });
  }

  getTenantDeviceTokens(): Observable<IDeviceToken[]> {
    return this._http.get<IDeviceToken[]>(`${this._baseUrl}/tenant`);
  }
}
