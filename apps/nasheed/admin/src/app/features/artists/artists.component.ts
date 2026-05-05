import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslationService, RtlService } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardCardComponent,
  ZardFormImports,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardEmptyComponent,
  ZardTableComponent,
  ZardTableHeaderComponent,
  ZardTableBodyComponent,
  ZardTableRowComponent,
  ZardTableHeadComponent,
  ZardTableCellComponent,
  ZardDialogService,
  ZardAlertDialogService,
  ZardBadgeComponent,
  ZardDropdownImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardSheetService,
  ZardPaginationImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import {
  ArtistService,
  ArtistEventsService,
  ArtistModel,
  IArtistQuery,
  PaginatedList,
} from '@web-app/nasheed-shared';
import { AddEditArtistDialogComponent } from './add-edit-artist-dialog/add-edit-artist-dialog.component';
import { ViewArtistSheetComponent } from './view-artist-sheet/view-artist-sheet.component';

interface IArtistFilterForm {
  searchTerm: FormControl<string>;
}

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardCardComponent,
    ...ZardFormImports,
    ZardInputDirective,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardBadgeComponent,
    ZardIconComponent,
    ZardIdDirective,
    ...ZardDropdownImports,
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableRowComponent,
    ZardTableHeadComponent,
    ZardTableCellComponent,
    ...ZardPaginationImports,
  ],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.scss',
})
export class ArtistsComponent {
  private readonly _artistService = inject(ArtistService);
  private readonly _artistEventsService = inject(ArtistEventsService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _rtlService = inject(RtlService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _translationService = inject(TranslationService);

  readonly data = signal<ArtistModel[]>([]);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  readonly filterForm = new FormGroup<IArtistFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
  });

  constructor() {
    this.loadData();

    this.filterForm.controls.searchTerm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadData();
      });

    this._artistEventsService.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadData());
  }

  loadData(): void {
    this.isLoading.set(true);
    const query: IArtistQuery = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      searchTerm: this.filterForm.controls.searchTerm.value || undefined,
    };

    this._artistService.getAll(query).subscribe({
      next: (response: PaginatedList<ArtistModel>) => {
        this.data.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadData();
  }

  onAddArtist(): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          '#anashid#.artists.dialog.addTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          '#anashid#.artists.dialog.addDescription',
        ),
        zContent: AddEditArtistDialogComponent,
        zData: null,
        zWidth: '550px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) this.loadData();
      });
  }

  onEditArtist(artist: ArtistModel): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          '#anashid#.artists.dialog.editTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          '#anashid#.artists.dialog.editDescription',
        ),
        zContent: AddEditArtistDialogComponent,
        zData: { artist },
        zWidth: '550px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) this.loadData();
      });
  }

  onViewArtist(artist: ArtistModel): void {
    this._sheetService.create({
      zContent: ViewArtistSheetComponent,
      zData: { artist },
      zSide: this._rtlService.getSheetSide('right'),
      zClosable: false,
      zHideFooter: true,
    });
  }

  onDeleteArtist(artist: ArtistModel): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        '#anashid#.artists.dialog.deleteTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#anashid#.artists.dialog.deleteDescription',
        `Are you sure you want to delete "${artist.name}"?`,
      ),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._artistService.delete(artist.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                '#anashid#.artists.messages.deleted',
              ),
            );
            this.loadData();
          },
        });
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onClearFilters(): void {
    this.filterForm.reset({ searchTerm: '' });
  }
}
