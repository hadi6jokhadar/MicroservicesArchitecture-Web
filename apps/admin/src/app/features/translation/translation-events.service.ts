import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service to coordinate data refresh between translation components
 * Used when dialogs/sheets modify translation data
 */
@Injectable({
  providedIn: 'root',
})
export class TranslationEventsService {
  private readonly _translationKeysChanged$ = new Subject<void>();

  /**
   * Observable that emits when translation keys are modified (add/edit/delete)
   */
  readonly translationKeysChanged$ =
    this._translationKeysChanged$.asObservable();

  /**
   * Notify that translation keys have been modified
   * Call this after successful add/edit/delete operations
   */
  notifyTranslationKeysChanged(): void {
    this._translationKeysChanged$.next();
  }
}
