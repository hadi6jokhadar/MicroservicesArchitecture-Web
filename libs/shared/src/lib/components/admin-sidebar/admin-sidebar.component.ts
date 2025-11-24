import {
  Component,
  signal,
  ElementRef,
  AfterViewInit,
  inject,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface INavItem {
  icon: string;
  label: string;
  route?: string;
}

@Component({
  selector: 'shared-admin-sidebar',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent implements AfterViewInit {
  private _elementRef = inject(ElementRef);

  showLabels = signal(false);
  selectedIndex = signal(0);
  isVisible = signal(true);

  // Drag-to-scroll properties
  private _isDragging = false;
  private _startY = 0;
  private _scrollTop = 0;
  private _sidebarElement: HTMLElement | null = null;

  navItems: INavItem[] = [
    { icon: 'person', label: 'Users', route: '/users' },
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'list', label: 'Item1', route: '/item1' },
    { icon: 'list', label: 'Item2', route: '/item2' },
    { icon: 'list', label: 'Item3', route: '/item3' },
    { icon: 'list', label: 'Item4', route: '/item4' },
    { icon: 'list', label: 'Item5', route: '/item5' },
    { icon: 'list', label: 'Item6', route: '/item6' },
  ];

  private _hideTimeout: ReturnType<typeof setTimeout> | undefined;

  toggleLabels(): void {
    this.showLabels.update((value) => !value);
  }

  toggleVisibility(): void {
    this.isVisible.update((value) => !value);
    if (this.isVisible()) {
      clearTimeout(this._hideTimeout);
    }
  }

  showSidebar(): void {
    this.isVisible.set(true);
    clearTimeout(this._hideTimeout);
  }

  onSidebarMouseEnter(): void {
    clearTimeout(this._hideTimeout);
  }

  onSidebarMouseLeave(): void {
    this._hideTimeout = setTimeout(() => {
      this.isVisible.set(false);
    }, 1000);
  }

  selectItem(index: number): void {
    this.selectedIndex.set(index);
  }

  ngAfterViewInit(): void {
    this._sidebarElement =
      this._elementRef.nativeElement.querySelector('.sidebar-container');

    if (this._sidebarElement) {
      this._sidebarElement.addEventListener(
        'mousedown',
        this._onMouseDown.bind(this)
      );
      this._sidebarElement.addEventListener(
        'mousemove',
        this._onMouseMove.bind(this)
      );
      this._sidebarElement.addEventListener(
        'mouseup',
        this._onMouseUp.bind(this)
      );
      this._sidebarElement.addEventListener(
        'mouseleave',
        this._onMouseLeave.bind(this)
      );
    }
  }

  private _onMouseDown(e: MouseEvent): void {
    if (!this._sidebarElement) return;

    this._isDragging = true;
    this._startY = e.pageY - this._sidebarElement.offsetTop;
    this._scrollTop = this._sidebarElement.scrollTop;
    this._sidebarElement.classList.add('dragging');
  }

  private _onMouseMove(e: MouseEvent): void {
    if (!this._isDragging || !this._sidebarElement) return;

    e.preventDefault();
    const y = e.pageY - this._sidebarElement.offsetTop;
    const walk = (y - this._startY) * 2; // Scroll speed multiplier
    this._sidebarElement.scrollTop = this._scrollTop - walk;
  }

  private _onMouseUp(): void {
    this._isDragging = false;
    this._sidebarElement?.classList.remove('dragging');
  }

  private _onMouseLeave(): void {
    this._isDragging = false;
    this._sidebarElement?.classList.remove('dragging');
  }
}
