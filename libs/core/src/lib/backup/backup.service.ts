import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ENVIRONMENT } from '../core/environment.token';
import { IPaginatedResponse } from '../models/common';
import {
  IBackupTarget,
  IBackupRun,
  IRestoreRun,
  IBackupSummary,
  ITriggerBackupRequest,
  IUpdateBackupTargetRequest,
  ITriggerRestoreRequest,
  IBackupRunFilterRequest,
  IRestoreRunFilterRequest,
  BackupTargetClass,
  BackupRunClass,
  RestoreRunClass,
  BackupSummaryClass,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private _http = inject(HttpClient);
  private _env = inject(ENVIRONMENT);
  private readonly _baseUrl = `${this._env.apiUrls.gateway}/api/v1/admin`;

  // State
  readonly summary = signal<BackupSummaryClass[]>([]);
  readonly targets = signal<BackupTargetClass[]>([]);
  readonly runs = signal<BackupRunClass[]>([]);
  readonly restoreRuns = signal<RestoreRunClass[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);
  readonly totalPages = signal<number>(1);
  readonly restoreRunsTotalCount = signal<number>(0);
  readonly restoreRunsTotalPages = signal<number>(1);
  readonly isRestoreRunsLoading = signal<boolean>(false);

  getBackupTargets(): Observable<IBackupTarget[]> {
    this.isLoading.set(true);
    return this._http.get<IBackupTarget[]>(`${this._baseUrl}/backup-targets`).pipe(
      tap({
        next: (targets) => {
          this.targets.set(targets.map((t) => new BackupTargetClass(t)));
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      })
    );
  }

  updateBackupTarget(
    id: number,
    request: IUpdateBackupTargetRequest,
    context?: HttpContext
  ): Observable<IBackupTarget> {
    return this._http
      .patch<IBackupTarget>(`${this._baseUrl}/backup-targets/${id}`, request, {
        context,
      })
      .pipe(
        tap((updated) => {
          this.targets.update((items) =>
            items.map((t) =>
              t.id === id ? new BackupTargetClass(updated) : t
            )
          );
        })
      );
  }

  getBackupSummary(): Observable<IBackupSummary[]> {
    this.isLoading.set(true);
    return this._http.get<IBackupSummary[]>(`${this._baseUrl}/backups/summary`).pipe(
      tap({
        next: (summary) => {
          this.summary.set(summary.map((s) => new BackupSummaryClass(s)));
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      })
    );
  }

  triggerBackup(
    request: ITriggerBackupRequest,
    context?: HttpContext
  ): Observable<IBackupRun> {
    return this._http.post<IBackupRun>(`${this._baseUrl}/backups/trigger`, request, {
      context,
    });
  }

  getBackupRuns(
    request?: IBackupRunFilterRequest
  ): Observable<IPaginatedResponse<IBackupRun>> {
    let params = new HttpParams();

    if (request) {
      Object.keys(request).forEach((key) => {
        const value = (request as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    this.isLoading.set(true);
    return this._http
      .get<IPaginatedResponse<IBackupRun>>(`${this._baseUrl}/backups`, { params })
      .pipe(
        tap({
          next: (response) => {
            this.runs.set(response.items.map((item) => new BackupRunClass(item)));
            this.totalCount.set(response.totalCount);
            this.totalPages.set(response.totalPages);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        })
      );
  }

  getBackupRunById(id: number): Observable<IBackupRun> {
    return this._http.get<IBackupRun>(`${this._baseUrl}/backups/${id}`);
  }

  restoreBackup(
    id: number,
    request: ITriggerRestoreRequest,
    context?: HttpContext
  ): Observable<IRestoreRun> {
    return this._http.post<IRestoreRun>(
      `${this._baseUrl}/backups/${id}/restore`,
      request,
      { context }
    );
  }

  getRestoreRuns(
    request?: IRestoreRunFilterRequest
  ): Observable<IPaginatedResponse<IRestoreRun>> {
    let params = new HttpParams();

    if (request) {
      Object.keys(request).forEach((key) => {
        const value = (request as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    this.isRestoreRunsLoading.set(true);
    return this._http
      .get<IPaginatedResponse<IRestoreRun>>(`${this._baseUrl}/restores`, { params })
      .pipe(
        tap({
          next: (response) => {
            this.restoreRuns.set(
              response.items.map((item) => new RestoreRunClass(item))
            );
            this.restoreRunsTotalCount.set(response.totalCount);
            this.restoreRunsTotalPages.set(response.totalPages);
            this.isRestoreRunsLoading.set(false);
          },
          error: () => this.isRestoreRunsLoading.set(false),
        })
      );
  }
}
