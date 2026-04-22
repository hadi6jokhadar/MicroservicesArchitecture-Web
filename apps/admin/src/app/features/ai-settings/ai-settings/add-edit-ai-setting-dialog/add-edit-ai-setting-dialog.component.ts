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

  readonly isEditMode = signal(!!this._data?.setting);
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
