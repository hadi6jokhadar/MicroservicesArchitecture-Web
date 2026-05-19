import { HttpContext } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CategoryService,
  FileGroup,
  FileType,
  ICategoryDto,
  ICreateCategoryRequest,
  IFileManagerResponse,
  IUpdateCategoryRequest,
  TranslatePipe,
  TranslationService,
} from '@ihsan/core';
import { FileSelectorComponent } from '@ihsan/shared';
import { SKIP_ERROR_TOAST, extractErrorMessage } from '@ihsan/shared';
import {
  Z_MODAL_DATA,
  ZardAlertComponent,
  ZardButtonComponent,
  ZardDialogRef,
  ZardFormImports,
  ZardIdDirective,
  ZardInputDirective,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { CategoryEventsService } from '../../category-events.service';

interface ICategoryForm {
  slug: FormControl<string>;
  uri: FormControl<string>;
  nameEn: FormControl<string>;
  nameAr: FormControl<string>;
  iconName: FormControl<string>;
  parentId: FormControl<string>;
  iconFileId: FormControl<number | null>;
  imageFileId: FormControl<number | null>;
}

@Component({
  selector: 'app-add-edit-category-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardAlertComponent,
    TranslatePipe,
    ...ZardFormImports,
    ZardIdDirective,
    FileSelectorComponent,
  ],
  templateUrl: './add-edit-category-dialog.component.html',
  styleUrls: ['./add-edit-category-dialog.component.scss'],
})
export class AddEditCategoryDialogComponent {
  private readonly _data = inject<{ category?: ICategoryDto }>(Z_MODAL_DATA);
  private readonly _dialogRef = inject(ZardDialogRef);
  private readonly _categoryService = inject(CategoryService);
  private readonly _categoryEvents = inject(CategoryEventsService);
  private readonly _translationService = inject(TranslationService);

  readonly category = signal<ICategoryDto | undefined>(this._data?.category);
  readonly isEditMode = signal(!!this._data?.category);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  protected readonly FileType = FileType;
  protected readonly FileGroup = FileGroup;

  readonly existingIconFiles: IFileManagerResponse[] = this._data?.category
    ?.iconFile
    ? [this._data.category.iconFile]
    : [];
  readonly existingImageFiles: IFileManagerResponse[] = this._data?.category
    ?.imageFile
    ? [this._data.category.imageFile]
    : [];

  readonly categoryForm = new FormGroup<ICategoryForm>({
    slug: new FormControl<string>(this._data?.category?.slug ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    uri: new FormControl<string>(this._data?.category?.uri ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    nameEn: new FormControl<string>(
      this._data?.category?.nameTranslations?.['en'] ?? '',
      {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      },
    ),
    nameAr: new FormControl<string>(
      this._data?.category?.nameTranslations?.['ar'] ?? '',
      {
        nonNullable: true,
        validators: [Validators.maxLength(200)],
      },
    ),
    iconName: new FormControl<string>(this._data?.category?.iconName ?? '', {
      nonNullable: true,
    }),
    parentId: new FormControl<string>(
      this._data?.category?.parentId != null
        ? String(this._data.category.parentId)
        : '',
      { nonNullable: true },
    ),
    iconFileId: new FormControl<number | null>(
      this._data?.category?.iconFileId ?? null,
    ),
    imageFileId: new FormControl<number | null>(
      this._data?.category?.imageFileId ?? null,
    ),
  });

  onIconFileSelected(files: IFileManagerResponse[]): void {
    this.categoryForm.controls.iconFileId.setValue(
      files.length > 0 ? files[0].id : null,
    );
  }

  onImageFileSelected(files: IFileManagerResponse[]): void {
    this.categoryForm.controls.imageFileId.setValue(
      files.length > 0 ? files[0].id : null,
    );
  }

  onCancel(): void {
    this._dialogRef.close();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.categoryForm.getRawValue();
    const nameTranslations: Record<string, string> = {};
    if (formValue.nameEn) nameTranslations['en'] = formValue.nameEn;
    if (formValue.nameAr) nameTranslations['ar'] = formValue.nameAr;

    const parentId = formValue.parentId
      ? parseInt(formValue.parentId, 10)
      : undefined;

    const ctx = new HttpContext().set(SKIP_ERROR_TOAST, true);

    if (this.isEditMode()) {
      const categoryId = this._data?.category?.id;
      if (!categoryId) return;

      const request: IUpdateCategoryRequest = {
        id: categoryId,
        slug: formValue.slug,
        uri: formValue.uri || undefined,
        nameTranslations,
        iconName: formValue.iconName || null,
        iconFileId: formValue.iconFileId ?? null,
        imageFileId: formValue.imageFileId ?? null,
      };

      this._categoryService.update(categoryId, request, ctx).subscribe({
        next: () => {
          toast.success(
            this._translationService.getCachedTranslation(
              'category.success.updated',
            ),
          );
          this._categoryEvents.notifyDataChanged();
          this._dialogRef.close({ success: true });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(err));
        },
      });
    } else {
      const request: ICreateCategoryRequest = {
        slug: formValue.slug,
        uri: formValue.uri || '',
        nameTranslations,
        parentId,
        iconName: formValue.iconName || undefined,
        iconFileId: formValue.iconFileId ?? undefined,
        imageFileId: formValue.imageFileId ?? undefined,
      };

      this._categoryService.create(request, ctx).subscribe({
        next: () => {
          toast.success(
            this._translationService.getCachedTranslation(
              'category.success.created',
            ),
          );
          this._categoryEvents.notifyDataChanged();
          this._dialogRef.close({ success: true });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(extractErrorMessage(err));
        },
      });
    }
  }
}
