import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TenantEventsService {
  private readonly _dataChanged = new Subject<void>();
  readonly dataChanged$ = this._dataChanged.asObservable();

  notifyDataChanged(): void {
    this._dataChanged.next();
  }
}
