import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslationService, TranslatePipe } from '@ihsan/core';
import { TranslationEventsService } from '../../translation-events.service';
import {
  ZardAlertComponent,
  ZardButtonComponent,
  ZardDialogRef,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardSelectImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { HttpContext } from '@angular/common/http';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';

interface IImportForm {
  language: FormControl<string>;
  category: FormControl<string>;
  file: FormControl<File | null>;
}

@Component({
  selector: 'app-import-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardAlertComponent,
    ...ZardFormImports,
    ...ZardSelectImports,
    ZardIdDirective,
    TranslatePipe,
  ],
  templateUrl: './import-dialog.component.html',
  styleUrl: './import-dialog.component.scss',
})
export class ImportDialogComponent {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);
  private readonly _translationEvents = inject(TranslationEventsService);

  readonly isImporting = signal(false);
  readonly selectedFileName = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly importForm = new FormGroup<IImportForm>({
    language: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    category: new FormControl<string>('', { nonNullable: true }),
    file: new FormControl<File | null>(null, {
      validators: [Validators.required],
    }),
  });

  get availableLanguages() {
    return this._translationService.availableLanguages;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.importForm.patchValue({ file });
      this.selectedFileName.set(file.name);
    }
  }

  onBrowseFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: Event) => this.onFileSelected(event);
    input.click();
  }

  onImport(): void {
    if (this.importForm.invalid) {
      this.importForm.markAllAsTouched();
      return;
    }

    this.isImporting.set(true);
    this.errorMessage.set(null);
    const formValue = this.importForm.getRawValue();
    const file = formValue.file;

    if (!file) {
      this.errorMessage.set('Please select a file');
      this.isImporting.set(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const translations = JSON.parse(e.target?.result as string);
        const command = {
          translations,
          language: formValue.language,
          category: this.capitalizeFirstLetter(formValue.category || ''),
          tenantId: undefined,
        };

        const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

        this._translationService.importTranslations(command).subscribe({
          next: (result) => {
            toast.success(
              `Import successful: ${result.createdKeys} keys created, ${result.updatedValues} values updated`
            );
            this.isImporting.set(false);
            this._translationEvents.notifyTranslationKeysChanged();
            this._dialogRef.close();
          },
          error: (error) => {
            this.errorMessage.set(extractErrorMessage(error));
            this.isImporting.set(false);
          },
        });
      } catch {
        this.errorMessage.set(
          'Invalid JSON file. Please check the file format.'
        );
        this.isImporting.set(false);
      }
    };
    reader.readAsText(file);
  }

  onCancel(): void {
    this._dialogRef.close();
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
