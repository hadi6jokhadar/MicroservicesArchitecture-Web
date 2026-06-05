import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideZard } from '@ihsan/ui/lib/zard/core/provider/providezard';
import { correlationIdInterceptor, ENVIRONMENT, tenantInterceptor, tokenInterceptor } from '@ihsan/core';
import { errorInterceptor } from '@ihsan/shared';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([correlationIdInterceptor, errorInterceptor, tokenInterceptor, tenantInterceptor])
    ),
    provideAnimationsAsync(),
    { provide: ENVIRONMENT, useValue: environment },
    provideZard(),
  ],
};
