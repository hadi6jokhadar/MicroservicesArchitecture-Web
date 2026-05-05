import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardIconComponent,
  ZardSheetRef,
  Z_SHEET_DATA,
} from '@ihsan/ui';
import { SongModel } from '@web-app/nasheed-shared';

@Component({
  selector: 'app-similar-songs-sheet',
  standalone: true,
  imports: [TranslatePipe, ZardButtonComponent, ZardIconComponent],
  templateUrl: './similar-songs-sheet.component.html',
  styleUrl: './similar-songs-sheet.component.scss',
})
export class SimilarSongsSheetComponent {
  private readonly _sheetRef = inject(ZardSheetRef);

  readonly data = inject<{ song: SongModel; similarSongs: SongModel[] }>(
    Z_SHEET_DATA,
  );

  get song(): SongModel {
    return this.data.song;
  }

  get similarSongs(): SongModel[] {
    return this.data.similarSongs;
  }

  onClose(): void {
    this._sheetRef.close();
  }
}
