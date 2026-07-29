import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import {
  BackupService,
  ITriggerRestoreRequest,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import { extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';
import {
  ZardDialogRef,
  Z_MODAL_DATA,
  ZardFormImports,
  ZardInputDirective,
  ZardAlertComponent,
  ZardCheckboxComponent,
  ZardButtonComponent,
  ZardAccordionComponent,
  ZardAccordionItemComponent,
  ZardIconComponent,
  ZardIdDirective,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { BackupEventsService } from '../backup-events.service';

interface IRestoreBackupForm {
  confirmRestore: FormControl<boolean>;
  targetConnectionOverride: FormControl<string>;
}

export interface RestoreBackupDialogData {
  backupRunId: number;
}

@Component({
  selector: 'app-restore-backup-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardCheckboxComponent,
    ZardButtonComponent,
    ZardAccordionComponent,
    ZardAccordionItemComponent,
    ZardIconComponent,
    ZardIdDirective,
  ],
  templateUrl: './restore-backup-dialog.component.html',
  styleUrls: ['./restore-backup-dialog.component.scss'],
})
export class RestoreBackupDialogComponent {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _backupService = inject(BackupService);
  private readonly _translationService = inject(TranslationService);
  private readonly _backupEvents = inject(BackupEventsService);
  protected readonly data = inject<RestoreBackupDialogData>(Z_MODAL_DATA);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly form = new FormGroup<IRestoreBackupForm>({
    confirmRestore: new FormControl<boolean>(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
    targetConnectionOverride: new FormControl<string>('', {
      nonNullable: true,
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
    const request: ITriggerRestoreRequest = {
      backupRunId: this.data.backupRunId,
      confirm: true,
      targetConnectionOverride: formValue.targetConnectionOverride || undefined,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._backupService
      .restoreBackup(this.data.backupRunId, request, context)
      .subscribe({
        next: () => {
          toast.success(
            this._translationService.getCachedTranslation(
              'backup.restoreDialog.success'
            )
          );
          this._backupEvents.notifyDataChanged();
          this._dialogRef.close({ success: true });
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(error));
        },
      });
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
