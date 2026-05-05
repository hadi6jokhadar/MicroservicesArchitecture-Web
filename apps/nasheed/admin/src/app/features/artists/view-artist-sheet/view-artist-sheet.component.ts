import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslationService } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardBadgeComponent,
  ZardIconComponent,
  ZardSheetRef,
  Z_SHEET_DATA,
  ZardDialogService,
} from '@ihsan/ui';
import { ArtistEventsService, ArtistModel } from '@web-app/nasheed-shared';
import { AddEditArtistDialogComponent } from '../add-edit-artist-dialog/add-edit-artist-dialog.component';

@Component({
  selector: 'app-view-artist-sheet',
  standalone: true,
  imports: [
    TranslatePipe,
    ZardButtonComponent,
    ZardBadgeComponent,
    ZardIconComponent,
  ],
  templateUrl: './view-artist-sheet.component.html',
  styleUrl: './view-artist-sheet.component.scss',
})
export class ViewArtistSheetComponent {
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _eventsService = inject(ArtistEventsService);
  private readonly _translationService = inject(TranslationService);

  readonly data = inject<{ artist: ArtistModel }>(Z_SHEET_DATA);

  get artist(): ArtistModel {
    return this.data.artist;
  }

  onEdit(): void {
    this._sheetRef.close();
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation('#anashid#.artists.dialog.editTitle'),
        zDescription: this._translationService.getCachedTranslation('#anashid#.artists.dialog.editDescription'),
        zContent: AddEditArtistDialogComponent,
        zData: { artist: this.artist },
        zWidth: '550px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) this._eventsService.notifyDataChanged();
      });
  }

  onClose(): void {
    this._sheetRef.close();
  }
}
