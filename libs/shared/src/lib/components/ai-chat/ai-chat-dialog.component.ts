import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpContext } from '@angular/common/http';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  AiChatService,
  AiSettingsService,
  AiSystemPromptsService,
  IAiChatSession,
  IAiChatMessage,
  IChatMessagePayload,
  IChatSendRequest,
  FileGroup,
  IAiSystemPrompt,
  IAiProviderSetting,
  TranslatePipe,
} from '@ihsan/core';
import {
  SKIP_ERROR_TOAST,
  extractErrorMessage,
} from '../../interceptors/error.interceptor';
import {
  ZardButtonComponent,
  ZardIconComponent,
  ZardInputDirective,
  ZardCheckboxComponent,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardDialogRef,
  ZardAlertComponent,
  ZardBadgeComponent,
  ZardLoaderComponent,
  ZardDividerComponent,
} from '@ihsan/ui';
import { FileSelectorComponent } from '../file-selector/file-selector.component';
import { IFileManagerResponse } from '@ihsan/core';

export interface IAiChatDialogData {
  defaultSettingsKey?: string;
}

interface ILocalChatMessage {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

@Component({
  selector: 'shared-ai-chat-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardCheckboxComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardAlertComponent,
    ZardBadgeComponent,
    ZardLoaderComponent,
    ZardDividerComponent,
    FileSelectorComponent,
  ],
  templateUrl: './ai-chat-dialog.component.html',
  styleUrl: './ai-chat-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiChatDialogComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;

  private _chatService = inject(AiChatService);
  private _settingsService = inject(AiSettingsService);
  private _systemPromptsService = inject(AiSystemPromptsService);
  private _dialogRef = inject(ZardDialogRef, { optional: true });
  private _platformId = inject(PLATFORM_ID);
  private _formBuilder = inject(FormBuilder);

  // ── State signals ──────────────────────────────────────────────────────

  sessions = signal<IAiChatSession[]>([]);
  activeSession = signal<IAiChatSession | null>(null);
  messages = signal<ILocalChatMessage[]>([]);
  persistedMessages = signal<IAiChatMessage[]>([]);

  allSettings = signal<IAiProviderSetting[]>([]);
  settingsKeys = signal<string[]>([]);
  systemPrompts = signal<IAiSystemPrompt[]>([]);

  // Reactive form for toolbar controls
  toolbarForm!: FormGroup;

  useStream = signal<boolean>(true);

  inputText = signal<string>('');
  attachedFiles = signal<IFileManagerResponse[]>([]);

  loading = signal<boolean>(false);
  sessionsLoading = signal<boolean>(false);
  streaming = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // ── Inline title edit ─────────────────────────────────────────────────────
  editingSessionId = signal<string | null>(null);
  editingTitle = signal<string>('');

  aiFileGroup = FileGroup.AI;

  private _abortController: AbortController | null = null;
  private _settingsKeySubscription: Subscription | null = null;
  private readonly _emptySystemPromptValue = '_empty_';

  // ── Computed ───────────────────────────────────────────────────────────

  hasActiveSession = computed(() => this.activeSession() !== null);
  canSend = computed(
    () =>
      !this.loading() &&
      !this.streaming() &&
      this.inputText().trim().length > 0 &&
      (this.toolbarForm?.get('selectedSettingsKey')?.value ?? '').trim()
        .length > 0
  );

  // ── Formatted Messages ────────────────────────────────────────────────
  formattedMessages = computed(() => {
    return this.messages().map((msg) => {
      let isJson = false;
      let displayContent = msg.content;

      if (msg.role === 'assistant') {
        const trimmed = msg.content.trim();
        if (
          (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
          (trimmed.startsWith('[') && trimmed.endsWith(']'))
        ) {
          try {
            const parsed = JSON.parse(trimmed);
            displayContent = JSON.stringify(parsed, null, 2);
            isJson = true;
          } catch (e) {
            // Not JSON
          }
        }
      }

      return {
        ...msg,
        displayContent,
        isJson,
      };
    });
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Initialize form
    this.toolbarForm = this._formBuilder.group({
      selectedSettingsKey: [''],
      selectedSystemPromptKey: [null],
    });

    // Sync useStream with the selected AI setting
    this._settingsKeySubscription = this.toolbarForm
      .get('selectedSettingsKey')!
      .valueChanges.subscribe((key: string) => {
        const match = this.allSettings().find((s) => s.Key === key);
        if (match && match.Stream !== null && match.Stream !== undefined) {
          this.useStream.set(match.Stream);
        }
      });

    this._loadSettingsKeys();
    this._loadSystemPrompts();
    this._loadSessions();
  }

  ngOnDestroy(): void {
    this._abortController?.abort();
    this._settingsKeySubscription?.unsubscribe();
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private _loadSettingsKeys(): void {
    this._settingsService.getSettings(this._getScopedFilter()).subscribe({
      next: (settings) => {
        this.allSettings.set(settings);
        const keys = [...new Set(settings.map((s) => s.Key))];
        this.settingsKeys.set(keys);
        if (
          keys.length > 0 &&
          !this.toolbarForm?.get('selectedSettingsKey')?.value
        ) {
          const firstKey = keys[0];
          this.toolbarForm?.patchValue({ selectedSettingsKey: firstKey });
          const firstSetting = settings.find((s) => s.Key === firstKey);
          if (
            firstSetting?.Stream !== null &&
            firstSetting?.Stream !== undefined
          ) {
            this.useStream.set(firstSetting.Stream);
          }
        }
      },
    });
  }

  private _loadSystemPrompts(): void {
    this._systemPromptsService.getPrompts(this._getScopedFilter()).subscribe({
      next: (prompts) => {
        this.systemPrompts.set(prompts);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  private _loadSessions(): void {
    this.sessionsLoading.set(true);
    this._chatService.getChatSessions({ limit: 50 }).subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.sessionsLoading.set(false);
      },
      error: () => {
        this.sessionsLoading.set(false);
      },
    });
  }

  private _loadSessionMessages(sessionId: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this._chatService
      .getChatMessages({ session_id: sessionId, limit: 200 })
      .subscribe({
        next: (msgs) => {
          this.persistedMessages.set(msgs);
          const localMsgs: ILocalChatMessage[] = msgs.map((m) => ({
            role: m.Role === 'assistant' ? 'assistant' : 'user',
            content: m.Content,
          }));
          this.messages.set(localMsgs);
          this.loading.set(false);
          this._scrollToBottom();
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(extractErrorMessage(err));
        },
      });
  }

  private _scrollToBottom(): void {
    if (!isPlatformBrowser(this._platformId)) return;
    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  private _getTenantId(): string | null {
    if (!isPlatformBrowser(this._platformId)) return null;
    return localStorage.getItem('tenantId');
  }

  private _getScopedFilter(): 'tenant' | 'global' {
    return this._getTenantId() ? 'tenant' : 'global';
  }

  private _buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const tenantId = this._getTenantId();
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private _buildRequest(userContent: string): IChatSendRequest {
    const history = this.messages();
    const selectedSystemPrompt = this.toolbarForm?.get(
      'selectedSystemPromptKey'
    )?.value;
    const systemPromptKey =
      selectedSystemPrompt &&
      selectedSystemPrompt !== this._emptySystemPromptValue
        ? selectedSystemPrompt
        : null;

    const priorMessages: IChatMessagePayload[] = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    priorMessages.push({ role: 'user', content: userContent });

    return {
      session_id: this.activeSession()?.Id ?? null,
      settings_key: this.toolbarForm?.get('selectedSettingsKey')?.value || '',
      system_prompt_key: systemPromptKey,
      messages: priorMessages,
      file_ids: this.attachedFiles().map((f) => f.id),
    };
  }

  // ── Public actions ─────────────────────────────────────────────────────

  selectSession(session: IAiChatSession): void {
    if (this.editingSessionId() === session.Id) return;
    this.activeSession.set(session);
    this.messages.set([]);
    this._loadSessionMessages(session.Id);
  }

  confirmEdit(session: IAiChatSession, event: Event): void {
    event.stopPropagation();
    const newTitle = this.editingTitle().trim();
    if (!newTitle || newTitle === (session.Title ?? '')) {
      this.cancelEdit(event);
      return;
    }
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
    this._chatService
      .updateChatSessionTitle(session.Id, newTitle, context)
      .subscribe({
        next: (updated) => {
          this.sessions.update((list) =>
            list.map((s) =>
              s.Id === updated.Id ? { ...s, Title: updated.Title } : s
            )
          );
          if (this.activeSession()?.Id === updated.Id) {
            this.activeSession.update((s) =>
              s ? { ...s, Title: updated.Title } : s
            );
          }
          this.editingSessionId.set(null);
        },
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err));
        },
      });
  }

  startEditing(session: IAiChatSession, event: Event): void {
    event.stopPropagation();
    this.editingSessionId.set(session.Id);
    this.editingTitle.set(session.Title ?? '');
  }

  cancelEdit(event: Event): void {
    event.stopPropagation();
    this.editingSessionId.set(null);
    this.editingTitle.set('');
  }

  startNewChat(): void {
    this.activeSession.set(null);
    this.messages.set([]);
    this.attachedFiles.set([]);
    this.toolbarForm?.patchValue({ selectedSystemPromptKey: null });
    this.errorMessage.set(null);
  }

  onFilesChanged(files: IFileManagerResponse[]): void {
    this.attachedFiles.set(files);
  }

  onUseStreamChange(checked: boolean): void {
    this.useStream.set(checked);
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.canSend()) {
        this.sendMessage();
      }
    }
  }

  sendMessage(): void {
    const content = this.inputText().trim();
    const settingsKey =
      this.toolbarForm?.get('selectedSettingsKey')?.value || '';
    if (!content || !settingsKey.trim()) return;

    this.errorMessage.set(null);

    // Add user message optimistically
    this.messages.update((msgs) => [...msgs, { role: 'user', content }]);
    this.inputText.set('');
    this._scrollToBottom();

    const request = this._buildRequest(content);

    if (this.useStream()) {
      this._sendStream(request);
    } else {
      this._sendSingle(request);
    }
  }

  private _sendSingle(request: IChatSendRequest): void {
    this.loading.set(true);
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._chatService.sendMessageSingle(request, context).subscribe({
      next: (response) => {
        // Update session if new
        if (!this.activeSession()) {
          this._loadSessions();
          // Create a synthetic session object so subsequent messages are sent with the same session
          this.activeSession.set({
            Id: response.session_id,
            TenantId: '',
            UserId: '',
            CreatedAt: new Date().toISOString(),
          });
        }
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'assistant', content: response.content },
        ]);
        this.attachedFiles.set([]);
        this.loading.set(false);
        this._scrollToBottom();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(extractErrorMessage(err));
        // Remove optimistic user message on failure
        this.messages.update((msgs) => msgs.slice(0, -1));
      },
    });
  }

  private _sendStream(request: IChatSendRequest): void {
    this.streaming.set(true);
    this._abortController = new AbortController();

    // Add placeholder assistant message for streaming
    this.messages.update((msgs) => [
      ...msgs,
      { role: 'assistant', content: '', streaming: true },
    ]);

    const headers = this._buildHeaders();

    const run = async () => {
      try {
        let accumulatedContent = '';
        for await (const chunk of this._chatService.sendMessageStream(
          request,
          headers,
          this._abortController?.signal
        )) {
          accumulatedContent += chunk;
          this.messages.update((msgs) => {
            const updated = [...msgs];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              role: 'assistant',
              content: accumulatedContent,
              streaming: true,
            };
            return updated;
          });
          this._scrollToBottom();
        }
        // Mark streaming done
        this.messages.update((msgs) => {
          const updated = [...msgs];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            role: 'assistant',
            content: accumulatedContent,
            streaming: false,
          };
          return updated;
        });
        // Reload sessions to capture the new/updated session
        this._loadSessions();
        this.attachedFiles.set([]);
        this.streaming.set(false);
        this._scrollToBottom();
      } catch (err: unknown) {
        this.streaming.set(false);
        if (err instanceof Error && err.name !== 'AbortError') {
          this.errorMessage.set(err.message || 'Stream failed');
          // Remove placeholder
          this.messages.update((msgs) => msgs.slice(0, -1));
        }
      }
    };

    run();
  }

  stopStreaming(): void {
    this._abortController?.abort();
    this.streaming.set(false);
    // Mark last message as done
    this.messages.update((msgs) => {
      const updated = [...msgs];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]?.streaming) {
        updated[lastIdx] = { ...updated[lastIdx], streaming: false };
      }
      return updated;
    });
  }

  deleteSession(session: IAiChatSession, event: MouseEvent): void {
    event.stopPropagation();
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
    this._chatService.deleteChatSession(session.Id, context).subscribe({
      next: () => {
        this.sessions.update((list) => list.filter((s) => s.Id !== session.Id));
        if (this.activeSession()?.Id === session.Id) {
          this.activeSession.set(null);
          this.messages.set([]);
        }
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err));
      },
    });
  }

  close(): void {
    this._dialogRef?.close();
  }
}
