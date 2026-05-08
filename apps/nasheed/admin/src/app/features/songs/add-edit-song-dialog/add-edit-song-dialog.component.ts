import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpContext } from '@angular/common/http';
import { forkJoin, of, switchMap, map } from 'rxjs';
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
  summary: FormControl<string | null>;
  vocalStyle: FormControl<string | null>;
  moodTags: FormControl<string | null>;
  publishedAt: FormControl<string | null>;
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
  private static readonly NO_ARTIST_VALUE = 'none';
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
      this.data?.song?.artistId?.toString() ??
        AddEditSongDialogComponent.NO_ARTIST_VALUE,
      {
        nonNullable: true,
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
    summary: new FormControl<string | null>(this.data?.song?.summary ?? null),
    vocalStyle: new FormControl<string | null>(
      this.data?.song?.vocalStyle ?? null,
    ),
    moodTags: new FormControl<string | null>(
      this.data?.song?.moodTags?.length
        ? this.data.song.moodTags.join(', ')
        : null,
    ),
    publishedAt: new FormControl<string | null>(
      this.getLocalDateTimeValue(this.data?.song?.publishedAt),
    ),
    durationSeconds: new FormControl<number | null>(
      this.data?.song?.durationSeconds ?? null,
    ),
  });

  existingFiles: IFileManagerResponse[] = [];

  constructor() {
    this._artistService
      .getAll({ pageNumber: 1, pageSize: 100 })
      .pipe(
        switchMap((first) => {
          if (first.totalPages <= 1) return of(first.items);
          return forkJoin(
            Array.from({ length: first.totalPages - 1 }, (_, i) =>
              this._artistService.getAll({ pageNumber: i + 2, pageSize: 100 }),
            ),
          ).pipe(
            map((pages) => [...first.items, ...pages.flatMap((p) => p.items)]),
          );
        }),
      )
      .subscribe({ next: (items) => this.artists.set(items) });

    if (this.data?.song?.file) {
      this.existingFiles = [this.data.song.file];
    }
  }

  onAudioSelected(files: IFileManagerResponse[]): void {
    this.form.controls.fileId.setValue(files[0]?.id ?? null);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    const parsedArtistId = this.parseArtistId(
      this.form.controls.artistId.value,
    );

    if (this.isEditMode && this.data.song) {
      const cmd: UpdateSongCommand = {
        id: this.data.song.id,
        title: this.form.controls.title.value,
        artistId: parsedArtistId,
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
        summary: this.toOptionalTrimmed(this.form.controls.summary.value),
        vocalStyle: this.toOptionalTrimmed(this.form.controls.vocalStyle.value),
        moodTags: this.parseMoodTags(this.form.controls.moodTags.value),
        publishedAt: this.toApiDateTime(this.form.controls.publishedAt.value),
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
        artistId: parsedArtistId,
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
        summary: this.toOptionalTrimmed(this.form.controls.summary.value),
        vocalStyle: this.toOptionalTrimmed(this.form.controls.vocalStyle.value),
        moodTags: this.parseMoodTags(this.form.controls.moodTags.value),
        publishedAt: this.toApiDateTime(this.form.controls.publishedAt.value),
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

  private parseArtistId(value: string): number | undefined {
    if (value === AddEditSongDialogComponent.NO_ARTIST_VALUE) {
      return undefined;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue > 0
      ? parsedValue
      : undefined;
  }

  private toOptionalTrimmed(
    value: string | null | undefined,
  ): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private parseMoodTags(
    value: string | null | undefined,
  ): string[] | undefined {
    const normalizedValue = this.toOptionalTrimmed(value);
    if (!normalizedValue) {
      return undefined;
    }

    const parsedTags = normalizedValue
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    return parsedTags.length > 0 ? parsedTags : undefined;
  }

  private toApiDateTime(value: string | null | undefined): string | undefined {
    const normalizedValue = this.toOptionalTrimmed(value);
    if (!normalizedValue) {
      return undefined;
    }

    const parsed = new Date(normalizedValue);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }

  private getLocalDateTimeValue(
    value: string | null | undefined,
  ): string | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    const year = parsed.getFullYear();
    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const day = `${parsed.getDate()}`.padStart(2, '0');
    const hours = `${parsed.getHours()}`.padStart(2, '0');
    const minutes = `${parsed.getMinutes()}`.padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
