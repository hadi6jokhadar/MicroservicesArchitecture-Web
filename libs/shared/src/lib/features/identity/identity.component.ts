import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'shared-identity',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
})
export class IdentityComponent {
  private _router = inject(Router);

  navigate(page: string): void {
    this._router.navigate(['/identity', page]);
  }

  isActive(page: string): boolean {
    return this._router.url.includes(page);
  }
}
