import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { TranslatePipe, TranslationService } from '@ihsan/core';
import {
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardDialogService,
  ZardIconComponent,
  ZardSheetRef,
  Z_SHEET_DATA,
} from '@ihsan/ui';
import { CommonModule } from '@angular/common';
import {
  SearchIndexStatus,
  SongModel,
  SongState,
  SongService,
  UpdateSongCommand,
} from '@web-app/nasheed-shared';
import WaveSurfer from 'wavesurfer.js';
import { extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';
import { AddEditSongDialogComponent } from '../add-edit-song-dialog/add-edit-song-dialog.component';
import { toast } from 'ngx-sonner';

interface LrcLine {
  time: number;
  text: string;
}

@Component({
  selector: 'app-view-song-sheet',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardIconComponent,
  ],
  templateUrl: './view-song-sheet.component.html',
  styleUrl: './view-song-sheet.component.scss',
})
export class ViewSongSheetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('waveformContainer')
  private _waveformContainer?: ElementRef<HTMLDivElement>;

  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _translationService = inject(TranslationService);
  private readonly _songService = inject(SongService);

  readonly data = inject<{ song: SongModel }>(Z_SHEET_DATA);
  readonly SongState = SongState;
  readonly SearchIndexStatus = SearchIndexStatus;

  readonly isPlayerReady = signal(false);
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly activeLyricIndex = signal(-1);
  readonly editableLyricsLrc = signal(this.getInitialVerifiedLrcValue());
  readonly savedLyricsLrc = signal(this.getInitialVerifiedLrcValue());
  readonly editableLyricsPlainText = signal(this.getInitialPlainTextValue());
  readonly savedLyricsPlainText = signal(this.getInitialPlainTextValue());
  readonly isSavingLyrics = signal(false);

  private _waveSurfer: WaveSurfer | null = null;
  private _seekHoldTimer: ReturnType<typeof setInterval> | null = null;
  private _seekHoldDelayTimer: ReturnType<typeof setTimeout> | null = null;
  private _suppressSeekClick = false;

  readonly parsedLrcLines = computed(() =>
    this.parseLrcLines(this.editableLyricsLrc()),
  );

  readonly hasTimedLyrics = computed(() => this.parsedLrcLines().length > 0);
  readonly lyricsDirty = computed(
    () => this.editableLyricsLrc().trim() !== this.savedLyricsLrc().trim(),
  );
  readonly lyricsPlainTextDirty = computed(
    () =>
      this.editableLyricsPlainText().trim() !==
      this.savedLyricsPlainText().trim(),
  );
  readonly hasPendingChanges = computed(
    () => this.lyricsDirty() || this.lyricsPlainTextDirty(),
  );
  readonly lyricsRawForView = computed(() =>
    this.toMultilineText(this.song.lyricsRaw),
  );
  readonly lyricsPlainTextForView = computed(() =>
    this.editableLyricsPlainText(),
  );

  readonly activeLyricLine = computed(() => {
    const index = this.activeLyricIndex();
    const lines = this.parsedLrcLines();
    return index >= 0 && index < lines.length ? lines[index].text : '';
  });

  readonly nextLyricLine = computed(() => {
    const nextIndex = this.activeLyricIndex() + 1;
    const lines = this.parsedLrcLines();
    return nextIndex >= 0 && nextIndex < lines.length
      ? lines[nextIndex].text
      : '';
  });

  get song(): SongModel {
    return this.data.song;
  }

  get songLyrics(): 'ltr' | 'rtl' {
    return this.song.languageCode === 'ar' ? 'rtl' : 'ltr';
  }

  ngAfterViewInit(): void {
    this.initializeWaveSurfer();
  }

  ngOnDestroy(): void {
    this.clearSeekHoldDelay();
    this.stopSeekHold();
    this.destroyWaveSurfer();
  }

  getSongStateBadgeType(
    state: SongState,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (state) {
      case SongState.Done:
        return 'default';
      case SongState.Failed:
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  onEdit(): void {
    this._sheetRef.close();
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        '#anashid#.songs.dialog.editTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#anashid#.songs.dialog.editDescription',
      ),
      zContent: AddEditSongDialogComponent,
      zData: { song: this.song },
      zWidth: '650px',
      zHideFooter: true,
    });
  }

  onClose(): void {
    this._sheetRef.close();
  }

  togglePlayPause(): void {
    if (!this._waveSurfer) {
      return;
    }

    if (this._waveSurfer.isPlaying()) {
      this._waveSurfer.pause();
      return;
    }

    void this._waveSurfer.play();
  }

  seekBackwardFiveSeconds(): void {
    if (this.consumeSeekClickSuppression()) {
      return;
    }

    this.seekBy(-5);
  }

  seekForwardFiveSeconds(): void {
    if (this.consumeSeekClickSuppression()) {
      return;
    }

    this.seekBy(5);
  }

  scheduleSeekHold(direction: 'backward' | 'forward'): void {
    if (!this.isPlayerReady()) {
      return;
    }

    this.clearSeekHoldDelay();
    this.stopSeekHold();

    this._seekHoldDelayTimer = setTimeout(() => {
      this.startSeekHold(direction);
    }, 200);
  }

  startSeekHold(direction: 'backward' | 'forward'): void {
    const offset = direction === 'backward' ? -5 : 5;
    this.stopSeekHold();
    this._suppressSeekClick = true;
    this.seekBy(offset);

    this._seekHoldTimer = setInterval(() => {
      this.seekBy(offset);
    }, 300);
  }

  releaseSeekHold(): void {
    this.clearSeekHoldDelay();
    this.stopSeekHold();
  }

  onLyricsLrcInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    this.editableLyricsLrc.set(target?.value ?? '');
    this.updateActiveLyric(this.currentTime());
  }

  formatLrcLyrics(): void {
    this.editableLyricsLrc.set(this.normalizeLrcText(this.editableLyricsLrc()));
    this.updateActiveLyric(this.currentTime());
  }

  copyLyricsRawToVerifiedLrc(): void {
    this.editableLyricsLrc.set(this.toMultilineText(this.song.lyricsRaw));
    this.updateActiveLyric(this.currentTime());
  }

  fillPlainTextFromVerifiedLyrics(): void {
    const verifiedLyrics = this.editableLyricsLrc().trim();
    if (!verifiedLyrics || this.isSavingLyrics()) {
      return;
    }

    const plainText = this.removeTimingMarkersFromLyrics(verifiedLyrics);
    this.editableLyricsPlainText.set(plainText);
  }

  saveAllChanges(): void {
    if (this.isSavingLyrics() || !this.hasPendingChanges()) {
      return;
    }

    this.isSavingLyrics.set(true);

    const normalizedLyrics = this.normalizeLrcText(this.editableLyricsLrc());
    const encodedLyrics = this.encodeLyricsForBackend(normalizedLyrics);
    const encodedPlainText = this.encodeLyricsForBackend(
      this.editableLyricsPlainText(),
    );
    const command = this.buildFullSongUpdateCommand({
      lyricsVerifiedLrc: encodedLyrics,
      lyricsPlainText: encodedPlainText,
    });
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._songService.update(this.song.id, command, { context }).subscribe({
      next: (updatedSong) => {
        const savedLyrics = this.toMultilineText(updatedSong.lyricsVerifiedLrc);
        const savedPlainText = this.toMultilineText(
          updatedSong.lyricsPlainText,
        );
        this.editableLyricsLrc.set(savedLyrics);
        this.savedLyricsLrc.set(savedLyrics);
        this.editableLyricsPlainText.set(savedPlainText);
        this.savedLyricsPlainText.set(savedPlainText);
        Object.assign(this.data.song, updatedSong);
        toast.success(
          this._translationService.getCachedTranslation(
            '#anashid#.songs.sheet.changesSaved',
          ),
        );
        this.isSavingLyrics.set(false);
        this.updateActiveLyric(this.currentTime());
      },
      error: (error) => {
        toast.error(extractErrorMessage(error));
        this.isSavingLyrics.set(false);
      },
    });
  }

  private buildFullSongUpdateCommand(overrides?: {
    lyricsVerifiedLrc?: string;
    lyricsPlainText?: string;
  }): UpdateSongCommand {
    return {
      id: this.song.id,
      title: this.song.title,
      artistId:
        this.song.artistId === null ? null : (this.song.artistId ?? undefined),
      fileId: this.song.fileId,
      durationSeconds: this.song.durationSeconds,
      languageCode: this.song.languageCode,
      lyricsRaw: this.song.lyricsRaw,
      lyricsVerifiedLrc:
        overrides?.lyricsVerifiedLrc ?? this.song.lyricsVerifiedLrc,
      lyricsPlainText: overrides?.lyricsPlainText ?? this.song.lyricsPlainText,
      summary: this.song.summary,
      vocalStyle: this.song.vocalStyle,
      publishedAt: this.song.publishedAt,
      moodTags: this.song.moodTags,
      copyrightRiskLevel: this.song.legalCompliance?.copyrightRiskLevel,
      contentSafetyFlag: this.song.legalCompliance?.contentSafetyFlag,
      riskReason: this.song.legalCompliance?.riskReason,
      status: this.song.status,
    };
  }

  private removeTimingMarkersFromLyrics(value: string): string {
    const timestampPattern = /\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g;

    return value
      .split('\n')
      .map((line) =>
        line.replace(timestampPattern, '').replace(/\s+/g, ' ').trim(),
      )
      .filter((line) => line.length > 0)
      .join('\n');
  }

  private encodeLyricsForBackend(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    return trimmed.replace(/\r?\n/g, '\\n');
  }

  stopSeekHold(): void {
    if (!this._seekHoldTimer) {
      return;
    }

    clearInterval(this._seekHoldTimer);
    this._seekHoldTimer = null;
  }

  formatLyrics(text: string | undefined): string {
    if (!text) return '';
    return text.replace(/\\n/g, '\n');
  }

  formatLyricsLines(text: string | undefined): string[] {
    if (!text) return [];
    return text
      .replace(/\\n/g, '\n')
      .split('\n')
      .filter((line) => line.trim() !== '');
  }

  parseLrcLine(line: string): { timestamp: string | null; text: string } {
    const match = line.match(/^(\[\d{2}:\d{2}(?:\.\d{2,3})?\])(.*)$/);
    if (match) {
      return { timestamp: match[1], text: match[2].trim() };
    }
    return { timestamp: null, text: line.trim() };
  }

  getAudioPlaybackLabel(): string {
    return this.isPlaying()
      ? this._translationService.getCachedTranslation(
          '#anashid#.songs.sheet.pause',
        )
      : this._translationService.getCachedTranslation(
          '#anashid#.songs.sheet.play',
        );
  }

  formatPlayerTime(value: number): string {
    if (!Number.isFinite(value) || value < 0) {
      return '00:00';
    }

    const minutes = Math.floor(value / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  getSearchIndexStatusBadgeType(
    status: SearchIndexStatus,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case SearchIndexStatus.Indexed:
        return 'default';
      case SearchIndexStatus.Failed:
        return 'destructive';
      case SearchIndexStatus.Indexing:
        return 'secondary';
      default:
        return 'outline';
    }
  }

  private initializeWaveSurfer(): void {
    const audioUrl = this.song.file?.externalUrl ?? this.song.file?.url;
    const container = this._waveformContainer?.nativeElement;
    if (!audioUrl || !container) {
      return;
    }

    this.destroyWaveSurfer();

    this._waveSurfer = WaveSurfer.create({
      container,
      height: 92,
      waveColor: '#9ca3af',
      progressColor: '#1d4ed8',
      cursorColor: '#1e293b',
      barWidth: 2,
      barGap: 2,
      barRadius: 6,
      normalize: true,
      url: audioUrl,
    });

    this._waveSurfer.on('ready', () => {
      if (!this._waveSurfer) {
        return;
      }

      this.duration.set(this._waveSurfer.getDuration());
      this.isPlayerReady.set(true);
    });

    this._waveSurfer.on('play', () => {
      this.isPlaying.set(true);
      this.updateActiveLyric(this.currentTime());
    });

    this._waveSurfer.on('pause', () => {
      this.isPlaying.set(false);
    });

    this._waveSurfer.on('finish', () => {
      this.isPlaying.set(false);
      this.currentTime.set(this.duration());
      this.updateActiveLyric(this.duration());
    });

    this._waveSurfer.on('timeupdate', (seconds: number) => {
      this.currentTime.set(seconds);
      this.updateActiveLyric(seconds);
    });
  }

  private destroyWaveSurfer(): void {
    this._waveSurfer?.destroy();
    this._waveSurfer = null;
    this.isPlayerReady.set(false);
    this.isPlaying.set(false);
    this.currentTime.set(0);
    this.duration.set(0);
    this.activeLyricIndex.set(-1);
  }

  private seekBy(offsetSeconds: number): void {
    if (!this._waveSurfer || !this.isPlayerReady()) {
      return;
    }

    const totalDuration = this._waveSurfer.getDuration();
    const nextTime = Math.min(
      Math.max(this.currentTime() + offsetSeconds, 0),
      totalDuration,
    );

    this._waveSurfer.setTime(nextTime);
    this.currentTime.set(nextTime);
    this.updateActiveLyric(nextTime);
  }

  private clearSeekHoldDelay(): void {
    if (!this._seekHoldDelayTimer) {
      return;
    }

    clearTimeout(this._seekHoldDelayTimer);
    this._seekHoldDelayTimer = null;
  }

  private consumeSeekClickSuppression(): boolean {
    if (!this._suppressSeekClick) {
      return false;
    }

    this._suppressSeekClick = false;
    return true;
  }

  private getInitialVerifiedLrcValue(): string {
    return this.toMultilineText(this.song.lyricsVerifiedLrc);
  }

  private getInitialPlainTextValue(): string {
    return this.toMultilineText(this.song.lyricsPlainText);
  }

  private toMultilineText(value: string | undefined): string {
    return (value ?? '').replace(/\\n/g, '\n');
  }

  private normalizeLrcText(text: string): string {
    const normalized = text.replace(/\\n/g, '\n').trim();
    if (!normalized) {
      return '';
    }

    const timestampPattern = /\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g;
    const matches = [...normalized.matchAll(timestampPattern)];
    if (!matches.length) {
      return normalized
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');
    }

    const lines: string[] = [];
    for (let index = 0; index < matches.length; index++) {
      const current = matches[index];
      const currentStart = current.index ?? 0;
      const currentEnd = currentStart + current[0].length;
      const nextStart = matches[index + 1]?.index ?? normalized.length;

      const lyricText = normalized
        .slice(currentEnd, nextStart)
        .replace(/\s+/g, ' ')
        .trim();

      lines.push(lyricText ? `${current[0]} ${lyricText}` : current[0]);
    }

    return lines.join('\n');
  }

  private parseLrcLines(text: string | undefined): LrcLine[] {
    if (!text) {
      return [];
    }

    const normalizedText = text.replace(/\\n/g, '\n');
    const rows = normalizedText.split('\n');
    const parsed: LrcLine[] = [];

    for (const rawRow of rows) {
      const row = rawRow.trim();
      if (!row) {
        continue;
      }

      const timeMatches = [
        ...row.matchAll(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g),
      ];
      if (!timeMatches.length) {
        continue;
      }

      const lyricText = row
        .replace(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g, '')
        .trim();

      for (const match of timeMatches) {
        const minutes = Number.parseInt(match[1], 10);
        const seconds = Number.parseInt(match[2], 10);
        const milliseconds = Number.parseInt(
          (match[3] ?? '0').padEnd(3, '0').slice(0, 3),
          10,
        );

        parsed.push({
          time: minutes * 60 + seconds + milliseconds / 1000,
          text: lyricText,
        });
      }
    }

    return parsed.sort((a, b) => a.time - b.time);
  }

  private updateActiveLyric(seconds: number): void {
    const lines = this.parsedLrcLines();
    if (!lines.length) {
      return;
    }

    let activeIndex = -1;
    for (let index = 0; index < lines.length; index++) {
      if (seconds >= lines[index].time) {
        activeIndex = index;
      } else {
        break;
      }
    }

    this.activeLyricIndex.set(activeIndex);
  }
}
