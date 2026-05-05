import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpContext } from '@angular/common/http';
import { TranslatePipe } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardFormImports,
  ZardInputDirective,
  ZardAlertComponent,
  ZardDialogRef,
  Z_MODAL_DATA,
  ZardIdDirective,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { extractErrorMessage, SKIP_ERROR_TOAST, FileSelectorComponent } from '@ihsan/shared';
import { FileType, FileGroup, IFileManagerResponse, TranslationService } from '@ihsan/core';
import { ArtistService, ArtistEventsService, ArtistModel, CreateArtistCommand, UpdateArtistCommand } from '@web-app/nasheed-shared';

interface IArtistForm {
  name: FormControl<string>;
  imageFileId: FormControl<number | null>;
}

@Component({
  selector: 'app-add-edit-artist-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardIdDirective,
    FileSelectorComponent,
  ],
  templateUrl: './add-edit-artist-dialog.component.html',
  styleUrl: './add-edit-artist-dialog.component.scss',
})
export class AddEditArtistDialogComponent {
  private readonly _artistService = inject(ArtistService);
  private readonly _eventsService = inject(ArtistEventsService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);

  readonly data = inject<{ artist: ArtistModel | null }>(Z_MODAL_DATA);

  readonly isEditMode = !!this.data?.artist;
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly FileType = FileType;
  readonly FileGroup = FileGroup;

  readonly form = new FormGroup<IArtistForm>({
    name: new FormControl<string>(this.data?.artist?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    imageFileId: new FormControl<number | null>(this.data?.artist?.imageFileId ?? null),
  });

  onImageSelected(files: IFileManagerResponse[]): void {
    this.form.controls.imageFileId.setValue(files[0]?.id ?? null);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    if (this.isEditMode && this.data.artist) {
      const cmd: UpdateArtistCommand = {
        name: this.form.controls.name.value,
        imageFileId: this.form.controls.imageFileId.value ?? undefined,
      };
      this._artistService.update(this.data.artist.id, cmd, { context }).subscribe({
        next: () => {
          toast.success(this._translationService.getCachedTranslation('#anashid#.artists.messages.updated'));
          this._eventsService.notifyDataChanged();
          this._dialogRef.close({ success: true });
        },
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err));
          this.isLoading.set(false);
        },
      });
    } else {
      const cmd: CreateArtistCommand = {
        name: this.form.controls.name.value,
        imageFileId: this.form.controls.imageFileId.value ?? undefined,
      };
      this._artistService.create(cmd, { context }).subscribe({
        next: () => {
          toast.success(this._translationService.getCachedTranslation('#anashid#.artists.messages.created'));
          this._eventsService.notifyDataChanged();
          this._dialogRef.close({ success: true });
        },
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err));
          this.isLoading.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
