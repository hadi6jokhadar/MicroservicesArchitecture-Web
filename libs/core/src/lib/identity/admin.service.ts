import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  IUser,
  ICreateUserRequest,
  IUpdateUserRequest,
  IPaginatedResponse,
} from './models';

export interface IUserFilterRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  roleName?: string;
  status?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class IdentityAdminService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.identity}/api/admin`;

  getUsers(
    request?: IUserFilterRequest
  ): Observable<IPaginatedResponse<IUser>> {
    console.log('Fetching users with filter:', request);

    let params = new HttpParams();

    if (request) {
      Object.keys(request).forEach((key) => {
        const value = (request as any)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }
    console.log(params);

    return this._http.get<IPaginatedResponse<IUser>>(`${this._baseUrl}/users`, {
      params,
    });
  }

  getUserById(id: number): Observable<IUser> {
    return this._http.get<IUser>(`${this._baseUrl}/users/${id}`);
  }

  createUser(
    request: ICreateUserRequest,
    context?: HttpContext
  ): Observable<object> {
    return this._http.post(`${this._baseUrl}/users`, request, { context });
  }

  updateUser(
    id: number,
    request: IUpdateUserRequest,
    context?: HttpContext
  ): Observable<object> {
    return this._http.put(`${this._baseUrl}/users/${id}`, request, { context });
  }

  toggleUserStatus(id: number): Observable<object> {
    return this._http.patch(`${this._baseUrl}/users/${id}/toggle-status`, {});
  }

  deleteUser(id: number): Observable<object> {
    return this._http.delete(`${this._baseUrl}/users/${id}`);
  }
}
