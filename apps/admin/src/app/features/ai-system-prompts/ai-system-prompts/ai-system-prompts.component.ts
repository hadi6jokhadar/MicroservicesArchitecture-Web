import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AiSystemPromptsService,
  IAiSystemPrompt,
  SystemPromptScopeFilter,
  TranslatePipe,
  TranslationService,
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
  ZardSelectImports,
  ZardSheetService,
  ZardTableImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { AiSystemPromptsEventsService } from '../ai-system-prompts-events.service';
import { AddEditAiSystemPromptDialogComponent } from './add-edit-ai-system-prompt-dialog/add-edit-ai-system-prompt-dialog.component';
import { AiSystemPromptResponseFormatSheetComponent } from './ai-system-prompt-response-format-sheet/ai-system-prompt-response-format-sheet.component';

interface IAiSystemPromptsFilterForm {
  searchTerm: FormControl<string>;
  scope: FormControl<SystemPromptScopeFilter>;
}

@Component({
  selector: 'app-ai-system-prompts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    ...ZardDropdownImports,
    ...ZardFormImports,
    ...ZardPaginationImports,
    ...ZardTableImports,
    ...ZardSelectImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
  ],
  templateUrl: './ai-system-prompts.component.html',
  styleUrls: ['./ai-system-prompts.component.scss'],
})
export class AiSystemPromptsComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _service = inject(AiSystemPromptsService);
  private readonly _translationService = inject(TranslationService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _eventsService = inject(AiSystemPromptsEventsService);

  readonly isLoading = signal(false);
  readonly prompts = signal<IAiSystemPrompt[]>(
    (this._route.snapshot.data['prompts'] as IAiSystemPrompt[] | undefined) ||
      [],
  );

  readonly currentPage = signal(1);
  readonly pageSize = 10;
  readonly scopeOptions: SystemPromptScopeFilter[] = [
    'all',
    'tenant',
    'global',
  ];

  readonly filterForm = new FormGroup<IAiSystemPromptsFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    scope: new FormControl<SystemPromptScopeFilter>('all', {
      nonNullable: true,
    }),
  });

  readonly filterValues = signal(this.filterForm.getRawValue());

  readonly filteredPrompts = computed(() => {
    const formValue = this.filterValues();
    const searchTerm = (formValue.searchTerm || '').trim().toLowerCase();

    return this.prompts().filter((prompt) => {
      const matchesSearch =
        !searchTerm ||
        prompt.Name.toLowerCase().includes(searchTerm) ||
        prompt.PromptText.toLowerCase().includes(searchTerm) ||
        (prompt.TenantId || '').toLowerCase().includes(searchTerm);

      return matchesSearch;
    });
  });

  readonly totalCount = computed(() => this.filteredPrompts().length);
  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.totalCount() / this.pageSize);
    return pages > 0 ? pages : 1;
  });

  readonly pagedPrompts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredPrompts().slice(start, end);
  });

  constructor() {
    this.filterForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.filterValues.set(this.filterForm.getRawValue());
      this.currentPage.set(1);
    });

    this._eventsService.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadData());

    effect(() => {
      const currentPage = this.currentPage();
      const totalPages = this.totalPages();
      if (currentPage > totalPages) {
        this.currentPage.set(totalPages);
      }
    });
  }

  loadData(): void {
    const selectedScope = this.filterForm.controls.scope.value;
    this.isLoading.set(true);
    this._service.getPrompts(selectedScope).subscribe({
      next: (response) => {
        this.prompts.set(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        toast.error(
          this._translationService.getCachedTranslation(
            'aiSystemPrompts.messages.loadFailed',
          ),
        );
      },
    });
  }

  onSearch(): void {
    this.loadData();
    this.currentPage.set(1);
  }

  onClearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      scope: 'all',
    });
    this.loadData();
    this.currentPage.set(1);
  }

  onAddPrompt(): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'aiSystemPrompts.dialog.addTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        'aiSystemPrompts.dialog.addDescription',
      ),
      zContent: AddEditAiSystemPromptDialogComponent,
      zHideFooter: true,
      zWidth: '600px',
      zCustomClasses: 'z-dialog-max-width-100',
      zClosable: false,
    });
  }

  onEditPrompt(prompt: IAiSystemPrompt): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        'aiSystemPrompts.dialog.editTitle',
      ),
      zDescription: this._translationService.getCachedTranslation(
        'aiSystemPrompts.dialog.editDescription',
      ),
      zContent: AddEditAiSystemPromptDialogComponent,
      zData: { prompt },
      zHideFooter: true,
      zWidth: '600px',
      zCustomClasses: 'z-dialog-max-width-100',
      zClosable: true,
    });
  }

  onEditResponseFormat(prompt: IAiSystemPrompt): void {
    this._sheetService.create({
      zContent: AiSystemPromptResponseFormatSheetComponent,
      zData: { prompt },
      zSide: 'bottom',
      zClosable: false,
      zHideFooter: true,
      zHeight: '62vh',
    });
  }

  onDeletePrompt(prompt: IAiSystemPrompt): void {
    const description = this._translationService
      .getCachedTranslation('aiSystemPrompts.dialog.deleteDescription')
      .replace('{name}', prompt.Name);

    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        'aiSystemPrompts.dialog.deleteTitle',
      ),
      zDescription: description,
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._service.deletePrompt(prompt.Id).subscribe({
          next: () => {
            toast.success(
              this._translationService.getCachedTranslation(
                'aiSystemPrompts.messages.deleted',
              ),
            );
            this._eventsService.notifyDataChanged();
          },
          error: () => {
            toast.error(
              this._translationService.getCachedTranslation(
                'aiSystemPrompts.messages.deleteFailed',
              ),
            );
          },
        });
      },
    });
  }

  getTenantBadgeType(
    tenantId?: string | null,
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    return tenantId ? 'outline' : 'default';
  }

  getTruncatedText(text: string, maxLength = 80): string {
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  }
}
