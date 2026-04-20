import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AiSettingsService } from './ai-settings.service';
import { IAiProviderSetting } from './models';

export const aiSettingsResolver: ResolveFn<IAiProviderSetting[]> = () => {
  const aiSettingsService = inject(AiSettingsService);
  return aiSettingsService.getSettings('all').pipe(catchError(() => of([])));
};
