import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { FeatureFlagService } from './feature-flag.service';

@Directive({
  selector: '[featureFlag]',
  standalone: true,
})
export class FeatureFlagDirective {
  private readonly _service = inject(FeatureFlagService);
  private readonly _viewContainer = inject(ViewContainerRef);
  private readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);

  readonly featureFlag = input.required<string>();
  readonly featureFlagElse = input<TemplateRef<unknown> | null>(null);

  constructor() {
    effect(() => {
      this._viewContainer.clear();
      if (this._service.isEnabled(this.featureFlag())) {
        this._viewContainer.createEmbeddedView(this._templateRef);
      } else {
        const elseRef = this.featureFlagElse();
        if (elseRef) {
          this._viewContainer.createEmbeddedView(elseRef);
        }
      }
    });
  }
}
