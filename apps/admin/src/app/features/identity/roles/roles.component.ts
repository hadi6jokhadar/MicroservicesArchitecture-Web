import { Component } from '@angular/core';
import { TranslatePipe } from '@ihsan/core';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent {}
