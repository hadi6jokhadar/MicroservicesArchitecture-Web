import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ErrorDialogData } from './error.model';

@Component({
  selector: 'shared-error',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent {
  readonly data = inject<ErrorDialogData>(MAT_DIALOG_DATA);
  private readonly _dialogRef = inject(MatDialogRef<ErrorComponent>);

  close(): void {
    this._dialogRef.close();
  }

  get hasValidationErrors(): boolean {
    return !!this.data.errors && Object.keys(this.data.errors).length > 0;
  }

  get validationErrors(): { key: string; messages: string[] }[] {
    if (!this.data.errors) return [];
    return Object.entries(this.data.errors).map(([key, messages]) => ({
      key,
      messages,
    }));
  }
}
