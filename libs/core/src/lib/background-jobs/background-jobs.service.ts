import { Injectable, inject } from '@angular/core';
import { ENVIRONMENT } from '../core/environment.token';

export type BackgroundJobsService_Target =
  | 'category'
  | 'filemanager'
  | 'notification'
  | 'tenant';

@Injectable({
  providedIn: 'root',
})
export class BackgroundJobsService {
  private _env = inject(ENVIRONMENT);

  private get _baseUrls(): Record<BackgroundJobsService_Target, string> {
    return {
      category: `${this._env.apiUrls.category}/admin/jobs/category`,
      filemanager: `${this._env.apiUrls.fileManager}/admin/jobs/filemanager`,
      notification: `${this._env.apiUrls.notification}/admin/jobs/notification`,
      tenant: `${this._env.apiUrls.tenant}/admin/jobs/tenant`,
    };
  }

  openDashboard(target: BackgroundJobsService_Target): void {
    window.open(this._baseUrls[target], '_blank');
  }
}
