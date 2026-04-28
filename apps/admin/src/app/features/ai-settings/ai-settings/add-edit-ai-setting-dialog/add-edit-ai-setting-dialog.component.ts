import { HttpContext } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AiSettingsService,
  IAiProviderSetting,
  IUpsertAiProviderSettingRequest,
  MODEL_TYPE_OPTIONS,
  ModelTypeEnum,
  TranslatePipe,
} from '@ihsan/core';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import {
  ZardAlertComponent,
  ZardButtonComponent,
  ZardDialogRef,
  ZardCheckboxComponent,
  ZardFormImports,
  ZardIdDirective,
  ZardInputDirective,
  ZardSelectImports,
  Z_MODAL_DATA,
} from '@ihsan/ui';
import { AiSettingsEventsService } from '../../ai-settings-events.service';

interface IAiSettingDialogData {
  setting?: IAiProviderSetting;
}

interface IAiSettingForm {
  Key: FormControl<string>;
  ModelType: FormControl<ModelTypeEnum>;
  Provider: FormControl<string>;
  ApiKey: FormControl<string>;
  ModelName: FormControl<string>;
  TenantId: FormControl<string>;
  ApiBaseUrl: FormControl<string>;
  Temperature: FormControl<string>;
  Stream: FormControl<boolean | null>;
  MaxCompletionTokens: FormControl<string>;
  TopP: FormControl<string>;
  FrequencyPenalty: FormControl<string>;
  PresencePenalty: FormControl<string>;
  Description: FormControl<string>;
}

@Component({
  selector: 'app-add-edit-ai-setting-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ...ZardSelectImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardIdDirective,
    ZardButtonComponent,
    ZardCheckboxComponent,
  ],
  templateUrl: './add-edit-ai-setting-dialog.component.html',
  styleUrls: ['./add-edit-ai-setting-dialog.component.scss'],
})
export class AddEditAiSettingDialogComponent {
  private readonly _data = inject<IAiSettingDialogData | null>(Z_MODAL_DATA, {
    optional: true,
  });
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _aiSettingsService = inject(AiSettingsService);
  private readonly _eventsService = inject(AiSettingsEventsService);

  readonly isEditMode = signal(
    !!(this._data?.setting && (this._data.setting as any).Id)
  );
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly modelTypeOptions = MODEL_TYPE_OPTIONS;

  readonly form = new FormGroup<IAiSettingForm>({
    Key: new FormControl<string>(this._data?.setting?.Key || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    ModelType: new FormControl<ModelTypeEnum>(
      this._data?.setting?.ModelType || 'Text',
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    Provider: new FormControl<string>(this._data?.setting?.Provider || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    ApiKey: new FormControl<string>(this._data?.setting?.ApiKey || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    ModelName: new FormControl<string>(this._data?.setting?.ModelName || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    TenantId: new FormControl<string>(this._data?.setting?.TenantId || '', {
      nonNullable: true,
      validators: [Validators.maxLength(100)],
    }),
    ApiBaseUrl: new FormControl<string>(this._data?.setting?.ApiBaseUrl || '', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    Temperature: new FormControl<string>(
      this._data?.setting?.Temperature != null
        ? String(this._data.setting.Temperature)
        : '',
      { nonNullable: true, validators: [Validators.min(0), Validators.max(2)] }
    ),
    Stream: new FormControl<boolean | null>(
      this._data?.setting?.Stream ?? null
    ),
    MaxCompletionTokens: new FormControl<string>(
      this._data?.setting?.MaxCompletionTokens != null
        ? String(this._data.setting.MaxCompletionTokens)
        : '',
      { nonNullable: true, validators: [Validators.min(1)] }
    ),
    TopP: new FormControl<string>(
      this._data?.setting?.TopP != null ? String(this._data.setting.TopP) : '',
      { nonNullable: true, validators: [Validators.min(0), Validators.max(1)] }
    ),
    FrequencyPenalty: new FormControl<string>(
      this._data?.setting?.FrequencyPenalty != null
        ? String(this._data.setting.FrequencyPenalty)
        : '',
      { nonNullable: true, validators: [Validators.min(-2), Validators.max(2)] }
    ),
    PresencePenalty: new FormControl<string>(
      this._data?.setting?.PresencePenalty != null
        ? String(this._data.setting.PresencePenalty)
        : '',
      { nonNullable: true, validators: [Validators.min(-2), Validators.max(2)] }
    ),
    Description: new FormControl<string>(
      this._data?.setting?.Description || '',
      {
        nonNullable: true,
        validators: [Validators.maxLength(500)],
      }
    ),
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
    const request: IUpsertAiProviderSettingRequest = {
      Key: formValue.Key.trim(),
      ModelType: formValue.ModelType,
      Provider: formValue.Provider.trim(),
      ApiKey: formValue.ApiKey.trim(),
      ModelName: formValue.ModelName.trim(),
      TenantId: formValue.TenantId.trim() || undefined,
      ApiBaseUrl: formValue.ApiBaseUrl.trim() || null,
      Temperature:
        formValue.Temperature.trim() !== ''
          ? parseFloat(formValue.Temperature)
          : null,
      Stream: formValue.Stream,
      MaxCompletionTokens:
        formValue.MaxCompletionTokens.trim() !== ''
          ? parseInt(formValue.MaxCompletionTokens, 10)
          : null,
      TopP: formValue.TopP.trim() !== '' ? parseFloat(formValue.TopP) : null,
      FrequencyPenalty:
        formValue.FrequencyPenalty.trim() !== ''
          ? parseFloat(formValue.FrequencyPenalty)
          : null,
      PresencePenalty:
        formValue.PresencePenalty.trim() !== ''
          ? parseFloat(formValue.PresencePenalty)
          : null,
      Description: formValue.Description.trim() || null,
    };

    if (this.isEditMode() && this._data?.setting?.Id) {
      this._aiSettingsService
        .updateSetting(this._data.setting.Id, request, context)
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
      return;
    }

    this._aiSettingsService.createSetting(request, context).subscribe({
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

  onCancel(): void {
    this._dialogRef.close();
  }
}
