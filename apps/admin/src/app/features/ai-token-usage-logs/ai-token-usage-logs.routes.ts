import { Routes } from '@angular/router';
import { aiTokenUsageLogsResolver } from '@ihsan/core';
import { TokenUsageLogsComponent } from './token-usage-logs/token-usage-logs.component';

export const aiTokenUsageLogsRoutes: Routes = [
  {
    path: '',
    component: TokenUsageLogsComponent,
    resolve: { logs: aiTokenUsageLogsResolver },
  },
];
