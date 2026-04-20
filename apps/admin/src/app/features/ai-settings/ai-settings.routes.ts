import { Routes } from '@angular/router';
import { aiSettingsResolver } from '@ihsan/core';
import { AiSettingsComponent } from './ai-settings/ai-settings.component';

export const aiSettingsRoutes: Routes = [
  {
    path: '',
    component: AiSettingsComponent,
    resolve: { settings: aiSettingsResolver },
  },
];
