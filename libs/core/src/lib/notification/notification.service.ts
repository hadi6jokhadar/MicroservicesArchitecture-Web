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

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.notification}/api/notifications`;

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

  getQueueItems(): Observable<IQueueItemDto[]> {
    // Note: Pagination logic can be added if needed
    return this._http.get<IQueueItemDto[]>(`${this._baseUrl}/queue`);
  }
}
