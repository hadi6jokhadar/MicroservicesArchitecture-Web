import { CommonModule } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  AiSystemPromptsService,
  IAiSystemPrompt,
  IUpsertAiSystemPromptRequest,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import { Z_SHEET_DATA, ZardButtonComponent, ZardSheetRef } from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import {
  Content,
  JsonEditor,
  Mode,
  createJSONEditor,
} from 'vanilla-jsoneditor';
import { AiSystemPromptsEventsService } from '../../ai-system-prompts-events.service';

interface IAiSystemPromptResponseFormatSheetData {
  prompt: IAiSystemPrompt;
}

@Component({
  selector: 'app-ai-system-prompt-response-format-sheet',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ZardButtonComponent],
  templateUrl: './ai-system-prompt-response-format-sheet.component.html',
  styleUrls: ['./ai-system-prompt-response-format-sheet.component.scss'],
})
export class AiSystemPromptResponseFormatSheetComponent implements OnDestroy {
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _service = inject(AiSystemPromptsService);
  private readonly _translationService = inject(TranslationService);
  private readonly _eventsService = inject(AiSystemPromptsEventsService);
  protected readonly data =
    inject<IAiSystemPromptResponseFormatSheetData>(Z_SHEET_DATA);

  readonly editorContainer = viewChild<ElementRef>('editorContainer');
  private editor: JsonEditor | null = null;
  private currentContent: unknown = null;

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const container = this.editorContainer();
      if (container && !this.editor) {
        const initialValue = this._parseResponseFormat(
          this.data.prompt.ResponseFormat
        );
        this.currentContent = initialValue;
        this.editor = createJSONEditor({
          target: container.nativeElement,
          props: {
            mode: Mode.text,
            mainMenuBar: true,
            content: { json: initialValue ?? {} },
            onChange: (updatedContent: Content) => {
              if ('json' in updatedContent) {
                this.currentContent = updatedContent.json ?? null;
              } else if ('text' in updatedContent) {
                try {
                  this.currentContent = updatedContent.text
                    ? JSON.parse(updatedContent.text)
                    : null;
                } catch {
                  // invalid JSON — leave currentContent as-is
                }
              }
            },
          },
        });
      }
    });
  }

  private _parseResponseFormat(raw: unknown): unknown {
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  onSubmit(): void {
    const prompt = this.data.prompt;
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const responseFormatString =
      this.currentContent != null ? JSON.stringify(this.currentContent) : null;

    const request: IUpsertAiSystemPromptRequest = {
      Name: prompt.Name,
      PromptText: prompt.PromptText,
      TenantId: prompt.TenantId ?? null,
      ResponseFormat: responseFormatString,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._service.updatePrompt(prompt.Id, request, context).subscribe({
      next: () => {
        toast.success(
          this._translationService.getCachedTranslation(
            'aiSystemPrompts.messages.responseFormatUpdated'
          )
        );
        this._eventsService.notifyDataChanged();
        this._sheetRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(extractErrorMessage(err));
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this._sheetRef.close();
  }
}
