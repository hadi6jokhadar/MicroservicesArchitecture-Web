import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of, switchMap, map } from 'rxjs';
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
  ZardSelectComponent,
  ZardSelectItemComponent,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import {
  SongService,
  IngestionJobService,
  SongEventsService,
  ArtistService,
  SongModel,
  ArtistModel,
  ISongQuery,
  PaginatedList,
  SongState,
  SearchIndexStatus,
} from '@web-app/nasheed-shared';
import { AddEditSongDialogComponent } from './add-edit-song-dialog/add-edit-song-dialog.component';
import { ViewSongSheetComponent } from './view-song-sheet/view-song-sheet.component';

interface ISongFilterForm {
  searchTerm: FormControl<string>;
  artistId: FormControl<string>;
  songState: FormControl<string>;
  copyrightRiskLevel: FormControl<string>;
  contentSafetyFlag: FormControl<string>;
}

@Component({
  selector: 'app-songs',
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
    ZardSelectComponent,
    ZardSelectItemComponent,
  ],
  templateUrl: './songs.component.html',
  styleUrl: './songs.component.scss',
})
export class SongsComponent {
  private readonly _songService = inject(SongService);
  private readonly _ingestionService = inject(IngestionJobService);
  private readonly _songEventsService = inject(SongEventsService);
  private readonly _artistService = inject(ArtistService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _rtlService = inject(RtlService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _translationService = inject(TranslationService);

  readonly data = signal<SongModel[]>([]);
  readonly artists = signal<ArtistModel[]>([]);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  readonly SongState = SongState;
  readonly SearchIndexStatus = SearchIndexStatus;

  readonly songStates = [
    { value: SongState.Uploaded, label: '#anashid#.songs.states.uploaded' },
    { value: SongState.InQueue, label: '#anashid#.songs.states.inQueue' },
    { value: SongState.Pending, label: '#anashid#.songs.states.pending' },
    { value: SongState.Done, label: '#anashid#.songs.states.done' },
    { value: SongState.Failed, label: '#anashid#.songs.states.failed' },
  ];

  readonly copyrightRiskLevels = [
    { value: 'low', label: '#anashid#.songs.legal.riskLevels.low' },
    { value: 'medium', label: '#anashid#.songs.legal.riskLevels.medium' },
    { value: 'high', label: '#anashid#.songs.legal.riskLevels.high' },
  ];

  readonly contentSafetyFlags = [
    { value: 'safe', label: '#anashid#.songs.legal.safetyFlags.safe' },
    { value: 'flagged', label: '#anashid#.songs.legal.safetyFlags.flagged' },
  ];

  readonly filterForm = new FormGroup<ISongFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    artistId: new FormControl<string>('all', { nonNullable: true }),
    songState: new FormControl<string>('all', { nonNullable: true }),
    copyrightRiskLevel: new FormControl<string>('all', { nonNullable: true }),
    contentSafetyFlag: new FormControl<string>('all', { nonNullable: true }),
  });

  constructor() {
    this.loadArtists();
    this.loadData();

    this.filterForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.currentPage.set(1);
      this.loadData();
    });

    this._songEventsService.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadData());
  }

  private loadArtists(): void {
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
  }

  loadData(): void {
    this.isLoading.set(true);
    const query: ISongQuery = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      textFilter: this.filterForm.controls.searchTerm.value || undefined,
      artistId:
        this.filterForm.controls.artistId.value !== 'all'
          ? Number(this.filterForm.controls.artistId.value)
          : undefined,
      state:
        this.filterForm.controls.songState.value !== 'all'
          ? (Number(this.filterForm.controls.songState.value) as SongState)
          : undefined,
      copyrightRiskLevel:
        this.filterForm.controls.copyrightRiskLevel.value !== 'all'
          ? this.filterForm.controls.copyrightRiskLevel.value
          : undefined,
      contentSafetyFlag:
        this.filterForm.controls.contentSafetyFlag.value !== 'all'
          ? this.filterForm.controls.contentSafetyFlag.value
          : undefined,
    };

    this._songService.getAll(query).subscribe({
      next: (response: PaginatedList<SongModel>) => {
        this.data.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadData();
  }

  onAddSong(): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          '#anashid#.songs.dialog.addTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          '#anashid#.songs.dialog.addDescription',
        ),
        zContent: AddEditSongDialogComponent,
        zData: null,
        zWidth: '650px',
        zHideFooter: true,
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) this.loadData();
      });
  }

  onEditSong(song: SongModel): void {
    this._dialogService
      .create({
        zTitle: this._translationService.getCachedTranslation(
          '#anashid#.songs.dialog.editTitle',
        ),
        zDescription: this._translationService.getCachedTranslation(
          '#anashid#.songs.dialog.editDescription',
        ),
        zContent: AddEditSongDialogComponent,
        zData: { song },
        zWidth: '650px',
        zHideFooter: true,
        zCustomClasses: 'z-dialog-max-width-100',
      })
      .afterClosed()
      .subscribe((result: { success: boolean }) => {
        if (result?.success) this.loadData();
      });
  }

  onViewSong(song: SongModel): void {
    this._sheetService.create({
      zContent: ViewSongSheetComponent,
      zData: { song },
      zSide: this._rtlService.getSheetSide('right'),
      zClosable: false,
      zHideFooter: true,
      zWidth: '700px',
    });
  }

  onDeleteSong(song: SongModel): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        '#anashid#.songs.dialog.deleteTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#anashid#.songs.dialog.deleteDescription',
        `Are you sure you want to delete "${song.title}"?`,
      ),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._songService.delete(song.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                '#anashid#.songs.messages.deleted',
              ),
            );
            this.loadData();
          },
        });
      },
    });
  }

  onReindexSong(song: SongModel): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.dialog.reindexTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.dialog.reindexDescription',
      ),
      zOkText: this._translationService.getCachedTranslation(
        '#anashid#.songs.actions.reindex',
      ),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOnOk: () => {
        this._ingestionService.reindex(song.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                '#anashid#.ingestion.messages.reindexed',
              ),
            );
          },
        });
      },
    });
  }

  getIndexStatusBadgeType(
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

  getIndexStatusKey(status: SearchIndexStatus): string {
    switch (status) {
      case SearchIndexStatus.NotIndexed:
        return '#anashid#.songs.indexStatus.notIndexed';
      case SearchIndexStatus.Indexing:
        return '#anashid#.songs.indexStatus.indexing';
      case SearchIndexStatus.Indexed:
        return '#anashid#.songs.indexStatus.indexed';
      case SearchIndexStatus.Failed:
        return '#anashid#.songs.indexStatus.failed';
      default:
        return '#anashid#.songs.indexStatus.notIndexed';
    }
  }

  getContentSafetyBadgeType(
    flag: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (flag.toLowerCase()) {
      case 'safe':
        return 'default';
      case 'flagged':
        return 'destructive';
      default:
        return 'outline';
    }
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

  getSongStateKey(state: SongState): string {
    switch (state) {
      case SongState.Uploaded:
        return '#anashid#.songs.states.uploaded';
      case SongState.InQueue:
        return '#anashid#.songs.states.inQueue';
      case SongState.Pending:
        return '#anashid#.songs.states.pending';
      case SongState.Done:
        return '#anashid#.songs.states.done';
      case SongState.Failed:
        return '#anashid#.songs.states.failed';
      default:
        return '#anashid#.songs.states.pending';
    }
  }

  getArtistName(artistId?: number | null): string {
    if (!artistId) {
      return this._translationService.getCachedTranslation('common.unassigned');
    }

    return (
      this.artists().find((a) => a.id === artistId)?.name ??
      this._translationService.getCachedTranslation('common.unassigned')
    );
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      artistId: 'all',
      songState: 'all',
      copyrightRiskLevel: 'all',
      contentSafetyFlag: 'all',
    });
  }
}
