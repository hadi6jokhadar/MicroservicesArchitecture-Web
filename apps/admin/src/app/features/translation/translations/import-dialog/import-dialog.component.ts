import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IImportTranslationsResult,
  TranslationService,
  TranslatePipe,
} from '@ihsan/core';
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
import { catchError, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';

import { DragDropFilesDirective, extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';

interface ISelectedImportFile {
  file: File;
  languageControl: FormControl<string>;
  tenants: string[];
}

interface IFileImportOutcome {
  fileName: string;
  result: IImportTranslationsResult | null;
  error: string | null;
}

interface IImportForm {
  category: FormControl<string>;
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
    DragDropFilesDirective,
  ],
  templateUrl: './import-dialog.component.html',
  styleUrl: './import-dialog.component.scss',
})
export class ImportDialogComponent {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);
  private readonly _translationEvents = inject(TranslationEventsService);

  readonly isImporting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly importAttempted = signal(false);
  readonly selectedFiles = signal<ISelectedImportFile[]>([]);

  readonly detectedTenants = computed(() =>
    Array.from(new Set(this.selectedFiles().flatMap((f) => f.tenants)))
  );

  readonly importForm = new FormGroup<IImportForm>({
    category: new FormControl<string>('General', { nonNullable: true }),
  });

  get availableLanguages() {
    return this._translationService.availableLanguages;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    Array.from(input.files ?? []).forEach((file) => this._addFile(file));
    input.value = '';
  }

  onFileDropped(event: DragEvent): void {
    Array.from(event.dataTransfer?.files ?? []).forEach((file) =>
      this._addFile(file)
    );
  }

  private _addFile(file: File): void {
    if (this.selectedFiles().some((f) => f.file.name === file.name)) {
      return;
    }

    this.importAttempted.set(false);
    const languageCode = file.name.split('.')[0] ?? '';
    const languageControl = new FormControl<string>(languageCode, {
      nonNullable: true,
      validators: [Validators.required],
    });

    this.selectedFiles.update((files) => [
      ...files,
      { file, languageControl, tenants: [] },
    ]);

    this._detectTenants(file);
  }

  private _detectTenants(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as Record<
          string,
          string
        >;
        const tenants = new Set<string>();
        const tenantPattern = /^#([^#]+)#/;
        for (const key of Object.keys(json)) {
          const match = tenantPattern.exec(key);
          if (match) {
            tenants.add(match[1]);
          }
        }
        this.selectedFiles.update((files) =>
          files.map((f) =>
            f.file === file ? { ...f, tenants: Array.from(tenants) } : f
          )
        );
      } catch {
        // ignore preview errors — the actual import will surface the error
      }
    };
    reader.readAsText(file);
  }

  removeFile(file: File): void {
    this.selectedFiles.update((files) => files.filter((f) => f.file !== file));
  }

  onBrowseFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true;
    input.onchange = (event: Event) => this.onFileSelected(event);
    input.click();
  }

  onImport(): void {
    const files = this.selectedFiles();
    if (files.length === 0) {
      this.importAttempted.set(true);
      return;
    }

    if (files.some((f) => f.languageControl.invalid)) {
      files.forEach((f) => f.languageControl.markAsTouched());
      return;
    }

    this.isImporting.set(true);
    this.errorMessage.set(null);
    const category = this.capitalizeFirstLetter(
      this.importForm.getRawValue().category || ''
    );
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    forkJoin(
      files.map((entry) => this._importFile(entry, category, context))
    ).subscribe((outcomes) => {
      this.isImporting.set(false);
      const succeeded = outcomes.filter((o) => o.result);
      const failed = outcomes.filter((o) => o.error);

      if (succeeded.length > 0) {
        this._translationEvents.notifyTranslationKeysChanged();
        const totals = succeeded.reduce(
          (acc, o) => ({
            createdKeys: acc.createdKeys + (o.result?.createdKeys ?? 0),
            updatedValues: acc.updatedValues + (o.result?.updatedValues ?? 0),
          }),
          { createdKeys: 0, updatedValues: 0 }
        );
        toast.success(
          this._translationService.getCachedTranslation(
            'import.importSuccess',
            '{{files}} file(s) imported: {{created}} keys created, {{updated}} values updated',
            {
              files: succeeded.length,
              created: totals.createdKeys,
              updated: totals.updatedValues,
            }
          )
        );
      }

      if (failed.length === 0) {
        this._dialogRef.close();
        return;
      }

      this.errorMessage.set(
        failed.map((f) => `${f.fileName}: ${f.error}`).join('\n')
      );
      this.selectedFiles.update((current) =>
        current.filter((f) => failed.some((fo) => fo.fileName === f.file.name))
      );
    });
  }

  private _importFile(
    entry: ISelectedImportFile,
    category: string,
    context: HttpContext
  ): Observable<IFileImportOutcome> {
    return this._readFileAsJson(entry.file).pipe(
      switchMap((translations) =>
        this._translationService.importTranslations(
          {
            translations,
            language: entry.languageControl.value,
            category,
            tenantId: undefined,
          },
          context
        )
      ),
      map(
        (result): IFileImportOutcome => ({
          fileName: entry.file.name,
          result,
          error: null,
        })
      ),
      catchError((error: unknown) =>
        of<IFileImportOutcome>({
          fileName: entry.file.name,
          result: null,
          error: this._describeError(error),
        })
      )
    );
  }

  private _readFileAsJson(file: File): Observable<Record<string, string>> {
    return from(file.text()).pipe(
      map((text) => JSON.parse(text) as Record<string, string>)
    );
  }

  private _describeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return extractErrorMessage(error);
    }
    return this._translationService.getCachedTranslation(
      'import.invalidJsonFile',
      'Invalid JSON file. Please check the file format.'
    );
  }

  onCancel(): void {
    this._dialogRef.close();
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
