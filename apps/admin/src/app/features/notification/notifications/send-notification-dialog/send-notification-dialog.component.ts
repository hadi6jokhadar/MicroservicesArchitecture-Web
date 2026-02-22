import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ZardSheetRef,
  ZardFormImports,
  ZardButtonComponent,
  ZardInputDirective,
  ZardAlertComponent,
  ZardSelectImports,
  ZardIdDirective,
  ZardTabComponent,
  ZardTabGroupComponent,
  ZardIconComponent,
  ZardComboboxComponent,
  ZardComboboxOption,
} from '@ihsan/ui';
import {
  NotificationService,
  ISendNotificationRequest,
  TranslatePipe,
  TranslationService,
  TenantService,
  AuthService,
  IdentityAdminService,
} from '@ihsan/core';
import { extractErrorMessage } from '@ihsan/shared';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { NotificationEventsService } from '../../notification-events.service';

@Component({
  selector: 'app-send-notification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardInputDirective,
    ...ZardFormImports,
    ...ZardSelectImports,
    ZardAlertComponent,
    ZardIdDirective,
    ZardTabComponent,
    ZardTabGroupComponent,
    ZardIconComponent,
    ZardComboboxComponent,
  ],
  templateUrl: './send-notification-dialog.component.html',
  styleUrls: ['./send-notification-dialog.component.scss'],
})
export class SendNotificationDialogComponent implements OnInit {
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translationService = inject(TranslationService);
  private readonly _notificationEvents = inject(NotificationEventsService);
  readonly _tenantService = inject(TenantService);
  private readonly _authService = inject(AuthService);
  private readonly _identityService = inject(IdentityAdminService);

  readonly userOptions = signal<ZardComboboxOption[]>([]);
  readonly isSearchingUsers = signal(false);

  readonly form = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    message: new FormControl('', { nonNullable: true }),
    tenantId: new FormControl<string | null>(
      this._tenantService.currentTenantId()
    ),
    userId: new FormControl<string | null>(null),
    deliveryType: new FormControl<string>('Both', { nonNullable: true }),
    priority: new FormControl<string>('Immediate', { nonNullable: true }),
  });

  isSubmitting = false;
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    // Make tenantId required when userId is selected
    this.form.controls.userId.valueChanges.subscribe((userId) => {
      if (userId) {
        this.form.controls.tenantId.setValidators([Validators.required]);
      } else {
        this.form.controls.tenantId.clearValidators();
      }
      this.form.controls.tenantId.updateValueAndValidity();
    });

    // Set default user as current user
    const currentUser = this._authService.currentUser();
    if (currentUser) {
      this.userOptions.set([
        {
          value: currentUser.id.toString(),
          label: `${currentUser.firstName} ${currentUser.lastName} (${currentUser.email})`,
        },
      ]);
      this.form.controls.userId.setValue(currentUser.id.toString());
    }

    // Initial load of users
    this.onUserSearch('');
  }

  onUserSearch(query: string): void {
    this.isSearchingUsers.set(true);
    const request = {
      searchTerm: query,
      pageNumber: 1,
      pageSize: 10,
    };

    this._identityService.getUsers(request).subscribe({
      next: (response) => {
        const options: ZardComboboxOption[] = response.items.map((user) => ({
          value: user.id.toString(),
          label: `${user.firstName} ${user.lastName} (${user.email})`,
        }));

        this.userOptions.set(options);
        this.isSearchingUsers.set(false);
      },
      error: () => {
        this.isSearchingUsers.set(false);
      },
    });
  }

  clearUserId(): void {
    this.form.controls.userId.setValue(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage.set(null);
    const request: ISendNotificationRequest = {
      title: this.form.controls.title.value,
      message: this.form.controls.message.value || undefined,
      tenantId: this.form.controls.tenantId.value || undefined,
      userId: this.form.controls.userId.value
        ? Number(this.form.controls.userId.value)
        : undefined,
      deliveryType: this.form.controls.deliveryType.value,
      priority: this.form.controls.priority.value,
    };

    this._notificationService.sendNotification(request).subscribe({
      next: () => {
        toast.success(
          this._translationService.getCachedTranslation(
            'notifications.messages.sendSuccess'
          )
        );
        this._notificationEvents.notifyDataChanged();
        this._sheetRef.close();
      },
      error: (err: HttpErrorResponse) => {
        const detail = extractErrorMessage(err);
        this.errorMessage.set(
          detail ||
            this._translationService.getCachedTranslation(
              'notifications.messages.sendError'
            )
        );
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this._sheetRef.close();
  }
}
