import { Injectable, Signal, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly _flags = signal<Record<string, boolean>>({});

  setFlags(flags: Record<string, boolean> | null | undefined): void {
    this._flags.set(flags ?? {});
  }

  isEnabled(flagName: string, defaultValue = true): boolean {
    const flags = this._flags();
    return flagName in flags ? flags[flagName] : defaultValue;
  }

  isEnabledSignal(flagName: string, defaultValue = true): Signal<boolean> {
    return computed(() => {
      const flags = this._flags();
      return flagName in flags ? flags[flagName] : defaultValue;
    });
  }
}
