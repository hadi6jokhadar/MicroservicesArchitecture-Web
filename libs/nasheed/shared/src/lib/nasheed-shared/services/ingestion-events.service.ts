import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { SignalrService } from '@ihsan/shared';
import { isNasheedIngestionProgressNotification } from './nasheed-realtime.constants';

@Injectable({
  providedIn: 'root',
})
export class IngestionEventsService {
  private readonly _dataChanged$ = new Subject<void>();
  private readonly _signalrService = inject(SignalrService);

  readonly dataChanged$ = this._dataChanged$.asObservable();

  constructor() {
    this._signalrService.notificationReceived.subscribe((notification) => {
      if (isNasheedIngestionProgressNotification(notification)) {
        this.notifyDataChanged();
      }
    });
  }

  notifyDataChanged(): void {
    this._dataChanged$.next();
  }
}
