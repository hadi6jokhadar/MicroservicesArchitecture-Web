import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IFileManagerResponse,
  IFileManagerListRequest,
  IUpdateFileRequest,
  IPaginatedList,
  FileGroup,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  private _http = inject(HttpClient);
  private readonly _baseUrl = '/api/filemanager';
  private readonly _adminUrl = '/api/filemanager/admin';

  // Tenant User Endpoints
  uploadFile(
    file: File,
    group?: FileGroup,
    userId?: number
  ): Observable<IFileManagerResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (group) formData.append('group', group.toString());
    if (userId) formData.append('userId', userId.toString());

    return this._http.post<IFileManagerResponse>(
      `${this._baseUrl}/files`,
      formData
    );
  }

  getFileById(id: number): Observable<IFileManagerResponse> {
    return this._http.get<IFileManagerResponse>(`${this._baseUrl}/files/${id}`);
  }

  getFiles(
    request: IFileManagerListRequest
  ): Observable<IPaginatedList<IFileManagerResponse>> {
    let params = new HttpParams();

    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== undefined && value !== null) {
        params = params.append(key, value.toString());
      }
    });

    return this._http.get<IPaginatedList<IFileManagerResponse>>(
      `${this._baseUrl}/files`,
      { params }
    );
  }

  updateFile(
    id: number,
    request: IUpdateFileRequest
  ): Observable<IFileManagerResponse> {
    return this._http.put<IFileManagerResponse>(
      `${this._baseUrl}/files/${id}`,
      request
    );
  }

  deleteFile(id: number): Observable<object> {
    return this._http.delete(`${this._baseUrl}/files/${id}`);
  }

  downloadFile(id: number): Observable<Blob> {
    return this._http.get(`${this._baseUrl}/files/${id}/download`, {
      responseType: 'blob',
    });
  }

  // Admin Endpoints (Global)
  uploadFileAdmin(
    file: File,
    group?: FileGroup,
    userId?: number,
    tenantId?: string
  ): Observable<IFileManagerResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (group) formData.append('group', group.toString());
    if (userId) formData.append('userId', userId.toString());

    let params = new HttpParams();
    if (tenantId) params = params.append('tenantId', tenantId);

    return this._http.post<IFileManagerResponse>(
      `${this._adminUrl}/files`,
      formData,
      { params }
    );
  }

  getFileByIdAdmin(
    id: number,
    tenantId?: string
  ): Observable<IFileManagerResponse> {
    let params = new HttpParams();
    if (tenantId) params = params.append('tenantId', tenantId);

    return this._http.get<IFileManagerResponse>(
      `${this._adminUrl}/files/${id}`,
      { params }
    );
  }

  getFilesAdmin(
    request: IFileManagerListRequest,
    tenantId?: string
  ): Observable<IPaginatedList<IFileManagerResponse>> {
    let params = new HttpParams();

    Object.keys(request).forEach((key) => {
      const value = (request as any)[key];
      if (value !== undefined && value !== null) {
        params = params.append(key, value.toString());
      }
    });

    if (tenantId) params = params.append('tenantId', tenantId);

    return this._http.get<IPaginatedList<IFileManagerResponse>>(
      `${this._adminUrl}/files`,
      { params }
    );
  }

  updateFileAdmin(
    id: number,
    request: IUpdateFileRequest,
    tenantId?: string
  ): Observable<IFileManagerResponse> {
    let params = new HttpParams();
    if (tenantId) params = params.append('tenantId', tenantId);

    return this._http.put<IFileManagerResponse>(
      `${this._adminUrl}/files/${id}`,
      request,
      { params }
    );
  }

  deleteFileAdmin(id: number, tenantId?: string): Observable<object> {
    let params = new HttpParams();
    if (tenantId) params = params.append('tenantId', tenantId);

    return this._http.delete(`${this._adminUrl}/files/${id}`, { params });
  }

  deleteAllTempFiles(): Observable<object> {
    return this._http.delete(`${this._adminUrl}/files/temp/all`);
  }

  deleteOldTempFiles(olderThanDays: number = 7): Observable<object> {
    const params = new HttpParams().set(
      'olderThanDays',
      olderThanDays.toString()
    );
    return this._http.delete(`${this._adminUrl}/files/temp/old`, { params });
  }
}
