import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Service to coordinate data refresh between snap request components.
 * Used when dialogs/sheets modify snap request data.
 */
@Injectable({ providedIn: 'root' })
export class SnapRequestEventsService {
  private readonly _snapRequestsChanged$ = new Subject<void>();

  /**
   * Observable that emits when snap requests are modified (add/edit/delete)
   */
  readonly snapRequestsChanged$ = this._snapRequestsChanged$.asObservable();

  /**
   * Notify that snap requests have been modified.
   * Call this after successful add/edit/delete operations.
   */
  notifySnapRequestsChanged(): void {
    this._snapRequestsChanged$.next();
  }
}
