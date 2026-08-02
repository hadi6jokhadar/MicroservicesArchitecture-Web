import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RtlService, TranslatePipe, TranslationService } from '@ihsan/core';
import {
  ZardAlertDialogService,
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardCardComponent,
  ZardDialogService,
  ZardDropdownImports,
  ZardEmptyComponent,
  ZardFormImports,
  ZardIconComponent,
  ZardIdDirective,
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardSheetService,
  ZardTableImports,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { ISnapRequestDto, IGetSnapRequestsQuery } from './models';
import { SnapRequestService } from './snap-request.service';
import { SnapRequestEventsService } from './snap-request-events.service';
import { AddEditSnapRequestDialogComponent } from './add-edit-snap-request-dialog/add-edit-snap-request-dialog.component';
import { ViewSnapRequestSheetComponent } from './view-snap-request-sheet/view-snap-request-sheet.component';

interface ISnapRequestFilterForm {
  searchTerm: FormControl<string>;
}

@Component({
  selector: 'app-snap-requests',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    TranslatePipe,
    ...ZardDropdownImports,
    ...ZardFormImports,
    ...ZardPaginationImports,
    ...ZardTableImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardIdDirective,
  ],
  templateUrl: './snap-requests.component.html',
  styleUrls: ['./snap-requests.component.scss'],
})
export class SnapRequestsComponent implements OnInit {
  private readonly _snapRequestService = inject(SnapRequestService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _rtlService = inject(RtlService);
  private readonly _translationService = inject(TranslationService);
  private readonly _snapRequestEvents = inject(SnapRequestEventsService);

  // Signals
  readonly snapRequests = signal<ISnapRequestDto[]>([]);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  // Filter Form
  readonly filterForm = new FormGroup<ISnapRequestFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
  });

  constructor() {
    // Watch for page changes and reload snap requests
    effect(() => {
      const page = this.currentPage();
      if (page > 1) {
        this.loadSnapRequests();
      }
    });

    // Reload on dialog/sheet success events
    this._snapRequestEvents.snapRequestsChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.loadSnapRequests();
      });
  }

  ngOnInit(): void {
    this.loadSnapRequests();
  }

  loadSnapRequests(): void {
    this.isLoading.set(true);

    const formValue = this.filterForm.getRawValue();

    const query: IGetSnapRequestsQuery = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      textFilter: formValue.searchTerm || undefined,
    };

    this._snapRequestService.getSnapRequests(query).subscribe({
      next: (response) => {
        this.snapRequests.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading snap requests:', error);
        toast.error(
          this._translationService.getCachedTranslation(
            '#polysnap#.snapRequests.error.loadFailed'
          )
        );
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadSnapRequests();
  }

  onClearFilters(): void {
    this.filterForm.reset({ searchTerm: '' });
    this.currentPage.set(1);
    this.loadSnapRequests();
  }

  onAddSnapRequest(): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        '#polysnap#.snapRequests.dialog.addTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#polysnap#.snapRequests.dialog.addDescription'
      ),
      zContent: AddEditSnapRequestDialogComponent,
      zHideFooter: true,
      zWidth: '550px',
    });
  }

  onViewSnapRequest(snapRequest: ISnapRequestDto): void {
    this._sheetService.create({
      zContent: ViewSnapRequestSheetComponent,
      zData: { snapRequest },
      zSide: this._rtlService.getSheetSide('right'),
      zClosable: false,
      zHideFooter: true,
    });
  }

  onEditSnapRequest(snapRequest: ISnapRequestDto): void {
    this._dialogService.create({
      zTitle: this._translationService.getCachedTranslation(
        '#polysnap#.snapRequests.dialog.editTitle'
      ),
      zDescription: this._translationService.getCachedTranslation(
        '#polysnap#.snapRequests.dialog.editDescription'
      ),
      zContent: AddEditSnapRequestDialogComponent,
      zData: { snapRequest },
      zHideFooter: true,
      zClosable: true,
      zWidth: '550px',
    });
  }

  onDeleteSnapRequest(snapRequest: ISnapRequestDto): void {
    this._alertDialogService.confirm({
      zTitle: this._translationService.getCachedTranslation(
        '#polysnap#.snapRequests.dialog.deleteTitle'
      ),
      zDescription: this._translationService
        .getCachedTranslation('#polysnap#.snapRequests.dialog.deleteDescription')
        .replace('{name}', snapRequest.name),
      zOkText: this._translationService.getCachedTranslation('common.delete'),
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: true,
      zOnOk: () => {
        this._snapRequestService
          .deleteSnapRequest(snapRequest.id)
          .subscribe({
            next: () => {
              toast.success(
                this._translationService.getCachedTranslation(
                  '#polysnap#.snapRequests.success.deleted'
                )
              );
              this.loadSnapRequests();
            },
            error: (error) => {
              console.error('Error deleting snap request:', error);
              toast.error(
                this._translationService.getCachedTranslation(
                  '#polysnap#.snapRequests.error.deleteFailed'
                )
              );
            },
          });
      },
    });
  }

  getStatusBadgeType(status: boolean): 'default' | 'destructive' {
    return status ? 'default' : 'destructive';
  }
}
