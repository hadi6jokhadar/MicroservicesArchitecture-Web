import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  ITenant,
  ITenantConfig,
  ICreateTenantRequest,
  IUpdateTenantRequest,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.tenant}/api/tenant`;
  private readonly _adminUrl = `${this._env.apiUrls.tenant}/api/admin/tenant`;

  // Public Endpoints
  getTenantById(tenantId: string): Observable<ITenant> {
    return this._http.get<ITenant>(`${this._baseUrl}/${tenantId}`);
  }

  // Service/SuperAdmin Endpoints
  getTenantConfig(tenantId: string): Observable<ITenantConfig> {
    return this._http.get<ITenantConfig>(`${this._baseUrl}/config/${tenantId}`);
  }

  getAllActiveTenantsWithConfig(): Observable<ITenantConfig[]> {
    return this._http.get<ITenantConfig[]>(`${this._baseUrl}/config`);
  }

  // Admin Endpoints
  getAllActiveTenants(): Observable<ITenant[]> {
    return this._http.get<ITenant[]>(`${this._adminUrl}`);
  }

  getTenantByUser(userId: number): Observable<ITenant> {
    return this._http.get<ITenant>(`${this._adminUrl}/user/${userId}`);
  }

  createTenant(request: ICreateTenantRequest): Observable<object> {
    return this._http.post(`${this._adminUrl}`, request);
  }

  updateTenant(
    tenantId: string,
    request: IUpdateTenantRequest
  ): Observable<object> {
    return this._http.put(`${this._adminUrl}/${tenantId}`, request);
  }

  deleteTenant(tenantId: string): Observable<object> {
    return this._http.delete(`${this._adminUrl}/${tenantId}`);
  }
}
