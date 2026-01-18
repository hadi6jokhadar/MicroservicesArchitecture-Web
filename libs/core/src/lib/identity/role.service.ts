import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  IRole,
  ICreateRoleRequest,
  IUpdateRoleRequest,
  IAssignClaimsToRoleRequest,
  IAssignRolesToUserRequest,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.identity}/api/admin/roles`;

  getAllRoles(): Observable<IRole[]> {
    return this._http.get<IRole[]>(this._baseUrl);
  }

  getRoleById(id: number): Observable<IRole> {
    return this._http.get<IRole>(`${this._baseUrl}/${id}`);
  }

  createRole(request: ICreateRoleRequest): Observable<object> {
    return this._http.post(this._baseUrl, request);
  }

  updateRole(id: number, request: IUpdateRoleRequest): Observable<object> {
    return this._http.put(`${this._baseUrl}/${id}`, request);
  }

  deleteRole(id: number): Observable<object> {
    return this._http.delete(`${this._baseUrl}/${id}`);
  }

  assignClaimsToRole(
    roleId: number,
    request: IAssignClaimsToRoleRequest
  ): Observable<object> {
    return this._http.post(`${this._baseUrl}/${roleId}/claims`, request);
  }

  assignRolesToUser(
    userId: number,
    request: IAssignRolesToUserRequest
  ): Observable<object> {
    return this._http.post(
      `${this._env.apiUrls.identity}/api/admin/users/${userId}/roles`,
      request
    );
  }
}
