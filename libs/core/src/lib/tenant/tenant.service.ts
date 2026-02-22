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
  TenantClass,
} from './models';
import { IPaginatedResponse } from '../models/common';

import { HttpParams } from '@angular/common/http';

export interface ITenantFilterRequest {
  pageNumber?: number;
  pageSize?: number;
  isArchived?: boolean;
  isActive?: boolean;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.tenant}/api/tenant`;
  private readonly _adminUrl = `${this._env.apiUrls.tenant}/api/admin/tenant`;

  // State
  readonly currentTenantId = signal<string | null>(null);
  readonly tenants = signal<TenantClass[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);

  set setCurrentTenantId(tenantId: string) {
    this.currentTenantId.set(tenantId);
  }

  get getCurrentTenantId() {
    return this.currentTenantId();
  }

  clearCurrentTenantId() {
    this.currentTenantId.set(null);
  }

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
  getAllActiveTenants(
    request?: ITenantFilterRequest
  ): Observable<IPaginatedResponse<ITenant>> {
    let params = new HttpParams();

    if (request) {
      Object.keys(request).forEach((key) => {
        const value = (request as any)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    this.isLoading.set(true);
    return this._http
      .get<IPaginatedResponse<ITenant>>(`${this._adminUrl}`, { params })
      .pipe(
        tap({
          next: (response) => {
            this.tenants.set(
              response.items.map((item) => new TenantClass(item))
            );
            this.totalCount.set(response.totalCount);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        })
      );
  }

  toggleArchive(tenantId: string): Observable<object> {
    return this._http.patch(`${this._adminUrl}/${tenantId}/toggle-archive`, {});
  }

  getTenantByUser(userId: number): Observable<ITenant> {
    return this._http.get<ITenant>(`${this._adminUrl}/user/${userId}`);
  }

  createTenant(
    request: ICreateTenantRequest,
    context?: HttpContext
  ): Observable<ITenant> {
    return this._http
      .post<ITenant>(`${this._adminUrl}`, request, { context })
      .pipe(
        tap((newTenant) => {
          const tenant = new TenantClass(newTenant);
          this.tenants.update((items) => [tenant, ...items]);
          this.totalCount.update((count) => count + 1);
        })
      );
  }

  updateTenant(
    tenantId: string,
    request: IUpdateTenantRequest,
    context?: HttpContext
  ): Observable<ITenant> {
    return this._http
      .put<ITenant>(
        `${this._adminUrl}/${tenantId}`,
        { ...request, tenantId },
        {
          context,
        }
      )
      .pipe(
        tap((updatedTenant) => {
          this.tenants.update((items) =>
            items.map((t) =>
              t.tenantId === tenantId ? new TenantClass(updatedTenant) : t
            )
          );
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
