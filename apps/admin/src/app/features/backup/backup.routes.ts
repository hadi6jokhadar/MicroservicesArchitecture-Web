import { Routes } from '@angular/router';
import { backupSummaryResolver } from '@ihsan/core';
import { BackupComponent } from './backup.component';
import { BackupOverviewComponent } from './overview/backup-overview.component';
import { BackupHistoryComponent } from './history/backup-history.component';

export const backupRoutes: Routes = [
  {
    path: '',
    component: BackupComponent,
    children: [
      {
        path: 'overview',
        component: BackupOverviewComponent,
        resolve: { summary: backupSummaryResolver },
      },
      {
        path: 'history',
        component: BackupHistoryComponent,
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
    ],
  },
];
