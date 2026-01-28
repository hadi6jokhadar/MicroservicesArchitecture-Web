import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  apiUrls: {
    identity: string;
    tenant: string;
    notification: string;
    fileManager: string;
    translation: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
