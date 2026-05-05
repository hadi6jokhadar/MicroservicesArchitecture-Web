import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpContext } from '@angular/common/http';
import { TranslatePipe } from '@ihsan/core';
import {
  ZardButtonComponent,
  ZardFormImports,
  ZardInputDirective,
  ZardAlertComponent,
  ZardDialogRef,
  Z_MODAL_DATA,
  ZardIdDirective,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';
import { TranslationService } from '@ihsan/core';
import {
  GenerationService,
  GenerateLyricsCommand,
} from '@web-app/nasheed-shared';

interface IGenerationForm {
  prompt: FormControl<string>;
  language: FormControl<string>;
  style: FormControl<string | null>;
  numberOfVerses: FormControl<number>;
}

@Component({
  selector: 'app-generate-lyrics-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardIdDirective,
  ],
  templateUrl: './generate-lyrics-dialog.component.html',
  styleUrl: './generate-lyrics-dialog.component.scss',
})
export class GenerateLyricsDialogComponent {
  private readonly _generationService = inject(GenerationService);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _translationService = inject(TranslationService);

  readonly data = inject<null>(Z_MODAL_DATA);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly generatedLyrics = signal<string | null>(null);

  readonly form = new FormGroup<IGenerationForm>({
    prompt: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
    language: new FormControl<string>('ar', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    style: new FormControl<string | null>(null),
    numberOfVerses: new FormControl<number>(4, { nonNullable: true }),
  });

  onGenerate(): void {
    if (this.form.invalid || this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.generatedLyrics.set(null);
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    const cmd: GenerateLyricsCommand = {
      prompt: this.form.controls.prompt.value,
      language: this.form.controls.language.value,
      style: this.form.controls.style.value ?? undefined,
      numberOfVerses: this.form.controls.numberOfVerses.value,
    };

    this._generationService.generateLyrics(cmd, { context }).subscribe({
      next: (result) => {
        this.generatedLyrics.set(result.lyrics);
        this.isLoading.set(false);
        toast.success(
          this._translationService.getCachedTranslation(
            '#anashid#.search.generateLyrics.success',
          ),
        );
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  onClose(): void {
    this._dialogRef.close();
  }
}
