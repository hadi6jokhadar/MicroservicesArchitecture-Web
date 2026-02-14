import { CommonModule } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
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
  ZardButtonComponent,
  ZardLoaderComponent,
  ZardSheetRef,
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

@Component({
  selector: 'app-tenant-configuration-sheet',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardLoaderComponent,
  ],
  templateUrl: './tenant-configuration-sheet.component.html',
  styleUrls: ['./tenant-configuration-sheet.component.scss'],
})
export class TenantConfigurationSheetComponent implements OnInit, OnDestroy {
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _tenantService = inject(TenantService);
  private readonly _translationService = inject(TranslationService);
  protected readonly data = inject<ITenantConfigurationSheetData>(Z_SHEET_DATA);

  // ViewChild for editor container - optional because it's behind @if
  readonly editorContainer = viewChild<ElementRef>('editorContainer');
  private editor: JsonEditor | null = null;

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly tenantConfig = signal<ITenantConfig | null>(null);

  // Keep track of current content to submit
  private currentContent: unknown = {};

  constructor() {
    effect(() => {
      const container = this.editorContainer();
      const config = this.tenantConfig();

      if (container && config && !this.editor) {
        this.initEditor(container.nativeElement, config.data || {});
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

  private initEditor(container: HTMLElement, content: unknown): void {
    this.editor = createJSONEditor({
      target: container,
      props: {
        mode: Mode.text,
        mainMenuBar: true,
        content: { json: content },
        validator: this.createValidator(),
        onChange: (updatedContent: Content) => {
          // Update current content ref
          if ('json' in updatedContent) {
            this.currentContent = updatedContent.json;
          } else if ('text' in updatedContent) {
            try {
              this.currentContent = JSON.parse(updatedContent.text);
            } catch {
              // invalid json, ignore
            }
          }
        },
      },
    });
    // Initialize currentContent with the loaded data
    this.currentContent = content;
  }

  private createValidator(): Validator {
    return () => {
      // Optional: Add custom validation logic here if needed
      // vanilla-jsoneditor handles syntax validation automatically
      return [];
    };
  }

  loadConfiguration(): void {
    if (!this.data.tenantId) return;

    this.isLoading.set(true);
    this._tenantService.getTenantConfig(this.data.tenantId).subscribe({
      next: (config) => {
        this.tenantConfig.set(config);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleError(err);
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    const config = this.tenantConfig();
    if (!config) return;

    // Optional: Get latest content from editor directly to be safe
    // But onChange handling should be sufficient if no bugs.

    // We can validate if currentContent is valid JSON object if needed.

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    const tenantConfiguration: ITenantConfiguration = this
      .currentContent as ITenantConfiguration;

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
