import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Needs to be impure to react to translation changes
})
export class TranslatePipe implements PipeTransform {
  private readonly _translationService = inject(TranslationService);

  transform(
    key: string,
    arg1?: string | Record<string, unknown>,
    arg2?: Record<string, unknown>
  ): string {
    let defaultValue: string | undefined;
    let params: Record<string, unknown> | undefined;

    if (typeof arg1 === 'string') {
      defaultValue = arg1;
      if (arg2) {
        params = arg2;
      }
    } else if (typeof arg1 === 'object') {
      params = arg1;
    }

    return this._translationService.getCachedTranslation(
      key,
      defaultValue,
      params
    );
  }
}
