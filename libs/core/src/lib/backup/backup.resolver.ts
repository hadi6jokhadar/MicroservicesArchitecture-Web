import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable } from 'rxjs';
import { BackupService } from './backup.service';
import { IBackupSummary } from './models';

export const backupSummaryResolver: ResolveFn<IBackupSummary[]> = (): Observable<
  IBackupSummary[]
> => {
  const backupService = inject(BackupService);
  return backupService.getBackupSummary();
};
