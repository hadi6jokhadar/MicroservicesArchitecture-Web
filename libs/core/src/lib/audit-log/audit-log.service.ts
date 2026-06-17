import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import { IPaginatedResponse } from '../models/common';
import { AuditLogSource, IAuditLog, IAuditLogFilter } from './models';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);

  private get _gateway(): string {
    return this._env.apiUrls.gateway;
  }

  // Paths as routed through the gateway (see Gateway appsettings.json).
  // Each path is transformed by YARP before forwarding to the owning service,
  // which means the service receives /api/admin/audit-logs — a BypassTenant
  // endpoint — so no x-tenant-id header is required.
  private readonly _paths: Record<AuditLogSource, string> = {
    identity: '/api/v1/admin/audit-logs',
    tenant: '/api/v1/admin/tenant/audit-logs',
    notification: '/api/v1/admin/notifications/audit-logs',
    fileManager: '/api/v1/admin/filemanager/audit-logs',
    translation: '/api/v1/admin/translations/audit-logs',
    category: '/api/v1/admin/categories/audit-logs',
    nasheed: '/api/v1/admin/nasheed/audit-logs',
  };

  getAuditLogs(
    source: AuditLogSource,
    filter?: IAuditLogFilter,
  ): Observable<IPaginatedResponse<IAuditLog>> {
    const url = `${this._gateway}${this._paths[source]}`;
    let params = new HttpParams();

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.append(key, String(value));
        }
      });
    }

    return this._http.get<IPaginatedResponse<IAuditLog>>(url, { params });
  }
}
