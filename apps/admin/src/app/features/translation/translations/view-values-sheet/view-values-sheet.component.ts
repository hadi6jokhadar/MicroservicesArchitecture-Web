import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ITranslationKeyDto,
  ITranslationValueDto,
  ISetTranslationCommand,
  TranslationService,
} from '@ihsan/core';
import {
  ZardAlertDialogService,
  ZardAlertComponent,
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardSheetRef,
  Z_SHEET_DATA,
  ZardEmptyComponent,
  ZardDropdownImports,
} from '@ihsan/ui';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import { TranslationEventsService } from '../../translation-events.service';

interface IEditValueForm {
  language: FormControl<string>;
  value: FormControl<string>;
  tenantId: FormControl<string>;
}

@Component({
  selector: 'app-view-values-sheet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardBadgeComponent,
    ZardAlertComponent,
    ...ZardFormImports,
    ZardIconComponent,
    ZardIdDirective,
    ZardEmptyComponent,
    ...ZardDropdownImports,
  ],
  templateUrl: './view-values-sheet.component.html',
  styleUrls: ['./view-values-sheet.component.scss'],
})
export class ViewValuesSheetComponent implements OnInit {
  private readonly _data = inject<{ translationKey: ITranslationKeyDto }>(
    Z_SHEET_DATA
  );
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _translationService = inject(TranslationService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _translationEvents = inject(TranslationEventsService);

  readonly translationKey = signal<ITranslationKeyDto>(
    this._data.translationKey
  );
  readonly values = signal<ITranslationValueDto[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly editingValue = signal<ITranslationValueDto | null>(null);
  readonly isAddMode = signal(false);

  // Edit Form
  readonly editForm = new FormGroup<IEditValueForm>({
    language: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(5),
      ],
    }),
    value: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tenantId: new FormControl<string>('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.values.set(this.translationKey().values || []);
  }

  onClose(): void {
    this._sheetRef.close();
  }

  onAddValue(): void {
    this.isAddMode.set(true);
    this.isEditMode.set(false);
    this.editingValue.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.editForm.reset({
      language: '',
      value: '',
      tenantId: '',
    });
  }

  onEditValue(value: ITranslationValueDto): void {
    this.isEditMode.set(true);
    this.isAddMode.set(false);
    this.editingValue.set(value);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.editForm.patchValue({
      language: value.language,
      value: value.value,
      tenantId: value.tenantId || '',
    });
  }

  onCancelEdit(): void {
    this.isEditMode.set(false);
    this.isAddMode.set(false);
    this.editingValue.set(null);
    this.errorMessage.set(null);
    this.editForm.reset();
  }

  onSaveValue(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const formValue = this.editForm.getRawValue();

    const command: ISetTranslationCommand = {
      key: this.translationKey().key,
      language: formValue.language,
      value: formValue.value,
      tenantId: formValue.tenantId || undefined, // Empty string = global translation
      category: this.translationKey().category || 'General',
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._translationService.setTranslation(command, context).subscribe({
      next: (result) => {
        this.successMessage.set(
          this.isAddMode()
            ? 'Translation value added successfully'
            : 'Translation value updated successfully'
        );

        // Update values list
        const currentValues = this.values();
        if (this.isAddMode()) {
          this.values.set([...currentValues, result]);
        } else {
          const index = currentValues.findIndex((v) => v.id === result.id);
          if (index !== -1) {
            const updatedValues = [...currentValues];
            updatedValues[index] = result;
            this.values.set(updatedValues);
          }
        }

        // Notify parent to reload translation keys (updates value count)
        this._translationEvents.notifyTranslationKeysChanged();

        // Close form without clearing success message
        this.isEditMode.set(false);
        this.isAddMode.set(false);
        this.editingValue.set(null);
        this.editForm.reset();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      },
    });
  }

  onDeleteValue(value: ITranslationValueDto): void {
    this._alertDialogService.confirm({
      zTitle: 'Delete Translation Value',
      zDescription: `Are you sure you want to delete the "${value.language}" translation? This action cannot be undone.`,
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zOnOk: () => {
        this._translationService.deleteTranslationValue(value.id).subscribe({
          next: () => {
            this.successMessage.set('Translation value deleted successfully');

            // Remove from values list
            const currentValues = this.values();
            this.values.set(currentValues.filter((v) => v.id !== value.id));

            // Notify parent to reload translation keys (updates value count)
            this._translationEvents.notifyTranslationKeysChanged();
          },
          error: () => {
            this.errorMessage.set('Failed to delete translation value');
          },
        });
      },
    });
  }

  getTenantBadgeType(
    hasTenant: boolean
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    return hasTenant ? 'outline' : 'default';
  }

  getTenantLabel(value: ITranslationValueDto): string {
    return value.tenantId ? 'Tenant-specific' : 'Global';
  }
}
