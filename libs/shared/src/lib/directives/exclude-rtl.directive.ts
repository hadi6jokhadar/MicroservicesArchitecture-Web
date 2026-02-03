import {
  Directive,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
} from '@angular/core';

/**
 * Directive to exclude an element from RTL (Right-to-Left) direction changes.
 *
 * This directive forces the element to always use LTR (Left-to-Right) direction,
 * regardless of the current language direction. Useful for components that should
 * not flip in RTL mode, such as:
 * - Pagination controls
 * - Number displays
 * - Code blocks
 * - Phone numbers
 * - Dates in numeric format
 *
 * @example
 * ```html
 * <!-- Pagination stays LTR even in Arabic -->
 * <z-pagination appExcludeRtl [zTotal]="totalPages()" [(zPageIndex)]="currentPage" />
 *
 * <!-- Phone number input stays LTR -->
 * <input appExcludeRtl type="tel" formControlName="phone" />
 * ```
 */
@Directive({
  selector: '[appExcludeRtl]',
  standalone: true,
})
export class ExcludeRtlDirective implements OnInit {
  private readonly _elementRef = inject(ElementRef);
  private readonly _renderer = inject(Renderer2);

  ngOnInit(): void {
    // Force LTR direction on this element
    this._renderer.setAttribute(this._elementRef.nativeElement, 'dir', 'ltr');

    // Add a class for additional styling if needed
    this._renderer.addClass(this._elementRef.nativeElement, 'exclude-rtl');
  }
}
