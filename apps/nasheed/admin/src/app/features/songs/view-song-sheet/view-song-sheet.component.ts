import { Component, inject } from '@angular/core';
import { RtlService, TranslatePipe, TranslationService } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardBadgeComponent,
  ZardIconComponent,
  ZardSheetRef,
  Z_SHEET_DATA,
  ZardDialogService,
} from '@ihsan/ui';
import {
  SongModel,
  SongState,
  SearchIndexStatus,
} from '@web-app/nasheed-shared';
import { AddEditSongDialogComponent } from '../add-edit-song-dialog/add-edit-song-dialog.component';
import { CommonModule } from '@angular/common';

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
export class ViewSongSheetComponent {
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _translationService = inject(TranslationService);

  readonly data = inject<{ song: SongModel }>(Z_SHEET_DATA);

  get song(): SongModel {
    return this.data.song;
  }

  get songLyrics(): 'ltr' | 'rtl' {
    return this.song.languageCode === 'ar' ? 'rtl' : 'ltr';
  }

  readonly SongState = SongState;
  readonly SearchIndexStatus = SearchIndexStatus;

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
    const match = line.match(/^(\[\d{2}:\d{2}\.\d{2,3}\])(.*)$/);
    if (match) {
      return { timestamp: match[1], text: match[2].trim() };
    }
    return { timestamp: null, text: line.trim() };
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
}
