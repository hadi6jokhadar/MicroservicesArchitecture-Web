import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ENVIRONMENT } from '../core/environment.token';
import {
  ITenant,
  ITenantConfig,
  ICreateTenantRequest,
  IUpdateTenantRequest,
} from './models';
import { IPaginatedResponse } from '../models/common';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.tenant}/api/tenant`;
  private readonly _adminUrl = `${this._env.apiUrls.tenant}/api/admin/tenant`;

  // State
  readonly tenants = signal<ITenant[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Public Endpoints
  getTenantById(tenantId: string): Observable<ITenant> {
    return this._http.get<ITenant>(`${this._baseUrl}/${tenantId}`);
  }

  // Service/SuperAdmin Endpoints
  getTenantConfig(tenantId: string): Observable<ITenantConfig> {
    return this._http.get<ITenantConfig>(`${this._baseUrl}/config/${tenantId}`);
  }

  getAllActiveTenantsWithConfig(): Observable<
    IPaginatedResponse<ITenantConfig>
  > {
    return this._http.get<IPaginatedResponse<ITenantConfig>>(
      `${this._baseUrl}/config`
    );
  }

  // Admin Endpoints
  getAllActiveTenants(): Observable<IPaginatedResponse<ITenant>> {
    this.isLoading.set(true);
    return this._http
      .get<IPaginatedResponse<ITenant>>(`${this._adminUrl}`)
      .pipe(
        tap({
          next: (response) => {
            this.tenants.set(response.items);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        })
      );
  }

  getTenantByUser(userId: number): Observable<ITenant> {
    return this._http.get<ITenant>(`${this._adminUrl}/user/${userId}`);
  }

  createTenant(
    request: ICreateTenantRequest,
    context?: HttpContext
  ): Observable<object> {
    return this._http.post(`${this._adminUrl}`, request, { context }).pipe(
      tap(() => {
        // Refresh list after create
        this.getAllActiveTenants().subscribe();
      })
    );
  }

  updateTenant(
    tenantId: string,
    request: IUpdateTenantRequest,
    context?: HttpContext
  ): Observable<object> {
    return this._http
      .put(
        `${this._adminUrl}/${tenantId}`,
        { ...request, tenantId },
        {
          context,
        }
      )
      .pipe(
        tap(() => {
          // Refresh list after update
          this.getAllActiveTenants().subscribe();
        })
      );
  }

  deleteTenant(tenantId: string, context?: HttpContext): Observable<object> {
    return this._http.delete(`${this._adminUrl}/${tenantId}`, { context }).pipe(
      tap(() => {
        // Refresh list after delete
        this.getAllActiveTenants().subscribe();
      })
    );
  }
}
