import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import { IPaginatedResponse } from '../models/common';
import { ICreateUserRequest, IUpdateUserRequest, IUser } from './models';

export interface IUserFilterRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  roleName?: string;
  status?: boolean;
  isArchived?: boolean;
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
    let params = new HttpParams();

    if (request) {
      Object.keys(request).forEach((key) => {
        const value = request[key as keyof IUserFilterRequest];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }
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
  ): Observable<IUser> {
    return this._http.post<IUser>(`${this._baseUrl}/users`, request, {
      context,
    });
  }

  updateUser(
    id: number,
    request: IUpdateUserRequest,
    context?: HttpContext
  ): Observable<IUser> {
    return this._http.put<IUser>(`${this._baseUrl}/users/${id}`, request, {
      context,
    });
  }

  toggleUserStatus(id: number): Observable<boolean> {
    return this._http.patch<boolean>(
      `${this._baseUrl}/users/${id}/toggle-status`,
      {}
    );
  }

  toggleArchive(id: number): Observable<boolean> {
    return this._http.patch<boolean>(
      `${this._baseUrl}/users/${id}/toggle-archive`,
      {}
    );
  }

  deleteUser(id: number): Observable<boolean> {
    return this._http.delete<boolean>(`${this._baseUrl}/users/${id}`);
  }
}
