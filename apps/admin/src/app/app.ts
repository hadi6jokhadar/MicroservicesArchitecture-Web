import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ZardToastComponent } from '@ihsan/ui';
import { TranslationService } from '@ihsan/core';

@Component({
  imports: [RouterModule, ZardToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Ihsandev';

  private _translationService = inject(TranslationService);
  private _platformId = inject(PLATFORM_ID);

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
  }
}
