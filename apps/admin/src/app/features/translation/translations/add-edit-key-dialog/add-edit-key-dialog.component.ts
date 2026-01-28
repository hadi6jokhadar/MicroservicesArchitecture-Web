import { Component, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ITranslationKeyDto,
  ICreateTranslationKeyCommand,
  IUpdateTranslationKeyCommand,
  TranslationService,
} from '@ihsan/core';
import {
  ZardAlertComponent,
  ZardButtonComponent,
  ZardDialogRef,
  ZardFormImports,
  ZardIdDirective,
  ZardInputDirective,
  Z_MODAL_DATA,
} from '@ihsan/ui';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import { TranslationEventsService } from '../../translation-events.service';

interface IKeyForm {
  key: FormControl<string>;
  category: FormControl<string>;
  description: FormControl<string>;
}

@Component({
  selector: 'app-add-edit-key-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardAlertComponent,
    ...ZardFormImports,
    ZardIdDirective,
  ],
  templateUrl: './add-edit-key-dialog.component.html',
  styleUrls: ['./add-edit-key-dialog.component.scss'],
})
export class AddEditKeyDialogComponent {
  private readonly _data = inject<{ translationKey?: ITranslationKeyDto }>(
    Z_MODAL_DATA
  );
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);
  private readonly _translationEvents = inject(TranslationEventsService);

  readonly translationKey = signal<ITranslationKeyDto | undefined>(
    this._data?.translationKey
  );
  readonly isEditMode = signal(!!this._data?.translationKey);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly keyForm = new FormGroup<IKeyForm>({
    key: new FormControl<string>(this._data?.translationKey?.key || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    category: new FormControl<string>(
      this._data?.translationKey?.category || '',
      {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }
    ),
    description: new FormControl<string>(
      this._data?.translationKey?.description || '',
      {
        nonNullable: true,
        validators: [Validators.maxLength(500)],
      }
    ),
  });

  constructor() {
    // Disable key and category in edit mode - backend only allows updating description
    if (this.isEditMode()) {
      this.keyForm.get('key')?.disable();
      this.keyForm.get('category')?.disable();
    }
  }

  onCancel(): void {
    this._dialogRef.close();
  }

  onSubmit(): void {
    if (this.keyForm.invalid) {
      this.keyForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const formValue = this.keyForm.getRawValue();
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    if (this.isEditMode()) {
      // Update existing key
      const key = this.translationKey();
      if (!key) {
        return;
      }

      const command: IUpdateTranslationKeyCommand = {
        id: key.id,
        description: formValue.description || undefined,
      };

      this._translationService
        .updateTranslationKey(command, context)
        .subscribe({
          next: (result) => {
            this._translationEvents.notifyTranslationKeysChanged();
            this._dialogRef.close(result);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(extractErrorMessage(error));
          },
        });
    } else {
      // Create new key
      const command: ICreateTranslationKeyCommand = {
        key: formValue.key,
        category: formValue.category,
        description: formValue.description || undefined,
      };

      this._translationService
        .createTranslationKey(command, context)
        .subscribe({
          next: (result) => {
            this._translationEvents.notifyTranslationKeysChanged();
            this._dialogRef.close(result);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(extractErrorMessage(error));
          },
        });
    }
  }
}
