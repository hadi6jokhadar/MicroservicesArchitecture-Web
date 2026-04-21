import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AiSystemPromptsService } from './ai-system-prompts.service';
import { IAiSystemPrompt } from './models';

export const aiSystemPromptsResolver: ResolveFn<IAiSystemPrompt[]> = () => {
  const service = inject(AiSystemPromptsService);
  return service.getPrompts('all').pipe(catchError(() => of([])));
};
