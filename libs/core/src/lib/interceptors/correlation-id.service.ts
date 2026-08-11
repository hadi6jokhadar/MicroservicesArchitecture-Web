import { Injectable, signal } from '@angular/core';

// crypto.randomUUID() only exists in secure contexts (HTTPS or localhost) — this deployment
// serves the admin/nasheed apps over plain HTTP on a non-localhost hostname, where
// window.crypto.randomUUID is undefined and throws a TypeError at app init.
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class CorrelationIdService {
  private readonly _current = signal<string>(generateUuid());

  /** The active correlation ID — sent on every outgoing request. */
  readonly current = this._current.asReadonly();

  /** Called by the interceptor when the backend echoes a confirmed ID. */
  update(id: string): void {
    this._current.set(id);
  }
}
