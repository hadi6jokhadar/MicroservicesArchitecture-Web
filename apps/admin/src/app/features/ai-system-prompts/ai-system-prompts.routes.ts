import { Routes } from '@angular/router';
import { aiSystemPromptsResolver } from '@ihsan/core';
import { AiSystemPromptsComponent } from './ai-system-prompts/ai-system-prompts.component';

export const aiSystemPromptsRoutes: Routes = [
  {
    path: '',
    component: AiSystemPromptsComponent,
    resolve: { prompts: aiSystemPromptsResolver },
  },
];
