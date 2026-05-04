import {
  Component,
  effect,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZardToastComponent } from '@ihsan/ui';
import { ENVIRONMENT, TenantService, TranslationService } from '@ihsan/core';
import { SignalrService } from '@ihsan/shared';

@Component({
  imports: [RouterModule, ZardToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Nasheed Admin';

  private _translationService = inject(TranslationService);
  private _tenantService = inject(TenantService);
  private _platformId = inject(PLATFORM_ID);
  private _signalrService = inject(SignalrService);
  private _environment = inject(ENVIRONMENT);

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this._platformId)) {
        const currentLanguage =
          this._translationService.getCurrentLanguageSignal()();
        const htmlElement = document.documentElement;

        if (currentLanguage === 'ar') {
          htmlElement.setAttribute('dir', 'rtl');
          htmlElement.setAttribute('lang', 'ar');
        } else {
          htmlElement.setAttribute('dir', 'ltr');
          htmlElement.setAttribute('lang', currentLanguage);
        }
      }
    });

    if (isPlatformBrowser(this._platformId)) {
      const tenantId = this._environment.tenantId;
      if (tenantId) {
        this._tenantService.setCurrentTenantId = tenantId;
      }
      this._signalrService.initializeConnection();
    }
  }
}
