import {
  Directive,
  output,
  input,
  HostListener,
  HostBinding,
  ElementRef,
  inject,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appDragDropFiles]',
  standalone: true,
  host: {
    '[style.transition]': '"all 0.3s ease"',
  },
})
export class DragDropFilesDirective {
  private _elementRef = inject(ElementRef);
  private _renderer = inject(Renderer2);

  readonly multiple = input<boolean>(false);
  readonly accept = input<string>('*');
  readonly maxFiles = input<number>(20);
  readonly disabled = input<boolean>(false);

  readonly filesDropped = output<DragEvent>();

  @HostBinding('class.drag-over') _isDragOver = false;
  @HostBinding('style.backgroundColor')
  get _backgroundColor() {
    return this.disabled()
      ? 'color-mix(in srgb, var(--text-text-disabled) 30%, transparent)'
      : this._bgColor;
  }

  private _bgColor = 'transparent';

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    this._isDragOver = true;
    this._bgColor =
      'color-mix(in srgb, var(--background-background-hover) 100%, transparent)';
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();

    // Only remove styles if leaving the element itself, not child elements
    const rect = this._elementRef.nativeElement.getBoundingClientRect();
    if (
      event.clientX <= rect.left ||
      event.clientX >= rect.right ||
      event.clientY <= rect.top ||
      event.clientY >= rect.bottom
    ) {
      this._resetStyles();
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    event.stopPropagation();
    this._resetStyles();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    const filteredFiles = this._filterFilesByAccept(files);
    if (filteredFiles.length === 0) {
      return;
    }

    // Limit to maxFiles
    const limitedFiles = this._limitFiles(filteredFiles);

    // If single mode, keep only first file
    if (!this.multiple() && limitedFiles.length > 1) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(limitedFiles[0]);

      // Replace the event's dataTransfer files
      Object.defineProperty(event, 'dataTransfer', {
        value: dataTransfer,
        writable: false,
      });
    } else if (limitedFiles.length !== files.length) {
      // Update with filtered/limited files
      Object.defineProperty(event, 'dataTransfer', {
        value: this._createDataTransfer(limitedFiles),
        writable: false,
      });
    }

    this.filesDropped.emit(event);
  }

  private _resetStyles(): void {
    this._isDragOver = false;
    this._bgColor = 'transparent';
  }

  private _filterFilesByAccept(files: FileList): File[] {
    const acceptedTypes = this.accept();
    if (acceptedTypes === '*') {
      return Array.from(files);
    }

    const acceptedExtensions = acceptedTypes
      .split(',')
      .map((type) => type.trim().toLowerCase());

    return Array.from(files).filter((file) => {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const mimeType = file.type.toLowerCase();

      return acceptedExtensions.some((accepted) => {
        if (accepted.startsWith('.')) {
          return fileExtension === accepted;
        }
        if (accepted.endsWith('/*')) {
          const category = accepted.split('/')[0];
          return mimeType.startsWith(`${category}/`);
        }
        return mimeType === accepted;
      });
    });
  }

  private _limitFiles(files: File[]): File[] {
    const max = this.maxFiles();
    return files.length > max ? files.slice(0, max) : files;
  }

  private _createDataTransfer(files: File[]): DataTransfer {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer;
  }
}
