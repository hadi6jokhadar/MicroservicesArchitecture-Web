import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import {
  INotificationResponse,
  ISendNotificationResponse,
  IQueueItemStatusResponse,
  IQueueItemDto,
  ISendNotificationRequest,
} from './models';

import { IPaginatedResponse } from '../models/common';
import { HttpParams } from '@angular/common/http';

export interface IQueueItemFilterRequest {
  pageNumber?: number;
  pageSize?: number;
  isArchived?: boolean;
  tenantId?: string;
  userId?: number;
  status?: number;
  priority?: number;
  deliveryType?: number;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/notifications`;

  // User Endpoints
  getUserNotifications(): Observable<INotificationResponse[]> {
    return this._http.get<INotificationResponse[]>(`${this._baseUrl}/user`);
  }

  markAsRead(id: number): Observable<object> {
    return this._http.put(`${this._baseUrl}/${id}/read`, {});
  }

  // Service/Admin Endpoints
  sendNotification(
    request: ISendNotificationRequest
  ): Observable<ISendNotificationResponse> {
    return this._http.post<ISendNotificationResponse>(
      `${this._baseUrl}/send`,
      request
    );
  }

  getQueueStatus(id: number): Observable<IQueueItemStatusResponse> {
    return this._http.get<IQueueItemStatusResponse>(
      `${this._baseUrl}/status/${id}`
    );
  }

  getQueueItems(
    request?: IQueueItemFilterRequest
  ): Observable<IPaginatedResponse<IQueueItemDto>> {
    let params = new HttpParams();

    if (request) {
      Object.keys(request).forEach((key) => {
        const value = (request as any)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this._http.get<IPaginatedResponse<IQueueItemDto>>(
      `${this._baseUrl}/queue`,
      { params }
    );
  }

  toggleQueueItemArchive(id: number): Observable<any> {
    return this._http.patch(`${this._baseUrl}/queue/${id}/toggle-archive`, {});
  }
}
