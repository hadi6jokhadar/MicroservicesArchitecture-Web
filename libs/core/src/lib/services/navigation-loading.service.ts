import { Injectable, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationLoadingService {
  private readonly _router = inject(Router);

  private readonly _isNavigating = signal<boolean>(false);

  /** True while a route transition is in flight — used to block repeated nav clicks. */
  readonly isNavigating = this._isNavigating.asReadonly();

  constructor() {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this._isNavigating.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError ||
        event instanceof NavigationSkipped
      ) {
        this._isNavigating.set(false);
      }
    });
  }
}
