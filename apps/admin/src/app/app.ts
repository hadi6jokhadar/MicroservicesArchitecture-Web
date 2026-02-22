import {
  Component,
  effect,
  inject,
  isDevMode,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZardToastComponent } from '@ihsan/ui';
import { TenantService, TranslationService } from '@ihsan/core';

@Component({
  imports: [RouterModule, ZardToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Ihsandev';

  private _translationService = inject(TranslationService);
  private _tenantService = inject(TenantService);
  private _platformId = inject(PLATFORM_ID);

  protected isDevMode = isDevMode();
  protected tenantId = '';

  constructor() {
    // Automatically update direction and lang attribute based on current language
    effect(() => {
      if (isPlatformBrowser(this._platformId)) {
        const currentLanguage =
          this._translationService.getCurrentLanguageSignal()();
        const htmlElement = document.documentElement;

        // Set direction: RTL for Arabic, LTR for others
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
      this.tenantId = localStorage.getItem('tenantId') || '';
      if (this.tenantId) {
        this._tenantService.setCurrentTenantId = this.tenantId;
      }
    }
  }

  protected onTenantIdChange(event: Event) {
    if (isPlatformBrowser(this._platformId)) {
      const input = event.target as HTMLInputElement;
      this.tenantId = input.value;
      if (input.value) {
        localStorage.setItem('tenantId', input.value);
        this._tenantService.setCurrentTenantId = input.value;
      } else {
        localStorage.removeItem('tenantId');
        this._tenantService.clearCurrentTenantId();
      }
    }
  }

  protected clearTenantIdStorage() {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.removeItem('tenantId');
      this.tenantId = '';
    }
  }
}
