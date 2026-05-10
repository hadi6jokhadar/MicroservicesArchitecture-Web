import {
  ElementRef,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {
  FileManagerService,
  IFileManagerResponse,
  IFileManagerListRequest,
  FileGroup,
  FileType,
  TranslatePipe,
  TranslationService,
  TenantService,
} from '@ihsan/core';
import {
  SKIP_ERROR_TOAST,
  extractErrorMessage,
} from '../../interceptors/error.interceptor';
import { DragDropFilesDirective } from '../../directives/drag-drop-files.directive';
import {
  ZardTabGroupComponent,
  ZardTabComponent,
  ZardPaginationComponent,
  ZardButtonComponent,
  ZardIconComponent,
  ZardInputDirective,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardCheckboxComponent,
  ZardDialogRef,
  ZardDialogService,
  Z_MODAL_DATA,
  ZardIcon,
  ZardAlertComponent,
} from '@ihsan/ui';
import {
  AudioEditorDialogComponent,
  IAudioEditorDialogResult,
} from './audio-editor-dialog/audio-editor-dialog.component';

export interface IFileManagerDialogData {
  allowedTypes?: string[];
  maxFiles?: number;
  viewMode?: 'list' | 'grid';
  selectionMode?: 'single' | 'multiple';
  canSubmit?: boolean;
  allowSubmitEmpty?: boolean;
  selectedFiles?: IFileManagerResponse[];
  group?: FileGroup;
  type?: FileType;
}

@Component({
  selector: 'shared-file-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    DragDropFilesDirective,
    ZardTabGroupComponent,
    ZardTabComponent,
    ZardPaginationComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardCheckboxComponent,
    ZardAlertComponent,
  ],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerComponent implements OnInit, OnDestroy {
  private _service = inject(FileManagerService);
  private _tenantService = inject(TenantService);
  private _translationService = inject(TranslationService);
  private _dialogRef = inject(ZardDialogRef);
  private _dialogService = inject(ZardDialogService);
  private _data = inject<IFileManagerDialogData>(Z_MODAL_DATA, {
    optional: true,
  });
  private _fb = inject(FormBuilder);

  @ViewChild(ZardTabGroupComponent) tabGroup!: ZardTabGroupComponent;
  @ViewChild('fileManagerContainer', { static: true })
  fileManagerContainer!: ElementRef<HTMLDivElement>;

  // Signals
  files = signal<IFileManagerResponse[]>([]);
  selectedFiles = signal<IFileManagerResponse[]>(
    this._data?.selectedFiles || [],
  );
  totalFiles = signal<number>(0);
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  activeTab = signal<number>(0);
  blobLoading = signal<boolean>(false);
  blobConfigured = signal<boolean>(true);
  deleteLoading = signal<boolean>(false);

  // Settings from data
  allowedTypes = signal<string[]>(this._data?.allowedTypes || ['*']);
  maxFiles = signal<number>(this._data?.maxFiles || 1);
  viewMode = signal<'list' | 'grid'>(this._data?.viewMode || 'grid');
  selectionMode = signal<'single' | 'multiple'>(
    this._data?.selectionMode || 'single',
  );
  canSubmit = signal<boolean>(this._data?.canSubmit ?? true);
  group = signal<FileGroup | undefined>(this._data?.group);
  type = signal<FileType | undefined>(this._data?.type);
  allowSubmitEmpty = signal<boolean>(this._data?.allowSubmitEmpty ?? false);

  // Filters
  filterForm = this._fb.group({
    search: [''],
    group: [
      {
        value: this.group()?.toString() || 'all',
        disabled: !!this.group(),
      },
    ],
    type: [
      {
        value: this.type()?.toString() || 'all',
        disabled: !!this.type(),
      },
    ],
    temporary: [false],
  });

  // Pagination
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);

  // Computed
  isMultiple = computed(() => this.selectionMode() === 'multiple');
  hasSelection = computed(
    () => this.allowSubmitEmpty() || this.selectedFiles().length > 0,
  );
  totalPages = computed(() => Math.ceil(this.totalFiles() / this.pageSize()));

  // Enums for template
  fileGroups = Object.keys(FileGroup)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => ({
      label: `fileManager.groups.${FileGroup[Number(key)]}`,
      value: key,
    }));

  fileTypes = Object.keys(FileType)
    .filter((key) => !isNaN(Number(key)))
    .map((key) => ({
      label: `fileManager.types.${FileType[Number(key)]}`,
      value: key,
    }));

  getGroupLabel(group: FileGroup): string {
    return `fileManager.groups.${FileGroup[group]}`;
  }

  getTypeLabel(type: FileType): string {
    return `fileManager.types.${FileType[type]}`;
  }

  Math = Math;

  activeFile = signal<IFileManagerResponse | null>(null);

  ngOnInit(): void {
    this.loadFiles();
    this.loadBlobConfigured();

    this.filterForm.valueChanges.subscribe(() => {
      this.pageIndex.set(1);
      this.loadFiles();
    });
  }

  loadFiles(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const filterValue = this.filterForm.getRawValue();

    const request: IFileManagerListRequest = {
      pageNumber: this.pageIndex(),
      pageSize: this.pageSize(),
      textFilter: filterValue.search || undefined,
      group:
        filterValue.group && filterValue.group !== 'all'
          ? Number(filterValue.group)
          : undefined,
      type:
        filterValue.type && filterValue.type !== 'all'
          ? Number(filterValue.type)
          : undefined,
      temp: filterValue.temporary || undefined,
      sortBy: 'created',
      ascending: false,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._service.getFiles(request, context).subscribe({
      next: (res) => {
        this.files.set(res.items);
        this.totalFiles.set(res.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.loadFiles();
  }

  loadBlobConfigured(): void {
    const tenantId = localStorage.getItem('tenantId');
    if (!tenantId) return;
    this._tenantService.getTenantById(tenantId).subscribe({
      next: (tenant) => this.blobConfigured.set(tenant.blobConfigured ?? false),
      error: () => this.blobConfigured.set(false),
    });
  }

  onFileClick(file: IFileManagerResponse): void {
    if (this.selectionMode() === 'single') {
      this.selectedFiles.set([file]);
      this.activeFile.set(file);
    } else {
      if (this.isSelected(file)) {
        this.selectedFiles.update((curr) =>
          curr.filter((f) => f.id !== file.id),
        );
        if (this.activeFile()?.id === file.id) {
          const remaining = this.selectedFiles();
          this.activeFile.set(
            remaining.length > 0 ? remaining[remaining.length - 1] : null,
          );
        }
      } else {
        if (this.selectedFiles().length < this.maxFiles()) {
          this.selectedFiles.update((curr) => [...curr, file]);
          this.activeFile.set(file);
        }
      }
    }
  }

  isSelected(file: IFileManagerResponse): boolean {
    return this.selectedFiles().some((f) => f.id === file.id);
  }

  onFilesDropped(event: DragEvent): void {
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFiles(input.files);
    }
  }

  uploadFiles(fileList: FileList): void {
    void this.processAndUploadFiles(Array.from(fileList));
  }

  private async processAndUploadFiles(files: File[]): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    const preparedFiles = await this.prepareFilesForUpload(files);
    if (!preparedFiles || preparedFiles.length === 0) {
      this.loading.set(false);
      return;
    }

    let completed = 0;
    let failed = 0;

    preparedFiles.forEach((file) => {
      const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
      this._service
        .uploadFile(file, this.group(), this.type(), context)
        .subscribe({
          next: () => {
            completed++;
            this.checkUploadCompletion(completed, preparedFiles.length, failed);
          },
          error: () => {
            completed++;
            failed++;
            this.checkUploadCompletion(completed, preparedFiles.length, failed);
          },
        });
    });
  }

  private async prepareFilesForUpload(files: File[]): Promise<File[] | null> {
    if (files.length === 0) {
      return [];
    }

    const processedFiles: File[] = [];

    for (const file of files) {
      if (!this.isAudioFile(file)) {
        processedFiles.push(file);
        continue;
      }

      const editedFile = await this.openAudioEditorDialog(file);
      if (!editedFile) {
        return null;
      }

      processedFiles.push(editedFile);
    }

    return processedFiles;
  }

  private isAudioFile(file: File): boolean {
    if (file.type.toLowerCase().startsWith('audio/')) {
      return true;
    }

    const audioExtensions = [
      '.mp3',
      '.wav',
      '.flac',
      '.aac',
      '.ogg',
      '.m4a',
      '.wma',
      '.opus',
    ];

    const lowerName = file.name.toLowerCase();
    return audioExtensions.some((extension) => lowerName.endsWith(extension));
  }

  private async openAudioEditorDialog(file: File): Promise<File | null> {
    const dialogRef = this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'fileManager.audioEditor.title',
      ),
      zDescription: this._translationService.getCachedTranslation(
        'fileManager.audioEditor.description',
      ),
      zContent: AudioEditorDialogComponent,
      zData: { file },
      zHideFooter: true,
      zClosable: true,
      zWidth: '760px',
      zCustomClasses: 'z-dialog-max-width-100',
    });

    const result = await firstValueFrom(dialogRef.afterClosed());

    const typedResult = result as IAudioEditorDialogResult | undefined;
    if (!typedResult?.success || !typedResult.file) {
      return null;
    }

    return typedResult.file;
  }

  checkUploadCompletion(
    completed: number,
    total: number,
    failed: number,
  ): void {
    if (completed === total) {
      this.finishUpload(failed);
    }
  }

  finishUpload(failed: number): void {
    this.loading.set(false);
    if (failed === 0) {
      this.tabGroup.selectTabByIndex(0);
      this.pageIndex.set(1);
      this.loadFiles();
    } else {
      this.errorMessage.set(
        `${failed} file(s) failed to upload. Please try again.`,
      );
    }
  }

  confirmSelection(): void {
    this.stopPreviewAudioPlayback();
    this._dialogRef.close(this.selectedFiles());
  }

  cancel(): void {
    this.stopPreviewAudioPlayback();
    this._dialogRef.close();
  }

  ngOnDestroy(): void {
    this.stopPreviewAudioPlayback();
  }

  deselectAll(): void {
    this.selectedFiles.set([]);
    this.activeFile.set(null);
  }

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getFileIcon(file: IFileManagerResponse): ZardIcon {
    switch (file.type) {
      case FileType.Image:
        return 'file'; // No specific image icon
      case FileType.Video:
        return 'popcorn'; // Using popcorn for video
      case FileType.Music:
        return 'music';
      default:
        return 'file';
    }
  }

  isImage(file: IFileManagerResponse): boolean {
    return (
      file.type === FileType.Image ||
      ['.jpg', '.jpeg', '.png', '.webp'].includes(file.extension?.toLowerCase())
    );
  }

  isMusic(file: IFileManagerResponse): boolean {
    return (
      file.type === FileType.Music ||
      [
        '.mp3',
        '.wav',
        '.flac',
        '.aac',
        '.ogg',
        '.m4a',
        '.wma',
        '.opus',
      ].includes(file.extension?.toLowerCase() || '')
    );
  }

  getPreviewUrl(file: IFileManagerResponse): string | null {
    return file.externalUrl || file.url || null;
  }

  onTabChange(event: { index: number }): void {
    this.activeTab.set(event.index);
  }

  uploadToBlob(file: IFileManagerResponse): void {
    this.blobLoading.set(true);
    this.errorMessage.set(null);
    this._service.uploadToBlob(file.id).subscribe({
      next: (updated) => {
        this.blobLoading.set(false);
        this.activeFile.set(updated);
        this.files.update((list) =>
          list.map((f) => (f.id === updated.id ? updated : f)),
        );
        this.selectedFiles.update((list) =>
          list.map((f) => (f.id === updated.id ? updated : f)),
        );
      },
      error: (err) => {
        this.blobLoading.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  removeFromBlob(file: IFileManagerResponse): void {
    this.blobLoading.set(true);
    this.errorMessage.set(null);
    this._service.removeFromBlob(file.id).subscribe({
      next: (updated) => {
        this.blobLoading.set(false);
        this.activeFile.set(updated);
        this.files.update((list) =>
          list.map((f) => (f.id === updated.id ? updated : f)),
        );
        this.selectedFiles.update((list) =>
          list.map((f) => (f.id === updated.id ? updated : f)),
        );
      },
      error: (err) => {
        this.blobLoading.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  removeFile(file: IFileManagerResponse): void {
    this.deleteLoading.set(true);
    this.errorMessage.set(null);

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._service.deleteFile(file.id, context).subscribe({
      next: () => {
        this.deleteLoading.set(false);

        const updatedSelection = this.selectedFiles().filter(
          (selectedFile) => selectedFile.id !== file.id,
        );

        this.selectedFiles.set(updatedSelection);
        this.activeFile.set(
          updatedSelection.length > 0
            ? updatedSelection[updatedSelection.length - 1]
            : null,
        );

        if (this.files().length === 1 && this.pageIndex() > 1) {
          this.pageIndex.update((page) => page - 1);
        }

        this.loadFiles();
      },
      error: (err) => {
        this.deleteLoading.set(false);
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  openExternalUrl(url: string | null | undefined): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  private stopPreviewAudioPlayback(): void {
    const container = this.fileManagerContainer?.nativeElement;
    if (!container) {
      return;
    }

    const audioElements = container.querySelectorAll('audio');
    audioElements.forEach((audioElement) => {
      audioElement.pause();
      audioElement.currentTime = 0;
    });
  }
}
