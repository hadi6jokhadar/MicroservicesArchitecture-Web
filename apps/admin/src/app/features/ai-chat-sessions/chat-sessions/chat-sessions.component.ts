import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AiChatService,
  IAiChatSession,
  RtlService,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import {
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardSheetService,
  ZardTableImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { SessionMessagesSheetComponent } from './session-messages-sheet/session-messages-sheet.component';

interface IChatSessionsFilterForm {
  searchTerm: FormControl<string>;
  userId: FormControl<string>;
}

@Component({
  selector: 'app-chat-sessions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    TranslatePipe,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    ...ZardFormImports,
    ...ZardPaginationImports,
    ...ZardTableImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
  ],
  templateUrl: './chat-sessions.component.html',
  styleUrls: ['./chat-sessions.component.scss'],
})
export class ChatSessionsComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _aiChatService = inject(AiChatService);
  private readonly _translationService = inject(TranslationService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _rtlService = inject(RtlService);

  readonly isLoading = signal(false);
  readonly sessions = signal<IAiChatSession[]>(
    (this._route.snapshot.data['sessions'] as IAiChatSession[] | undefined) ||
      []
  );

  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly filterForm = new FormGroup<IChatSessionsFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    userId: new FormControl<string>('', { nonNullable: true }),
  });

  readonly filterValues = signal(this.filterForm.getRawValue());

  readonly filteredSessions = computed(() => {
    const { searchTerm, userId } = this.filterValues();
    const search = searchTerm.trim().toLowerCase();
    const userFilter = userId.trim().toLowerCase();

    return this.sessions().filter((s) => {
      const matchesSearch =
        !search ||
        s.Id.toLowerCase().includes(search) ||
        s.TenantId.toLowerCase().includes(search) ||
        (s.Title ?? '').toLowerCase().includes(search) ||
        s.UserId.toLowerCase().includes(search);

      const matchesUser =
        !userFilter || s.UserId.toLowerCase().includes(userFilter);

      return matchesSearch && matchesUser;
    });
  });

  readonly totalCount = computed(() => this.filteredSessions().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize))
  );
  readonly pagedSessions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredSessions().slice(start, start + this.pageSize);
  });

  constructor() {
    this.filterForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.filterValues.set(this.filterForm.getRawValue());
      this.currentPage.set(1);
    });

    effect(() => {
      if (this.currentPage() > this.totalPages()) {
        this.currentPage.set(this.totalPages());
      }
    });
  }

  loadData(): void {
    const { userId } = this.filterForm.getRawValue();
    this.isLoading.set(true);
    this._aiChatService
      .getChatSessions(userId ? { user_id: userId } : {})
      .subscribe({
        next: (data) => {
          this.sessions.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          toast.error(
            this._translationService.getCachedTranslation(
              'chatSessions.messages.loadFailed'
            )
          );
        },
      });
  }

  onSearch(): void {
    this.loadData();
    this.currentPage.set(1);
  }

  onClearFilters(): void {
    this.filterForm.reset({ searchTerm: '', userId: '' });
    this.loadData();
    this.currentPage.set(1);
  }

  onViewSession(session: IAiChatSession): void {
    this._sheetService.create({
      zContent: SessionMessagesSheetComponent,
      zData: { session },
      zSide: this._rtlService.getSheetSide('right'),
      zClosable: false,
      zHideFooter: true,
    });
  }
}
