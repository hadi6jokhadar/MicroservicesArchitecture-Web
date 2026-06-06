import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../core/environment.token';
import { IPaginatedResponse } from '../models/common';
import {
  ICategoryDto,
  ICategoryFilterRequest,
  ICreateCategoryRequest,
  IMoveCategoryRequest,
  IUpdateCategoryRequest,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/categories`;
  private readonly _adminBaseUrl = `${this._env.apiUrls.gateway}/api/admin/categories`;

  // ── Tenant-scoped endpoints ──────────────────────────────────────────────

  getAll(
    request?: ICategoryFilterRequest,
  ): Observable<IPaginatedResponse<ICategoryDto>> {
    let params = new HttpParams();
    if (request) {
      Object.keys(request).forEach((key) => {
        const value = (request as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, String(value));
        }
      });
    }
    return this._http.get<IPaginatedResponse<ICategoryDto>>(this._baseUrl, {
      params,
    });
  }

  getTree(textFilter?: string): Observable<ICategoryDto[]> {
    let params = new HttpParams();
    if (textFilter?.trim()) {
      params = params.set('textFilter', textFilter.trim());
    }
    return this._http.get<ICategoryDto[]>(`${this._baseUrl}/tree`, { params });
  }

  getById(id: number): Observable<ICategoryDto> {
    return this._http.get<ICategoryDto>(`${this._baseUrl}/${id}`);
  }

  create(
    request: ICreateCategoryRequest,
    context?: HttpContext,
  ): Observable<ICategoryDto> {
    return this._http.post<ICategoryDto>(this._baseUrl, request, { context });
  }

  update(
    id: number,
    request: IUpdateCategoryRequest,
    context?: HttpContext,
  ): Observable<ICategoryDto> {
    return this._http.put<ICategoryDto>(`${this._baseUrl}/${id}`, request, {
      context,
    });
  }

  move(
    id: number,
    request: IMoveCategoryRequest,
    context?: HttpContext,
  ): Observable<ICategoryDto> {
    return this._http.put<ICategoryDto>(
      `${this._baseUrl}/${id}/move`,
      request,
      { context },
    );
  }

  delete(id: number): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`);
  }

  // ── Admin (bypass-tenant) endpoints ────────────────────────────────────

  adminGetAll(
    request?: ICategoryFilterRequest,
  ): Observable<IPaginatedResponse<ICategoryDto>> {
    let params = new HttpParams();
    if (request) {
      Object.keys(request).forEach((key) => {
        const value = (request as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, String(value));
        }
      });
    }
    return this._http.get<IPaginatedResponse<ICategoryDto>>(
      this._adminBaseUrl,
      { params },
    );
  }

  adminGetTree(): Observable<ICategoryDto[]> {
    return this._http.get<ICategoryDto[]>(`${this._adminBaseUrl}/tree`);
  }
}
