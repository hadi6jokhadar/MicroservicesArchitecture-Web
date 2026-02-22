import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  Z_SHEET_DATA,
  ZardSheetRef,
  ZardButtonComponent,
  ZardIconComponent,
} from '@ihsan/ui';
import {
  IQueueItemDto,
  DeliveryType,
  Priority,
  QueueStatus,
  TranslatePipe,
} from '@ihsan/core';

export interface ViewQueueItemSheetData {
  queueItem: IQueueItemDto;
}

@Component({
  selector: 'app-view-queue-item-sheet',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    DatePipe,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './view-queue-item-sheet.component.html',
  styleUrl: './view-queue-item-sheet.component.scss',
})
export class ViewQueueItemSheetComponent implements OnInit {
  private readonly _data = inject<ViewQueueItemSheetData>(Z_SHEET_DATA);
  private readonly _sheetRef = inject(ZardSheetRef);

  queueItem!: IQueueItemDto;

  ngOnInit(): void {
    if (this._data?.queueItem) {
      this.queueItem = this._data.queueItem;
    }
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

  onClose(): void {
    this._sheetRef.close();
  }
}
