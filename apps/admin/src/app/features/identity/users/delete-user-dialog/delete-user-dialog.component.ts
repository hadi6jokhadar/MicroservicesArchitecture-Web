import { Component, inject, signal } from '@angular/core';
import {
  ZardDialogRef,
  Z_MODAL_DATA,
  ZardButtonComponent,
  ZardIconComponent,
} from '@ihsan/ui';
import { IdentityAdminService, IUser } from '@ihsan/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-user-dialog',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, ZardIconComponent],
  templateUrl: './delete-user-dialog.component.html',
  styleUrls: ['./delete-user-dialog.component.scss'],
})
export class DeleteUserDialogComponent {
  private _dialogRef = inject(ZardDialogRef);
  private _data = inject<{ user: IUser }>(Z_MODAL_DATA);
  private _adminService = inject(IdentityAdminService);

  user = signal<IUser>(this._data.user);
  deleting = signal(false);
  errorMessage = signal('');

  onConfirm(): void {
    this.deleting.set(true);
    this.errorMessage.set('');

    this._adminService.deleteUser(this.user().id).subscribe({
      next: () => {
        this._dialogRef.close(true);
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
        this.errorMessage.set(error?.error?.message || 'Failed to delete user');
        this.deleting.set(false);
      },
    });
  }

  onCancel(): void {
    this._dialogRef.close(false);
  }
}
