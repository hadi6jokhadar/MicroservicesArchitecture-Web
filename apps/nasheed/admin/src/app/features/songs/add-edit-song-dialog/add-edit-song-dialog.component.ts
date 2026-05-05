import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
  ZardSelectComponent,
  ZardSelectItemComponent,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import {
  extractErrorMessage,
  SKIP_ERROR_TOAST,
  FileSelectorComponent,
} from '@ihsan/shared';
import {
  FileType,
  FileGroup,
  IFileManagerResponse,
  TranslationService,
} from '@ihsan/core';
import {
  SongService,
  ArtistService,
  SongModel,
  ArtistModel,
  CreateSongCommand,
  UpdateSongCommand,
  PaginatedList,
} from '@web-app/nasheed-shared';

interface ISongForm {
  title: FormControl<string>;
  artistId: FormControl<string>;
  fileId: FormControl<number | null>;
  copyrightRiskLevel: FormControl<string>;
  contentSafetyFlag: FormControl<string>;
  riskReason: FormControl<string | null>;
  languageCode: FormControl<string | null>;
  lyricsRaw: FormControl<string | null>;
  lyricsVerifiedLrc: FormControl<string | null>;
  lyricsPlainText: FormControl<string | null>;
  durationSeconds: FormControl<number | null>;
}

@Component({
  selector: 'app-add-edit-song-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardIdDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    FileSelectorComponent,
  ],
  templateUrl: './add-edit-song-dialog.component.html',
  styleUrl: './add-edit-song-dialog.component.scss',
})
export class AddEditSongDialogComponent {
  private readonly _songService = inject(SongService);
  private readonly _artistService = inject(ArtistService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);

  readonly data = inject<{ song: SongModel | null }>(Z_MODAL_DATA);

  readonly isEditMode = !!this.data?.song;
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly artists = signal<ArtistModel[]>([]);

  readonly FileType = FileType;
  readonly FileGroup = FileGroup;
  readonly copyrightRiskLevels = [
    { value: 'low', label: '#anashid#.songs.legal.riskLevels.low' },
    { value: 'medium', label: '#anashid#.songs.legal.riskLevels.medium' },
    { value: 'high', label: '#anashid#.songs.legal.riskLevels.high' },
  ];

  readonly contentSafetyFlags = [
    { value: 'safe', label: '#anashid#.songs.legal.safetyFlags.safe' },
    { value: 'flagged', label: '#anashid#.songs.legal.safetyFlags.flagged' },
  ];

  readonly form = new FormGroup<ISongForm>({
    title: new FormControl<string>(this.data?.song?.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(300)],
    }),
    artistId: new FormControl<string>(
      this.data?.song?.artistId?.toString() ?? '',
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    fileId: new FormControl<number | null>(this.data?.song?.fileId ?? null),
    copyrightRiskLevel: new FormControl<string>(
      this.data?.song?.legalCompliance?.copyrightRiskLevel ?? 'all',
      {
        nonNullable: true,
      },
    ),
    contentSafetyFlag: new FormControl<string>(
      this.data?.song?.legalCompliance?.contentSafetyFlag ?? 'all',
      {
        nonNullable: true,
      },
    ),
    riskReason: new FormControl<string | null>(
      this.data?.song?.legalCompliance?.riskReason ?? null,
    ),
    languageCode: new FormControl<string | null>(
      this.data?.song?.languageCode ?? null,
    ),
    lyricsRaw: new FormControl<string | null>(
      this.data?.song?.lyricsRaw ?? null,
    ),
    lyricsVerifiedLrc: new FormControl<string | null>(
      this.data?.song?.lyricsVerifiedLrc ?? null,
    ),
    lyricsPlainText: new FormControl<string | null>(
      this.data?.song?.lyricsPlainText ?? null,
    ),
    durationSeconds: new FormControl<number | null>(
      this.data?.song?.durationSeconds ?? null,
    ),
  });

  constructor() {
    this._artistService.getAll({ pageNumber: 1, pageSize: 1000 }).subscribe({
      next: (response: PaginatedList<ArtistModel>) =>
        this.artists.set(response.items),
    });
  }

  onAudioSelected(files: IFileManagerResponse[]): void {
    this.form.controls.fileId.setValue(files[0]?.id ?? null);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    if (this.isEditMode && this.data.song) {
      const cmd: UpdateSongCommand = {
        title: this.form.controls.title.value,
        artistId: Number(this.form.controls.artistId.value),
        fileId: this.form.controls.fileId.value ?? undefined,
        copyrightRiskLevel:
          this.form.controls.copyrightRiskLevel.value !== 'all'
            ? this.form.controls.copyrightRiskLevel.value
            : undefined,
        contentSafetyFlag:
          this.form.controls.contentSafetyFlag.value !== 'all'
            ? this.form.controls.contentSafetyFlag.value
            : undefined,
        riskReason: this.form.controls.riskReason.value ?? undefined,
        languageCode: this.form.controls.languageCode.value ?? undefined,
        lyricsRaw: this.form.controls.lyricsRaw.value ?? undefined,
        lyricsVerifiedLrc:
          this.form.controls.lyricsVerifiedLrc.value ?? undefined,
        lyricsPlainText: this.form.controls.lyricsPlainText.value ?? undefined,
        durationSeconds: this.form.controls.durationSeconds.value ?? undefined,
      };
      this._songService.update(this.data.song.id, cmd, { context }).subscribe({
        next: () => {
          toast.success(
            this._translationService.getCachedTranslation(
              '#anashid#.songs.messages.updated',
            ),
          );
          this._dialogRef.close({ success: true });
        },
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err));
          this.isLoading.set(false);
        },
      });
    } else {
      const cmd: CreateSongCommand = {
        title: this.form.controls.title.value,
        artistId: Number(this.form.controls.artistId.value),
        fileId: this.form.controls.fileId.value ?? undefined,
        copyrightRiskLevel:
          this.form.controls.copyrightRiskLevel.value !== 'all'
            ? this.form.controls.copyrightRiskLevel.value
            : undefined,
        contentSafetyFlag:
          this.form.controls.contentSafetyFlag.value !== 'all'
            ? this.form.controls.contentSafetyFlag.value
            : undefined,
        riskReason: this.form.controls.riskReason.value ?? undefined,
        languageCode: this.form.controls.languageCode.value ?? undefined,
        lyricsRaw: this.form.controls.lyricsRaw.value ?? undefined,
        lyricsVerifiedLrc:
          this.form.controls.lyricsVerifiedLrc.value ?? undefined,
        lyricsPlainText: this.form.controls.lyricsPlainText.value ?? undefined,
        durationSeconds: this.form.controls.durationSeconds.value ?? undefined,
      };
      this._songService.create(cmd, { context }).subscribe({
        next: () => {
          toast.success(
            this._translationService.getCachedTranslation(
              '#anashid#.songs.messages.created',
            ),
          );
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
