import { JsonPipe } from '@angular/common';
import { HttpContext } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  AiChatService,
  AiSettingsService,
  IAiProviderSetting,
  IEmbeddingRequest,
  IEmbeddingResponse,
  TranslatePipe,
} from '@ihsan/core';
import {
  ZardAlertComponent,
  ZardButtonComponent,
  ZardDialogRef,
  ZardDividerComponent,
  ZardIconComponent,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardSelectComponent,
  ZardSelectItemComponent,
} from '@ihsan/ui';
import {
  SKIP_ERROR_TOAST,
  extractErrorMessage,
} from '../../interceptors/error.interceptor';

export interface IAiEmbeddingDialogData {
  defaultSettingsKey?: string;
}

@Component({
  selector: 'shared-ai-embedding-dialog',
  standalone: true,
  imports: [
    JsonPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardIconComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardAlertComponent,
    ZardLoaderComponent,
    ZardDividerComponent,
  ],
  templateUrl: './ai-embedding-dialog.component.html',
  styleUrl: './ai-embedding-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiEmbeddingDialogComponent implements OnInit {
  private readonly _chatService = inject(AiChatService);
  private readonly _settingsService = inject(AiSettingsService);
  private readonly _dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly _fb = inject(FormBuilder);

  // ── State signals ────────────────────────────────────────────────────────

  allSettings = signal<IAiProviderSetting[]>([]);
  settingsKeys = signal<string[]>([]);

  form!: FormGroup;

  loading = signal<boolean>(false);
  loadingSettings = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  result = signal<IEmbeddingResponse | null>(null);

  /** Mirrors form values as a signal so computed() can react to changes */
  private _formValues = signal<{ selectedSettingsKey: string; text: string }>({
    selectedSettingsKey: '',
    text: '',
  });

  // ── Computed ─────────────────────────────────────────────────────────────

  canSubmit = computed(() => {
    if (this.loading()) return false;
    const { text, selectedSettingsKey } = this._formValues();
    return text.trim().length > 0 && selectedSettingsKey.trim().length > 0;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.form = this._fb.group({
      selectedSettingsKey: [''],
      text: [''],
    });

    this.form.valueChanges.subscribe((v) => this._formValues.set(v));

    this._loadSettingsKeys();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _loadSettingsKeys(): void {
    const scope = this._getTenantId() ? 'tenant' : 'global';
    this.loadingSettings.set(true);
    this._settingsService.getSettings(scope).subscribe({
      next: (settings) => {
        const embeddingSettings = settings.filter(
          (s) => s.ModelType === 'Embedding'
        );
        this.allSettings.set(embeddingSettings);
        const keys = [...new Set(embeddingSettings.map((s) => s.Key))];
        this.settingsKeys.set(keys);
        if (keys.length > 0 && !this.form.get('selectedSettingsKey')?.value) {
          this.form.patchValue({ selectedSettingsKey: keys[0] });
        }
        this.loadingSettings.set(false);
      },
      error: () => {
        this.loadingSettings.set(false);
      },
    });
  }

  private _getTenantId(): string | null {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem('tenantId')
      : null;
  }

  // ── Public actions ────────────────────────────────────────────────────────

  submit(): void {
    if (!this.canSubmit()) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.result.set(null);

    const { selectedSettingsKey, text } = this._formValues();
    const request: IEmbeddingRequest = {
      settingsKey: selectedSettingsKey,
      text: text.trim(),
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
    this._chatService.createEmbedding(request, context).subscribe({
      next: (response) => {
        this.result.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this._dialogRef?.close();
  }
}
