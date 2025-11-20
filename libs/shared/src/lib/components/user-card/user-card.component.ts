import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent {
  // Signal inputs
  userName = input.required<string>();
  userEmail = input.required<string>();
  userAvatar = input<string>('');
  showActions = input<boolean>(true);

  // Signal outputs
  viewClicked = output<void>();
  editClicked = output<void>();
  deleteClicked = output<void>();

  onView(): void {
    this.viewClicked.emit();
  }

  onEdit(): void {
    this.editClicked.emit();
  }

  onDelete(): void {
    this.deleteClicked.emit();
  }
}
