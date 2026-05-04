import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  tenantId?: string;
  apiUrls: {
    identity: string;
    tenant: string;
    notification: string;
    fileManager: string;
    translation: string;
    ai: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
