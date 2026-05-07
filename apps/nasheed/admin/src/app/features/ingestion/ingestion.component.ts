import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslationService, RtlService } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardCardComponent,
  ZardFormImports,
  ZardLoaderComponent,
  ZardEmptyComponent,
  ZardTableComponent,
  ZardTableHeaderComponent,
  ZardTableBodyComponent,
  ZardTableRowComponent,
  ZardTableHeadComponent,
  ZardTableCellComponent,
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
  IngestionJobService,
  IngestionEventsService,
  IngestionJobModel,
  IIngestionJobQuery,
  PaginatedList,
  IngestionJobStatus,
  IngestionJobType,
  SongModel,
  SongState,
  SearchIndexStatus,
} from '@web-app/nasheed-shared';
import { ViewJobSheetComponent } from './view-job-sheet/view-job-sheet.component';

interface IIngestionFilterForm {
  status: FormControl<string>;
  type: FormControl<string>;
}

@Component({
  selector: 'app-ingestion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardCardComponent,
    ...ZardFormImports,
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
  templateUrl: './ingestion.component.html',
  styleUrl: './ingestion.component.scss',
})
export class IngestionComponent {
  private readonly _ingestionService = inject(IngestionJobService);
  private readonly _ingestionEventsService = inject(IngestionEventsService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _rtlService = inject(RtlService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _translationService = inject(TranslationService);

  readonly data = signal<IngestionJobModel[]>([]);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  readonly IngestionJobStatus = IngestionJobStatus;
  readonly IngestionJobType = IngestionJobType;
  readonly SongState = SongState;
  readonly SearchIndexStatus = SearchIndexStatus;

  readonly jobStatuses = [
    {
      value: IngestionJobStatus.Pending,
      label: '#anashid#.ingestion.statuses.pending',
    },
    {
      value: IngestionJobStatus.Running,
      label: '#anashid#.ingestion.statuses.running',
    },
    {
      value: IngestionJobStatus.Completed,
      label: '#anashid#.ingestion.statuses.completed',
    },
    {
      value: IngestionJobStatus.Failed,
      label: '#anashid#.ingestion.statuses.failed',
    },
    {
      value: IngestionJobStatus.Cancelled,
      label: '#anashid#.ingestion.statuses.cancelled',
    },
  ];

  readonly jobTypes = [
    {
      value: IngestionJobType.Transcription,
      label: '#anashid#.ingestion.types.transcription',
    },
    {
      value: IngestionJobType.LyricsAlignment,
      label: '#anashid#.ingestion.types.lyricsAlignment',
    },
    {
      value: IngestionJobType.Embedding,
      label: '#anashid#.ingestion.types.embedding',
    },
    {
      value: IngestionJobType.FullPipeline,
      label: '#anashid#.ingestion.types.fullPipeline',
    },
  ];

  readonly filterForm = new FormGroup<IIngestionFilterForm>({
    status: new FormControl<string>('all', { nonNullable: true }),
    type: new FormControl<string>('all', { nonNullable: true }),
  });

  constructor() {
    this.loadData();

    this.filterForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.currentPage.set(1);
      this.loadData();
    });

    this._ingestionEventsService.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadData());
  }

  loadData(): void {
    this.isLoading.set(true);
    const query: IIngestionJobQuery = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      status:
        this.filterForm.controls.status.value !== 'all'
          ? (Number(
              this.filterForm.controls.status.value,
            ) as IngestionJobStatus)
          : undefined,
      type:
        this.filterForm.controls.type.value !== 'all'
          ? (Number(this.filterForm.controls.type.value) as IngestionJobType)
          : undefined,
    };

    this._ingestionService.getAll(query).subscribe({
      next: (response: PaginatedList<IngestionJobModel>) => {
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

  onViewJob(job: IngestionJobModel): void {
    this._ingestionService.getById(job.id).subscribe({
      next: (freshJob) => {
        this._sheetService.create({
          zContent: ViewJobSheetComponent,
          zData: { job: freshJob },
          zSide: this._rtlService.getSheetSide('right'),
          zClosable: false,
          zHideFooter: true,
        });
      },
      error: () => {
        this._sheetService.create({
          zContent: ViewJobSheetComponent,
          zData: { job },
          zSide: this._rtlService.getSheetSide('right'),
          zClosable: false,
          zHideFooter: true,
        });
      },
    });
  }

  onRetryJob(job: IngestionJobModel): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.dialog.retryTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.dialog.retryDescription',
      ),
      zOkText: this._translationService.getCachedTranslation('common.retry'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOnOk: () => {
        this._ingestionService.retry(job.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                '#anashid#.ingestion.messages.retried',
              ),
            );
            this.loadData();
          },
        });
      },
    });
  }

  onReindexJob(job: IngestionJobModel): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.dialog.reindexTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.dialog.reindexDescription',
      ),
      zOkText: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.actions.reindex',
      ),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOnOk: () => {
        this._ingestionService.reindex(job.songId).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                '#anashid#.ingestion.messages.reindexed',
              ),
            );
            this.loadData();
          },
        });
      },
    });
  }

  onCheckAnalysisStatus(job: IngestionJobModel): void {
    this._ingestionService.getAnalysisStatus(job.songId).subscribe({
      next: (song: SongModel) => {
        const songStateKey = this.getSongStateKey(song.songState);
        const searchIndexKey = this.getSearchIndexStatusKey(
          song.searchIndexStatus,
        );
        toast.message(
          this._translationService.getCachedTranslation(
            '#anashid#.ingestion.analysisStatus.title',
          ),
          {
            description: `${this._translationService.getCachedTranslation('#anashid#.ingestion.analysisStatus.songState')}: ${this._translationService.getCachedTranslation(songStateKey)} | ${this._translationService.getCachedTranslation('#anashid#.ingestion.analysisStatus.searchIndex')}: ${this._translationService.getCachedTranslation(searchIndexKey)}`,
          },
        );
      },
    });
  }

  onRemoveJob(job: IngestionJobModel): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.dialog.removeTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#anashid#.ingestion.dialog.removeDescription',
      ),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._ingestionService.remove(job.id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                '#anashid#.ingestion.messages.removed',
              ),
            );
            this.loadData();
          },
        });
      },
    });
  }

  getStatusBadgeType(
    status: IngestionJobStatus,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case IngestionJobStatus.Completed:
        return 'default';
      case IngestionJobStatus.Failed:
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  getStatusKey(status: IngestionJobStatus): string {
    switch (status) {
      case IngestionJobStatus.Pending:
        return '#anashid#.ingestion.statuses.pending';
      case IngestionJobStatus.Running:
        return '#anashid#.ingestion.statuses.running';
      case IngestionJobStatus.Completed:
        return '#anashid#.ingestion.statuses.completed';
      case IngestionJobStatus.Failed:
        return '#anashid#.ingestion.statuses.failed';
      case IngestionJobStatus.Removed:
        return '#anashid#.ingestion.statuses.removed';
      case IngestionJobStatus.Cancelled:
        return '#anashid#.ingestion.statuses.cancelled';
      default:
        return '#anashid#.ingestion.statuses.pending';
    }
  }

  getTypeKey(type: IngestionJobType): string {
    switch (type) {
      case IngestionJobType.FullPipeline:
        return '#anashid#.ingestion.types.fullPipeline';
      case IngestionJobType.Transcription:
        return '#anashid#.ingestion.types.transcription';
      case IngestionJobType.LyricsAlignment:
        return '#anashid#.ingestion.types.lyricsAlignment';
      case IngestionJobType.Embedding:
        return '#anashid#.ingestion.types.embedding';
      default:
        return '#anashid#.ingestion.types.fullPipeline';
    }
  }

  onClearFilters(): void {
    this.filterForm.reset({ status: 'all', type: 'all' });
  }

  getSongStateKey(state: SongState): string {
    switch (state) {
      case SongState.Uploaded:
        return '#anashid#.ingestion.analysisStatus.state.uploaded';
      case SongState.InQueue:
        return '#anashid#.ingestion.analysisStatus.state.inQueue';
      case SongState.Pending:
        return '#anashid#.ingestion.analysisStatus.state.pending';
      case SongState.Done:
        return '#anashid#.ingestion.analysisStatus.state.done';
      case SongState.Failed:
        return '#anashid#.ingestion.analysisStatus.state.failed';
      default:
        return '#anashid#.ingestion.analysisStatus.state.uploaded';
    }
  }

  getSearchIndexStatusKey(status: SearchIndexStatus): string {
    switch (status) {
      case SearchIndexStatus.NotIndexed:
        return '#anashid#.ingestion.analysisStatus.index.notIndexed';
      case SearchIndexStatus.Indexing:
        return '#anashid#.ingestion.analysisStatus.index.indexing';
      case SearchIndexStatus.Indexed:
        return '#anashid#.ingestion.analysisStatus.index.indexed';
      case SearchIndexStatus.Failed:
        return '#anashid#.ingestion.analysisStatus.index.failed';
      default:
        return '#anashid#.ingestion.analysisStatus.index.notIndexed';
    }
  }
}
