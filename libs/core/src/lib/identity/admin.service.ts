import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  IUser,
  ICreateUserRequest,
  IUpdateUserRequest,
  IPaginatedResponse,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class IdentityAdminService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.identity}/api/admin`;

  getUsers(): Observable<IPaginatedResponse<IUser>> {
    return this._http.get<IPaginatedResponse<IUser>>(`${this._baseUrl}/users`);
  }

  getUserById(id: number): Observable<IUser> {
    return this._http.get<IUser>(`${this._baseUrl}/users/${id}`);
  }

  createUser(request: ICreateUserRequest): Observable<object> {
    return this._http.post(`${this._baseUrl}/users`, request);
  }

  updateUser(id: number, request: IUpdateUserRequest): Observable<object> {
    return this._http.put(`${this._baseUrl}/users/${id}`, request);
  }

  toggleUserStatus(id: number): Observable<object> {
    return this._http.patch(`${this._baseUrl}/users/${id}/toggle-status`, {});
  }

  deleteUser(id: number): Observable<object> {
    return this._http.delete(`${this._baseUrl}/users/${id}`);
  }
}
