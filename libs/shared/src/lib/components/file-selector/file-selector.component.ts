import {
  Component,
  Output,
  EventEmitter,
  inject,
  signal,
  ChangeDetectionStrategy,
  input,
  effect,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardIconComponent,
  ZardDialogService,
} from '@ihsan/ui';
import { IFileManagerResponse, FileType, FileGroup } from '@ihsan/core';
import { FileManagerComponent } from '../file-manager/file-manager.component';

@Component({
  selector: 'shared-file-selector',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './file-selector.component.html',
  styleUrl: './file-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSelectorComponent {
  private _dialogService = inject(ZardDialogService);

  allowedTypes = input(['*']);
  maxFiles = input(1);
  selectionMode = input<'single' | 'multiple'>('single');
  viewMode = input<'list' | 'grid' | 'badge'>('grid');
  label = input('Select File');
  group = input<FileGroup | undefined>(undefined);
  type = input<FileType | undefined>(undefined);
  allowSubmitEmpty = input(false);
  buttonType = input<
    'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  >('default');

  files = input<IFileManagerResponse[] | null | undefined>(undefined);

  selectedFiles = signal<IFileManagerResponse[]>([]);
  selectedFilesCount = computed(() => this.selectedFiles().length);
  fileManagerViewMode = computed<'list' | 'grid'>(() => {
    const viewMode = this.viewMode();
    return viewMode === 'badge' ? 'grid' : viewMode;
  });

  @Output() filesChanged = new EventEmitter<IFileManagerResponse[]>();

  constructor() {
    effect(
      () => {
        const files = this.files();
        this.selectedFiles.set(files || []);
      },
      { allowSignalWrites: true }
    );
  }

  get filesValue(): IFileManagerResponse[] {
    return this.selectedFiles();
  }

  openFileManagerDialog(): void {
    const dialogRef = this._dialogService.create({
      zContent: FileManagerComponent,
      zData: {
        allowedTypes: this.allowedTypes(),
        maxFiles: this.maxFiles(),
        selectionMode: this.selectionMode(),
        viewMode: this.fileManagerViewMode(),
        selectedFiles: this.selectedFiles(),
        group: this.group(),
        type: this.type(),
        allowSubmitEmpty: this.allowSubmitEmpty(),
      },
      zWidth: '80vw',
      zCustomClasses: 'z-dialog-max-width-100',
      zHideFooter: true,
    });

    dialogRef
      .afterClosed()
      .subscribe((files: IFileManagerResponse[] | undefined) => {
        if (files) {
          this.handleSelection(files);
        }
      });
  }

  handleSelection(files: IFileManagerResponse[]): void {
    this.selectedFiles.set(files);
    this.filesChanged.emit(files);
  }

  clearFiles(): void {
    this.selectedFiles.set([]);
    this.filesChanged.emit([]);
  }

  removeFile(file: IFileManagerResponse, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const updatedFiles = this.selectedFiles().filter((f) => f.id !== file.id);
    this.selectedFiles.set(updatedFiles);
    this.filesChanged.emit(updatedFiles);
  }

  drop(event: CdkDragDrop<IFileManagerResponse[]>): void {
    if (this.selectionMode() === 'single') return;

    const currentFiles = [...this.selectedFiles()];
    moveItemInArray(currentFiles, event.previousIndex, event.currentIndex);
    this.selectedFiles.set(currentFiles);
    this.filesChanged.emit(currentFiles);
  }

  isImage(file: IFileManagerResponse): boolean {
    return (
      file.type === FileType.Image ||
      ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'].includes(
        file.extension?.toLowerCase() || ''
      )
    );
  }
}
