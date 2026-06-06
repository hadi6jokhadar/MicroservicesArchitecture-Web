import { InjectionToken } from '@angular/core';

export interface Environment {
  production: boolean;
  tenantId?: string;
  apiUrls: {
    gateway: string;
    identity?: string;
    tenant?: string;
    notification?: string;
    fileManager?: string;
    translation?: string;
    ai?: string;
    category?: string;
    nasheed?: string;
  };
}

export const ENVIRONMENT = new InjectionToken<Environment>('environment');
