import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  apiUrls: {
    identity: string;
    tenant: string;
    notification: string;
    fileManager: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
