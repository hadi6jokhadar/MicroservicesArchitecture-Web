import { CommonModule } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ITenantConfig,
  ITenantConfiguration,
  IUpdateTenantRequest,
  TenantService,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import {
  Z_SHEET_DATA,
  ZardAlertComponent,
  ZardButtonComponent,
  ZardLoaderComponent,
  ZardSheetRef,
  ZardSwitchComponent,
  ZardTabComponent,
  ZardTabGroupComponent,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import {
  Content,
  JsonEditor,
  Mode,
  Validator,
  createJSONEditor,
} from 'vanilla-jsoneditor';

interface ITenantConfigurationSheetData {
  tenantId: string;
}

interface IFeatureFlagDef {
  key: 'aiChatEnabled' | 'nasheedIngestionEnabled' | 'isBackgroundJobPageEnabled' | 'isAuditLogPageEnabled';
  labelKey: string;
  descKey: string;
}

@Component({
  selector: 'app-tenant-configuration-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardAlertComponent,
    ZardButtonComponent,
    ZardLoaderComponent,
    ZardSwitchComponent,
    ZardTabComponent,
    ZardTabGroupComponent,
  ],
  templateUrl: './tenant-configuration-sheet.component.html',
  styleUrls: ['./tenant-configuration-sheet.component.scss'],
})
export class TenantConfigurationSheetComponent implements OnInit, OnDestroy {
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _tenantService = inject(TenantService);
  private readonly _translationService = inject(TranslationService);
  protected readonly data = inject<ITenantConfigurationSheetData>(Z_SHEET_DATA);

  readonly editorContainer = viewChild<ElementRef>('editorContainer');
  private editor: JsonEditor | null = null;

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly tenantConfig = signal<ITenantConfig | null>(null);

  // JSON editor tracks all non-featureFlags config
  private currentContent: unknown = {};
  // Custom flags (keys not in knownFlags) from the original config — preserved on save
  private originalCustomFlags: Record<string, boolean> = {};

  readonly knownFlags: IFeatureFlagDef[] = [
    {
      key: 'aiChatEnabled',
      labelKey: 'tenants.featureFlags.aiChatEnabled',
      descKey: 'tenants.featureFlags.aiChatEnabledDesc',
    },
    {
      key: 'nasheedIngestionEnabled',
      labelKey: 'tenants.featureFlags.nasheedIngestionEnabled',
      descKey: 'tenants.featureFlags.nasheedIngestionEnabledDesc',
    },
    {
      key: 'isBackgroundJobPageEnabled',
      labelKey: 'tenants.featureFlags.isBackgroundJobPageEnabled',
      descKey: 'tenants.featureFlags.isBackgroundJobPageEnabledDesc',
    },
    {
      key: 'isAuditLogPageEnabled',
      labelKey: 'tenants.featureFlags.isAuditLogPageEnabled',
      descKey: 'tenants.featureFlags.isAuditLogPageEnabledDesc',
    },
  ];

  private readonly knownFlagKeys = new Set<string>(this.knownFlags.map((f) => f.key));

  readonly flagsForm = new FormGroup({
    aiChatEnabled: new FormControl<boolean>(true, { nonNullable: true }),
    nasheedIngestionEnabled: new FormControl<boolean>(true, { nonNullable: true }),
    isBackgroundJobPageEnabled: new FormControl<boolean>(true, { nonNullable: true }),
    isAuditLogPageEnabled: new FormControl<boolean>(true, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const container = this.editorContainer();
      const config = this.tenantConfig();

      if (container && config && !this.editor) {
        const mainConfig = this.extractMainConfig(config.data);
        this.initEditor(container.nativeElement, mainConfig);
      }
    });
  }

  ngOnInit(): void {
    this.loadConfiguration();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  private extractMainConfig(data: ITenantConfiguration | undefined): Record<string, unknown> {
    if (!data) return {};
    const { featureFlags, ...mainConfig } = data as ITenantConfiguration & { featureFlags?: Record<string, boolean> };
    return mainConfig as Record<string, unknown>;
  }

  private initEditor(container: HTMLElement, content: unknown): void {
    this.editor = createJSONEditor({
      target: container,
      props: {
        mode: Mode.text,
        mainMenuBar: true,
        content: { json: content },
        validator: this.createValidator(),
        onChange: (updatedContent: Content) => {
          if ('json' in updatedContent) {
            this.currentContent = updatedContent.json;
          } else if ('text' in updatedContent) {
            try {
              this.currentContent = JSON.parse(updatedContent.text);
            } catch {
              // invalid JSON — ignore, keep last valid
            }
          }
        },
      },
    });
    this.currentContent = content;
  }

  private createValidator(): Validator {
    return () => [];
  }

  loadConfiguration(): void {
    if (!this.data.tenantId) return;

    this.isLoading.set(true);
    this._tenantService.getTenantConfig(this.data.tenantId).subscribe({
      next: (config) => {
        this.initFlagsFromConfig(config);
        this.tenantConfig.set(config);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleError(err);
        this.isLoading.set(false);
      },
    });
  }

  private initFlagsFromConfig(config: ITenantConfig): void {
    const flags = config.data?.featureFlags ?? {};

    const patch = Object.fromEntries(
      this.knownFlags.map((f) => [f.key, flags[f.key] ?? true])
    );
    this.flagsForm.patchValue(patch);

    this.originalCustomFlags = Object.fromEntries(
      Object.entries(flags).filter(([k]) => !this.knownFlagKeys.has(k))
    );
  }

  onSubmit(): void {
    const config = this.tenantConfig();
    if (!config) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    const featureFlags: Record<string, boolean> = {
      ...this.originalCustomFlags,
      ...this.flagsForm.getRawValue(),
    };

    const tenantConfiguration: ITenantConfiguration = {
      ...(this.currentContent as ITenantConfiguration),
      featureFlags,
    };

    const request: IUpdateTenantRequest = {
      tenantId: config.tenantId,
      tenantName: config.tenantName,
      startDate: config.startDate,
      expireDate: config.expireDate,
      isActive: config.isActive,
      data: tenantConfiguration,
    };

    this._tenantService
      .updateTenant(config.tenantId, request, context)
      .subscribe({
        next: () => {
          toast.success(
            this._translationService.getCachedTranslation(
              'tenants.success.configurationUpdated'
            )
          );
          this._sheetRef.close(true);
        },
        error: (err) => {
          this.handleError(err);
          this.isSaving.set(false);
        },
      });
  }

  private handleError(error: unknown): void {
    this.errorMessage.set(extractErrorMessage(error as HttpErrorResponse));
  }

  onCancel(): void {
    this._sheetRef.close();
  }
}
