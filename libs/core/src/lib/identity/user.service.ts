import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import { IUser, IUpdateProfileRequest } from './models';

@Injectable({
  providedIn: 'root',
})
export class IdentityUserService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.identity}/api/user`;

  getProfile(): Observable<IUser> {
    return this._http.get<IUser>(`${this._baseUrl}/profile`);
  }

  updateProfile(request: IUpdateProfileRequest): Observable<IUser> {
    return this._http.put<IUser>(`${this._baseUrl}/profile`, request);
  }

  deleteAccount(): Observable<boolean> {
    return this._http.delete<boolean>(`${this._baseUrl}/me`);
  }
}
