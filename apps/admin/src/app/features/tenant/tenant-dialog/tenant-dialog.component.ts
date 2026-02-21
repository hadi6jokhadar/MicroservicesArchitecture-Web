import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import {
  ITenant,
  ITenantConfiguration,
  ICreateTenantRequest,
  IUpdateTenantRequest,
  TranslatePipe,
  TenantService,
  TranslationService,
  IdentityAdminService,
  AuthService,
} from '@ihsan/core';
import { extractErrorMessage, SKIP_ERROR_TOAST } from '@ihsan/shared';
import {
  ZardDialogRef,
  Z_MODAL_DATA,
  ZardFormImports,
  ZardInputDirective,
  ZardAlertComponent,
  ZardIdDirective,
  ZardButtonComponent,
  ZardDatePickerComponent,
  ZardSelectComponent,
  ZardSelectItemComponent,
  ZardComboboxComponent,
  ZardComboboxOption,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';

interface ITenantDialogForm {
  tenantId: FormControl<string>;
  tenantName: FormControl<string>;
  startDate: FormControl<Date | null>;
  expireDate: FormControl<Date | null>;
  isActive: FormControl<string>;
  userId: FormControl<string | null>;
}

interface ITenantDialogData {
  tenant?: ITenant;
}

@Component({
  selector: 'app-tenant-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ...ZardFormImports,
    ZardInputDirective,
    ZardAlertComponent,
    ZardIdDirective,
    ZardButtonComponent,
    ZardDatePickerComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardComboboxComponent,
  ],
  templateUrl: './tenant-dialog.component.html',
  styleUrls: ['./tenant-dialog.component.scss'],
})
export class TenantDialogComponent implements OnInit {
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _tenantService = inject(TenantService);
  private readonly _translationService = inject(TranslationService);
  private readonly _identityService = inject(IdentityAdminService);
  private readonly _authService = inject(AuthService);
  protected readonly data = inject<ITenantDialogData>(Z_MODAL_DATA);

  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly isEditMode = signal(false);
  readonly userOptions = signal<ZardComboboxOption[]>([]);
  readonly isSearchingUsers = signal(false);

  readonly form = new FormGroup<ITenantDialogForm>({
    tenantId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9-]+$/)],
    }),
    tenantName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl<Date | null>(new Date(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    expireDate: new FormControl<Date | null>(null, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isActive: new FormControl<string>('true', { nonNullable: true }),
    userId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
  });

  readonly existingConfig = signal<ITenantConfiguration>({});

  ngOnInit(): void {
    if (this.data?.tenant) {
      this.isEditMode.set(true);
      const tenant = this.data.tenant;

      this.form.patchValue({
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
        startDate: new Date(tenant.startDate),
        expireDate: new Date(tenant.expireDate),
        isActive: tenant.isActive ? 'true' : 'false',
      });

      this.form.controls.tenantId.disable();
      this.form.controls.userId.clearValidators();
      this.form.controls.userId.updateValueAndValidity();

      // Fetch existing config to preserve it
      this.isLoading.set(true);
      this._tenantService.getTenantConfig(tenant.tenantId).subscribe({
        next: (config) => {
          if (config.data) {
            this.existingConfig.set(config.data);
          }
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false), // Non-critical if fails, will just use empty
      });
    } else {
      // Set default expire date to 1 year from now
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      this.form.controls.expireDate.setValue(nextYear);

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
        // Fail silently for search
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.form.getRawValue();
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    if (this.isEditMode()) {
      const tenantId = this.data.tenant?.tenantId;
      if (!tenantId) return;

      const request: IUpdateTenantRequest = {
        tenantId,
        tenantName: formValue.tenantName || '',
        startDate: formValue.startDate?.toISOString() || '',
        expireDate: formValue.expireDate?.toISOString() || '',
        isActive: formValue.isActive === 'true',
        data: this.existingConfig(), // Preserve existing config
      };

      this._tenantService.updateTenant(tenantId, request, context).subscribe({
        next: () => {
          toast.success(
            this._translationService.getCachedTranslation(
              'tenants.success.tenantUpdated'
            )
          );
          this._dialogRef.close({ success: true });
        },
        error: (err) => this.handleError(err),
      });
    } else {
      const request: ICreateTenantRequest = {
        tenantId: formValue.tenantId || '',
        tenantName: formValue.tenantName || '',
        startDate: formValue.startDate?.toISOString() || '',
        expireDate: formValue.expireDate?.toISOString() || '',
        isActive: formValue.isActive === 'true',
        userId: formValue.userId ? parseInt(formValue.userId, 10) : 0,
        data: {}, // Initialize with empty config
      };

      this._tenantService.createTenant(request, context).subscribe({
        next: () => {
          toast.success(
            this._translationService.getCachedTranslation(
              'tenants.success.tenantCreated'
            )
          );
          this._dialogRef.close({ success: true });
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  private handleError(error: unknown): void {
    this.isLoading.set(false);
    this.errorMessage.set(extractErrorMessage(error as HttpErrorResponse));
  }

  onCancel(): void {
    this._dialogRef.close();
  }
}
