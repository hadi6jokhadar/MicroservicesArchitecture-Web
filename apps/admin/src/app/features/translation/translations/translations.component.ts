import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ITranslationKeyDto,
  IPaginatedList,
  IGetTranslationKeysQuery,
  TranslationService,
  TranslatePipe,
  RtlService,
} from '@ihsan/core';
import {
  ZardAlertDialogService,
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardDialogService,
  ZardDropdownImports,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardSheetService,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { ViewValuesSheetComponent } from './view-values-sheet/view-values-sheet.component';
import { AddEditKeyDialogComponent } from './add-edit-key-dialog/add-edit-key-dialog.component';
import { ExportDialogComponent } from './export-dialog/export-dialog.component';
import { ImportDialogComponent } from './import-dialog/import-dialog.component';
import { TranslationEventsService } from '../translation-events.service';

interface ITranslationFilterForm {
  searchTerm: FormControl<string>;
  category: FormControl<string>;
}

@Component({
  selector: 'app-translations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    TranslatePipe,
    ...ZardDropdownImports,
    ...ZardFormImports,
    ...ZardPaginationImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
  ],
  templateUrl: './translations.component.html',
  styleUrls: ['./translations.component.scss'],
})
export class TranslationsComponent implements OnInit {
  private readonly _translationService = inject(TranslationService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _rtlService = inject(RtlService);
  private readonly _translationEvents = inject(TranslationEventsService);

  // Signals
  readonly translationKeys = signal<ITranslationKeyDto[]>([]);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  // Filter Form
  readonly filterForm = new FormGroup<ITranslationFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    category: new FormControl<string>('', { nonNullable: true }),
  });

  constructor() {
    // Watch for page changes and reload translation keys
    effect(() => {
      const page = this.currentPage();
      if (page > 1) {
        this.loadTranslationKeys();
      }
    });

    // Watch for category filter changes
    this.filterForm
      .get('category')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadTranslationKeys();
      });

    // Subscribe to translation keys changed events from dialogs
    this._translationEvents.translationKeysChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.loadTranslationKeys();
      });
  }

  ngOnInit(): void {
    this.loadTranslationKeys();
  }

  loadTranslationKeys(): void {
    this.isLoading.set(true);

    const formValue = this.filterForm.getRawValue();

    const query: IGetTranslationKeysQuery = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      searchTerm: formValue.searchTerm || undefined,
      category: formValue.category
        ? this.capitalizeFirstLetter(formValue.category)
        : undefined,
    };

    this._translationService.getTranslationKeys(query).subscribe({
      next: (response: IPaginatedList<ITranslationKeyDto>) => {
        this.translationKeys.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading translation keys:', error);
        toast.error('Failed to load translation keys');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadTranslationKeys();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      category: '',
    });
    this.currentPage.set(1);
    this.loadTranslationKeys();
  }

  onAddKey(): void {
    this._dialogService.create({
      zContent: AddEditKeyDialogComponent,
      zHideFooter: true,
    });
  }

  onViewValues(translationKey: ITranslationKeyDto): void {
    this._sheetService.create({
      zContent: ViewValuesSheetComponent,
      zData: { translationKey },
      zSide: this._rtlService.getSheetSide('right'),
      zClosable: false,
      zHideFooter: true,
    });
  }

  onEditKey(translationKey: ITranslationKeyDto): void {
    this._dialogService.create({
      zContent: AddEditKeyDialogComponent,
      zData: { translationKey },
      zHideFooter: true,
    });
  }

  onDeleteKey(translationKey: ITranslationKeyDto): void {
    this._alertDialogService.confirm({
      zTitle: 'Delete Translation Key',
      zDescription: `Are you sure you want to delete "${translationKey.key}"? This will also delete all translation values for this key. This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: () => {
        this._translationService
          .deleteTranslationKey(translationKey.id)
          .subscribe({
            next: () => {
              toast.success('Translation key deleted successfully');
              this.loadTranslationKeys();
            },
            error: () => {
              toast.error('Failed to delete translation key');
            },
          });
      },
    });
  }

  getUniqueCategories(): string[] {
    const categories = this.translationKeys()
      .map((key) => key.category)
      .filter((cat): cat is string => !!cat);
    return Array.from(new Set(categories));
  }

  getValueCount(translationKey: ITranslationKeyDto): number {
    return translationKey.values?.length || 0;
  }

  getLanguages(translationKey: ITranslationKeyDto): string[] {
    return (
      translationKey.values?.map((v) => v.language).filter((l) => !!l) || []
    );
  }

  onExportTranslations(): void {
    this._dialogService.create({
      zContent: ExportDialogComponent,
      zHideFooter: true,
    });
  }

  onImportTranslations(): void {
    this._dialogService.create({
      zContent: ImportDialogComponent,
      zHideFooter: true,
    });
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
