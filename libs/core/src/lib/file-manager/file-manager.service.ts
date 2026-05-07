import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
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
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.fileManager}/api/filemanager`;
  private readonly _adminUrl = `${this._env.apiUrls.fileManager}/api/filemanager/admin`;

  // Tenant User Endpoints
  uploadFile(
    file: File,
    group?: FileGroup,
    userId?: number,
    context?: HttpContext
  ): Observable<IFileManagerResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (group) formData.append('group', group.toString());
    if (userId) formData.append('userId', userId.toString());

    return this._http.post<IFileManagerResponse>(
      `${this._baseUrl}/files`,
      formData,
      { context }
    );
  }

  getFileById(id: number): Observable<IFileManagerResponse> {
    return this._http.get<IFileManagerResponse>(`${this._baseUrl}/files/${id}`);
  }

  getFiles(
    request: IFileManagerListRequest,
    context?: HttpContext
  ): Observable<IPaginatedList<IFileManagerResponse>> {
    let params = new HttpParams();

    Object.keys(request).forEach((key) => {
      const typedKey = key as keyof IFileManagerListRequest;
      const value = request[typedKey];
      if (value !== undefined && value !== null) {
        params = params.append(key, value.toString());
      }
    });

    return this._http.get<IPaginatedList<IFileManagerResponse>>(
      `${this._baseUrl}/files`,
      { params, context }
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

  deleteFile(id: number, context?: HttpContext): Observable<object> {
    return this._http.delete(`${this._baseUrl}/files/${id}`, { context });
  }

  downloadFile(id: number): Observable<Blob> {
    return this._http.get(`${this._baseUrl}/files/${id}/download`, {
      responseType: 'blob',
    });
  }

  // Admin Endpoints (Global)

  deleteFileAdmin(
    id: number,
    tenantId?: string,
    context?: HttpContext
  ): Observable<object> {
    let params = new HttpParams();
    if (tenantId) params = params.append('tenantId', tenantId);

    return this._http.delete(`${this._adminUrl}/files/${id}`, {
      params,
      context,
    });
  }

  deleteAllTempFiles(): Observable<object> {
    return this._http.delete(`${this._adminUrl}/files/temp/all`);
  }

  deleteOldTempFiles(olderThanDays = 7): Observable<object> {
    const params = new HttpParams().set(
      'olderThanDays',
      olderThanDays.toString()
    );
    return this._http.delete(`${this._adminUrl}/files/temp/old`, { params });
  }

  uploadToBlob(id: number): Observable<IFileManagerResponse> {
    return this._http.post<IFileManagerResponse>(
      `${this._baseUrl}/files/${id}/upload-to-blob`,
      {}
    );
  }

  removeFromBlob(id: number): Observable<IFileManagerResponse> {
    return this._http.delete<IFileManagerResponse>(
      `${this._baseUrl}/files/${id}/remove-from-blob`
    );
  }
}
