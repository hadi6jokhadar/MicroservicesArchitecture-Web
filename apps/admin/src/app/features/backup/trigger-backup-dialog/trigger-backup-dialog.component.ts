import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import {
  BackupService,
  ITriggerBackupRequest,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import { extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';
import {
  ZardDialogRef,
  ZardFormImports,
  ZardInputDirective,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardAlertComponent,
  ZardButtonComponent,
  ZardIconComponent,
  ZardIdDirective,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { BackupEventsService } from '../backup-events.service';

interface ITriggerBackupForm {
  scope: FormControl<'GlobalService' | 'Tenant'>;
  serviceName: FormControl<string>;
  tenantId: FormControl<string>;
}

/** Mirrors Backup:GlobalTargets in the backend's appsettings.json (no "list known services" endpoint exists). */
export const KNOWN_GLOBAL_SERVICES: { value: string; labelKey: string }[] = [
  { value: 'IdentityService', labelKey: 'backup.triggerDialog.services.identity' },
  { value: 'FileManagerService', labelKey: 'backup.triggerDialog.services.fileManager' },
  { value: 'CategoryService', labelKey: 'backup.triggerDialog.services.category' },
  { value: 'NasheedService', labelKey: 'backup.triggerDialog.services.nasheed' },
  { value: 'NotificationService', labelKey: 'backup.triggerDialog.services.notification' },
  { value: 'TenantService', labelKey: 'backup.triggerDialog.services.tenant' },
  { value: 'TranslationService', labelKey: 'backup.triggerDialog.services.translation' },
  { value: 'AIService', labelKey: 'backup.triggerDialog.services.ai' },
];

@Component({
  selector: 'app-trigger-backup-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardAlertComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardIdDirective,
  ],
  templateUrl: './trigger-backup-dialog.component.html',
  styleUrls: ['./trigger-backup-dialog.component.scss'],
})
export class TriggerBackupDialogComponent {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _backupService = inject(BackupService);
  private readonly _translationService = inject(TranslationService);
  private readonly _backupEvents = inject(BackupEventsService);

  readonly knownServices = KNOWN_GLOBAL_SERVICES;
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly form = new FormGroup<ITriggerBackupForm>({
    scope: new FormControl<'GlobalService' | 'Tenant'>('GlobalService', { nonNullable: true }),
    serviceName: new FormControl<string>('', { nonNullable: true }),
    tenantId: new FormControl<string>('', { nonNullable: true }),
  });

  onSubmit(): void {
    this.errorMessage.set(null);
    const { scope, serviceName, tenantId } = this.form.getRawValue();

    if (scope === 'GlobalService' && !serviceName) {
      this.errorMessage.set(
        this._translationService.getCachedTranslation('backup.triggerDialog.validationRequired')
      );
      return;
    }
    if (scope === 'Tenant' && !tenantId.trim()) {
      this.errorMessage.set(
        this._translationService.getCachedTranslation('backup.triggerDialog.validationRequired')
      );
      return;
    }

    this.isLoading.set(true);

    const request: ITriggerBackupRequest = {
      scope,
      serviceName: scope === 'GlobalService' ? serviceName : undefined,
      tenantId: scope === 'Tenant' ? tenantId.trim() : undefined,
    };

    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    this._backupService.triggerBackup(request, context).subscribe({
      next: () => {
        toast.success(
          this._translationService.getCachedTranslation('backup.triggerDialog.success')
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
