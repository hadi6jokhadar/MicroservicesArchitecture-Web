import { inject, Injectable, signal } from '@angular/core';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class RtlService {
  private readonly _translationService = inject(TranslationService);

  /**
   * Check if current language is RTL (Right-to-Left)
   * @returns true if current language requires RTL layout
   */
  isRtl(): boolean {
    const currentLanguage =
      this._translationService.getCurrentLanguageSignal()();
    return this.isLanguageRtl(currentLanguage);
  }

  /**
   * Check if a specific language is RTL
   * @param languageCode - Language code to check (e.g., 'ar', 'he')
   * @returns true if language requires RTL layout
   */
  isLanguageRtl(languageCode: string): boolean {
    // List of RTL languages
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(languageCode);
  }

  /**
   * Get the current text direction
   * @returns 'rtl' or 'ltr'
   */
  getDirection(): 'rtl' | 'ltr' {
    return this.isRtl() ? 'rtl' : 'ltr';
  }

  /**
   * Get the sheet side based on current direction
   * For RTL: 'left' becomes 'right', 'right' becomes 'left'
   * @param side - Original side ('left' | 'right' | 'top' | 'bottom')
   * @returns Adjusted side for RTL
   */
  getSheetSide(
    side: 'left' | 'right' | 'top' | 'bottom'
  ): 'left' | 'right' | 'top' | 'bottom' {
    if (!this.isRtl()) {
      return side;
    }

    // Flip horizontal sides for RTL
    if (side === 'left') return 'right';
    if (side === 'right') return 'left';

    // Top and bottom remain the same
    return side;
  }

  /**
   * Get CSS transform for sheet animation based on direction
   * @param side - Sheet side
   * @returns Transform value for animation
   */
  getSheetTransform(side: 'left' | 'right' | 'top' | 'bottom'): string {
    const effectiveSide = this.getSheetSide(side);

    switch (effectiveSide) {
      case 'left':
        return 'translateX(-100%)';
      case 'right':
        return 'translateX(100%)';
      case 'top':
        return 'translateY(-100%)';
      case 'bottom':
        return 'translateY(100%)';
      default:
        return 'translateX(-100%)';
    }
  }
}
