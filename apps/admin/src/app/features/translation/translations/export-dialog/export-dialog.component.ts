import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslationService, TranslatePipe } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardDialogRef,
  ZardFormImports,
  ZardIdDirective,
  ZardInputDirective,
  ZardSelectImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';

interface IExportForm {
  language: FormControl<string>;
  category: FormControl<string>;
}

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardInputDirective,
    ...ZardFormImports,
    ...ZardSelectImports,
    ZardIdDirective,
  ],
  templateUrl: './export-dialog.component.html',
  styleUrl: './export-dialog.component.scss',
})
export class ExportDialogComponent {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);

  readonly isExporting = signal(false);

  readonly exportForm = new FormGroup<IExportForm>({
    language: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    category: new FormControl<string>('', { nonNullable: true }),
  });

  get availableLanguages() {
    return this._translationService.availableLanguages;
  }

  onExport(): void {
    if (this.exportForm.invalid) {
      this.exportForm.markAllAsTouched();
      return;
    }

    this.isExporting.set(true);
    const formValue = this.exportForm.getRawValue();

    this._translationService
      .getTranslations(formValue.language, formValue.category || undefined)
      .subscribe({
        next: (result) => {
          // Convert to JSON and download
          const dataStr = JSON.stringify(result.translations, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          const fileName = formValue.category
            ? `translations_${formValue.language}_${formValue.category}.json`
            : `translations_${formValue.language}.json`;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(url);

          toast.success(`Translations exported successfully`);
          this.isExporting.set(false);
          this._dialogRef.close();
        },
        error: () => {
          toast.error('Failed to export translations');
          this.isExporting.set(false);
        },
      });
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
