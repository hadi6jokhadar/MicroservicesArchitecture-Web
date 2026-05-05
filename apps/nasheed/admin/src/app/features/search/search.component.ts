import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslationService } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardCardComponent,
  ZardFormImports,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardEmptyComponent,
  ZardBadgeComponent,
  ZardIconComponent,
  ZardIdDirective,
  ZardDialogService,
  ZardPaginationImports,
} from '@ihsan/ui';
import {
  SearchService,
  SearchResultModel,
  SongModel,
} from '@web-app/nasheed-shared';
import { GenerateLyricsDialogComponent } from './generate-lyrics-dialog/generate-lyrics-dialog.component';
import { CommonModule } from '@angular/common';

interface ISearchForm {
  query: FormControl<string>;
  topN: FormControl<number>;
}

@Component({
  selector: 'app-search',
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
    ...ZardPaginationImports,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly _searchService = inject(SearchService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _translationService = inject(TranslationService);

  readonly results = signal<SearchResultModel[]>([]);
  readonly similarResults = signal<SongModel[]>([]);
  readonly isLoading = signal(false);
  readonly hasSearched = signal(false);

  readonly searchForm = new FormGroup<ISearchForm>({
    query: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    topN: new FormControl<number>(10, { nonNullable: true }),
  });

  onSearch(): void {
    if (this.searchForm.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.hasSearched.set(true);

    this._searchService
      .search({
        query: this.searchForm.controls.query.value,
        topN: this.searchForm.controls.topN.value,
      })
      .subscribe({
        next: (results) => {
          this.results.set(results);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  onGenerateLyrics(): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        '#anashid#.search.generateLyrics.title',
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#anashid#.search.generateLyrics.description',
      ),
      zContent: GenerateLyricsDialogComponent,
      zData: null,
      zWidth: '600px',
      zHideFooter: true,
    });
  }

  onClear(): void {
    this.searchForm.reset({ query: '', topN: 10 });
    this.results.set([]);
    this.hasSearched.set(false);
  }
}
