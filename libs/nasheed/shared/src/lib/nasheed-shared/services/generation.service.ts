import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '@ihsan/core';
import { GenerateLyricsCommand, GenerateLyricsResponseModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GenerationService {
  private readonly _http = inject(HttpClient);
  private readonly _env = inject(ENVIRONMENT);
  private get baseUrl(): string { return `${this._env.apiUrls['nasheed']}/api/generation`; }

  generateLyrics(command: GenerateLyricsCommand, options?: { context?: import('@angular/common/http').HttpContext }): Observable<GenerateLyricsResponseModel> {
    return this._http.post<GenerateLyricsResponseModel>(`${this.baseUrl}/lyrics`, command, options ?? {});
  }
}
