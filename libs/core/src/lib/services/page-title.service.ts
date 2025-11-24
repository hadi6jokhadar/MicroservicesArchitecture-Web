import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  title = signal<string>('Dashboard');

  setTitle(title: string) {
    this.title.set(title);
  }
}
