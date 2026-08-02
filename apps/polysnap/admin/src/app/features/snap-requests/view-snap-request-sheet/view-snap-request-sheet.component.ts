import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';
import {
  ZardBadgeComponent,
  ZardButtonComponent,
  ZardIconComponent,
  ZardSheetRef,
  Z_SHEET_DATA,
} from '@ihsan/ui';
import { ISnapRequestDto } from '../models';

@Component({
  selector: 'app-view-snap-request-sheet',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
  ],
  templateUrl: './view-snap-request-sheet.component.html',
  styleUrls: ['./view-snap-request-sheet.component.scss'],
})
export class ViewSnapRequestSheetComponent {
  private readonly _data = inject<{ snapRequest: ISnapRequestDto }>(
    Z_SHEET_DATA
  );
  private readonly _sheetRef = inject(ZardSheetRef);

  readonly snapRequest = signal<ISnapRequestDto>(this._data.snapRequest);

  onClose(): void {
    this._sheetRef.close();
  }

  getStatusBadgeType(status: boolean): 'default' | 'destructive' {
    return status ? 'default' : 'destructive';
  }
}
