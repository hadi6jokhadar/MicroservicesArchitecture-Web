import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ZardToastComponent } from '@ihsan/ui';

@Component({
  imports: [RouterModule, ZardToastComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Ihsandev';
}
