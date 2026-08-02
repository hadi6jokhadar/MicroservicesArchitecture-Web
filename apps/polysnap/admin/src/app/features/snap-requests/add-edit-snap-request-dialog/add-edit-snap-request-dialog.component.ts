import { Component, inject, signal } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslationService } from '@ihsan/core';
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
import { toast } from 'ngx-sonner';
import {
  ICreateSnapRequestCommand,
  ISnapRequestDto,
  IUpdateSnapRequestCommand,
} from '../models';
import { SnapRequestService } from '../snap-request.service';
import { SnapRequestEventsService } from '../snap-request-events.service';

interface ISnapRequestForm {
  name: FormControl<string>;
  rawGeometryGeoJson: FormControl<string>;
  threshold: FormControl<number>;
}

@Component({
  selector: 'app-add-edit-snap-request-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardAlertComponent,
    TranslatePipe,
    ...ZardFormImports,
    ZardIdDirective,
  ],
  templateUrl: './add-edit-snap-request-dialog.component.html',
  styleUrls: ['./add-edit-snap-request-dialog.component.scss'],
})
export class AddEditSnapRequestDialogComponent {
  private readonly _data = inject<{ snapRequest?: ISnapRequestDto }>(
    Z_MODAL_DATA
  );
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _snapRequestService = inject(SnapRequestService);
  private readonly _translationService = inject(TranslationService);
  private readonly _snapRequestEvents = inject(SnapRequestEventsService);

  readonly snapRequest = signal<ISnapRequestDto | undefined>(
    this._data?.snapRequest
  );
  readonly isEditMode = signal(!!this._data?.snapRequest);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Not part of the submitted payload — read-only display only, populated by a future
  // snapping-engine phase. Never editable, never required.
  readonly snappedGeometryGeoJson = signal<string>(
    this._data?.snapRequest?.snappedGeometryGeoJson || ''
  );

  readonly snapRequestForm = new FormGroup<ISnapRequestForm>({
    name: new FormControl<string>(this._data?.snapRequest?.name || '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    rawGeometryGeoJson: new FormControl<string>(
      this._data?.snapRequest?.rawGeometryGeoJson || '',
      {
        nonNullable: true,
        validators: [Validators.required],
      }
    ),
    threshold: new FormControl<number>(
      this._data?.snapRequest?.threshold ?? 0.5,
      {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }
    ),
  });

  onCancel(): void {
    this._dialogRef.close();
  }

  onSubmit(): void {
    if (this.snapRequestForm.invalid) {
      this.snapRequestForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const formValue = this.snapRequestForm.getRawValue();
    // The z-input value accessor always writes back a string, even for
    // type="number" fields — coerce explicitly before sending to the API.
    const threshold = Number(formValue.threshold);
    const context = new HttpContext().set(SKIP_ERROR_TOAST, true);

    if (this.isEditMode()) {
      const existing = this.snapRequest();
      if (!existing) {
        return;
      }

      const command: IUpdateSnapRequestCommand = {
        name: formValue.name,
        rawGeometryGeoJson: formValue.rawGeometryGeoJson,
        threshold,
      };

      this._snapRequestService
        .updateSnapRequest(existing.id, command, context)
        .subscribe({
          next: (result) => {
            toast.success(
              this._translationService.getCachedTranslation(
                '#polysnap#.snapRequests.success.updated'
              )
            );
            this._snapRequestEvents.notifySnapRequestsChanged();
            this._dialogRef.close(result);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.errorMessage.set(extractErrorMessage(error));
          },
        });
    } else {
      const command: ICreateSnapRequestCommand = {
        name: formValue.name,
        rawGeometryGeoJson: formValue.rawGeometryGeoJson,
        threshold,
      };

      this._snapRequestService.createSnapRequest(command, context).subscribe({
        next: (result) => {
          toast.success(
            this._translationService.getCachedTranslation(
              '#polysnap#.snapRequests.success.created'
            )
          );
          this._snapRequestEvents.notifySnapRequestsChanged();
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
