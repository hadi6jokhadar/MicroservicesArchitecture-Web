import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Needs to be impure to react to translation changes
})
export class TranslatePipe implements PipeTransform {
  private readonly _translationService = inject(TranslationService);

  transform(key: string, defaultValue?: string): string {
    return this._translationService.getCachedTranslation(key, defaultValue);
  }
}
