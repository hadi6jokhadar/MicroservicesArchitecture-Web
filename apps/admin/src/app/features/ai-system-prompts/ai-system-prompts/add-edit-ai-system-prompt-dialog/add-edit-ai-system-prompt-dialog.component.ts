import { HttpContext } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AiSystemPromptsService,
  IAiSystemPrompt,
  IUpsertAiSystemPromptRequest,
  TranslatePipe,
} from '@ihsan/core';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import {
  ZardAlertComponent,
  ZardButtonComponent,
  ZardDialogRef,
  ZardFormImports,
  ZardIdDirective,
  ZardInputDirective,
  Z_MODAL_DATA,
} from '@ihsan/ui';
import { AiSystemPromptsEventsService } from '../../ai-system-prompts-events.service';

interface IAiSystemPromptDialogData {
  prompt?: IAiSystemPrompt;
}

interface IAiSystemPromptForm {
  Name: FormControl<string>;
  PromptText: FormControl<string>;
  TenantId: FormControl<string>;
}

@Component({
  selector: 'app-add-edit-ai-system-prompt-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardIdDirective,
    ZardButtonComponent,
  ],
  templateUrl: './add-edit-ai-system-prompt-dialog.component.html',
  styleUrls: ['./add-edit-ai-system-prompt-dialog.component.scss'],
})
export class AddEditAiSystemPromptDialogComponent {
  private readonly _data = inject<IAiSystemPromptDialogData | null>(
    Z_MODAL_DATA,
    { optional: true }
  );
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _service = inject(AiSystemPromptsService);
  private readonly _eventsService = inject(AiSystemPromptsEventsService);

  readonly isEditMode = signal(!!this._data?.prompt);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = new FormGroup<IAiSystemPromptForm>({
    Name: new FormControl<string>(this._data?.prompt?.Name || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    PromptText: new FormControl<string>(this._data?.prompt?.PromptText || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(5000)],
    }),
    TenantId: new FormControl<string>(this._data?.prompt?.TenantId || '', {
      nonNullable: true,
      validators: [Validators.maxLength(100)],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);
    const request: IUpsertAiSystemPromptRequest = {
      Name: formValue.Name.trim(),
      PromptText: formValue.PromptText.trim(),
      TenantId: formValue.TenantId.trim() || null,
    };

    if (this.isEditMode()) {
      this._service
        .updatePrompt(this._data!.prompt!.Id, request, context)
        .subscribe({
          next: (result) => {
            this._eventsService.notifyDataChanged();
            this._dialogRef.close(result);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(extractErrorMessage(error));
          },
        });
    } else {
      this._service.createPrompt(request, context).subscribe({
        next: (result) => {
          this._eventsService.notifyDataChanged();
          this._dialogRef.close(result);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
