import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CorrelationIdService {
  private readonly _current = signal<string>(crypto.randomUUID());

  /** The active correlation ID — sent on every outgoing request. */
  readonly current = this._current.asReadonly();

  /** Called by the interceptor when the backend echoes a confirmed ID. */
  update(id: string): void {
    this._current.set(id);
  }
}
