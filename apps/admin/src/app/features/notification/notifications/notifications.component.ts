import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  NotificationService,
  IQueueItemDto,
  IQueueItemFilterRequest,
  IPaginatedResponse,
  DeliveryType,
  Priority,
  QueueStatus,
  TranslatePipe,
  RtlService,
} from '@ihsan/core';
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
  ZardInputDirective,
  ZardLoaderComponent,
  ZardPaginationImports,
  ZardSheetService,
  ZardSwitchComponent,
  ZardTableImports,
  ZardIdDirective,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';
import { NotificationEventsService } from '../notification-events.service';
import { SendNotificationDialogComponent } from './send-notification-dialog/send-notification-dialog.component';
import { ViewQueueItemSheetComponent } from './view-queue-item-sheet/view-queue-item-sheet.component';
import { TranslationService } from '@ihsan/core';

interface INotificationFilterForm {
  searchTerm: FormControl<string>;
  isArchived: FormControl<boolean>;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardCardComponent,
    ZardBadgeComponent,
    TranslatePipe,
    DatePipe,
    ...ZardDropdownImports,
    ...ZardFormImports,
    ...ZardPaginationImports,
    ...ZardTableImports,
    ZardIconComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
    ZardSwitchComponent,
    ZardIdDirective,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  private readonly _notificationService = inject(NotificationService);
  private readonly _translationService = inject(TranslationService);
  private readonly _alertDialogService = inject(ZardAlertDialogService);
  private readonly _sheetService = inject(ZardSheetService);
  private readonly _dialogService = inject(ZardDialogService);
  private readonly _rtlService = inject(RtlService);
  private readonly _notificationEvents = inject(NotificationEventsService);

  readonly queueItems = signal<IQueueItemDto[]>([]);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly totalCount = signal(0);
  readonly pageSize = 10;

  readonly filterForm = new FormGroup<INotificationFilterForm>({
    searchTerm: new FormControl<string>('', { nonNullable: true }),
    isArchived: new FormControl<boolean>(false, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const page = this.currentPage();
      if (page > 1) {
        this.loadQueueItems();
      }
    });

    this.filterForm
      .get('isArchived')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadQueueItems();
      });

    this._notificationEvents.dataChanged$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.loadQueueItems();
      });
  }

  ngOnInit(): void {
    this.loadQueueItems();
  }

  loadQueueItems(): void {
    this.isLoading.set(true);

    const formValue = this.filterForm.getRawValue();

    const query: IQueueItemFilterRequest = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      searchTerm: formValue.searchTerm || undefined,
      isArchived: formValue.isArchived ?? false,
    };

    this._notificationService.getQueueItems(query).subscribe({
      next: (response: IPaginatedResponse<IQueueItemDto>) => {
        this.queueItems.set(response.items);
        this.totalPages.set(response.totalPages);
        this.totalCount.set(response.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error(
          this._translationService.getCachedTranslation(
            'notifications.messages.loadError'
          )
        );
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadQueueItems();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      isArchived: false,
    });
    this.currentPage.set(1);
    this.loadQueueItems();
  }

  onSendNotification(): void {
    this._sheetService.create({
      zContent: SendNotificationDialogComponent,
      zSide: this._rtlService.getSheetSide('right'),
      zClosable: false,
      zHideFooter: true,
    });
  }

  onViewItem(item: IQueueItemDto): void {
    this._sheetService.create({
      zContent: ViewQueueItemSheetComponent,
      zData: { queueItem: item },
      zSide: this._rtlService.getSheetSide('right'),
      zClosable: false,
      zHideFooter: true,
    });
  }

  onToggleArchive(item: IQueueItemDto): void {
    const action = item.isArchived
      ? this._translationService.getCachedTranslation(
          'notifications.actions.unarchive'
        )
      : this._translationService.getCachedTranslation(
          'notifications.actions.archive'
        );

    const title = item.isArchived
      ? this._translationService.getCachedTranslation(
          'notifications.dialog.unarchiveTitle'
        )
      : this._translationService.getCachedTranslation(
          'notifications.dialog.archiveTitle'
        );

    const description = item.isArchived
      ? this._translationService.getCachedTranslation(
          'notifications.dialog.unarchiveDescription'
        )
      : this._translationService.getCachedTranslation(
          'notifications.dialog.archiveDescription'
        );

    this._alertDialogService.confirm({
      zTitle: title,
      zDescription: description,
      zOkText: action,
      zCancelText:
        this._translationService.getCachedTranslation('common.cancel'),
      zOkDestructive: !item.isArchived,
      zOnOk: () => {
        this._notificationService.toggleQueueItemArchive(item.id).subscribe({
          next: () => {
            const successMsg = item.isArchived
              ? this._translationService.getCachedTranslation(
                  'notifications.messages.unarchiveSuccess'
                )
              : this._translationService.getCachedTranslation(
                  'notifications.messages.archiveSuccess'
                );
            toast.success(successMsg);
            this.loadQueueItems();
          },
          error: () => {
            toast.error(
              this._translationService.getCachedTranslation(
                'notifications.messages.toggleArchiveError'
              )
            );
          },
        });
      },
    });
  }

  getDeliveryTypeName(type: number): string {
    return DeliveryType[type] || 'Unknown';
  }

  getPriorityName(priority: number): string {
    return Priority[priority] || 'Unknown';
  }

  getQueueStatusName(status: number): string {
    return QueueStatus[status] || 'Unknown';
  }
}
