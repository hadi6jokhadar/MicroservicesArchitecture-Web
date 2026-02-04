import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
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

  // Cache for roles
  private readonly _rolesCache = signal<IRole[] | null>(null);

  getAllRoles(forceRefresh = false): Observable<IRole[]> {
    // Return cached roles if available and not forcing refresh
    if (!forceRefresh && this._rolesCache()) {
      return of(this._rolesCache()!);
    }

    // Fetch from API and cache the result
    return this._http
      .get<IRole[]>(this._baseUrl)
      .pipe(tap((roles) => this._rolesCache.set(roles)));
  }

  /**
   * Clear the roles cache. Call this after creating, updating, or deleting a role.
   */
  clearCache(): void {
    this._rolesCache.set(null);
  }

  getRoleById(id: number): Observable<IRole> {
    return this._http.get<IRole>(`${this._baseUrl}/${id}`);
  }

  createRole(
    request: ICreateRoleRequest,
    context?: HttpContext
  ): Observable<object> {
    return this._http
      .post(this._baseUrl, request, { context })
      .pipe(tap(() => this.clearCache()));
  }

  updateRole(
    id: number,
    request: IUpdateRoleRequest,
    context?: HttpContext
  ): Observable<object> {
    return this._http
      .put(`${this._baseUrl}/${id}`, request, { context })
      .pipe(tap(() => this.clearCache()));
  }

  deleteRole(id: number): Observable<object> {
    return this._http
      .delete(`${this._baseUrl}/${id}`)
      .pipe(tap(() => this.clearCache()));
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
