import { Routes } from '@angular/router';
import { aiChatSessionsResolver } from '@ihsan/core';
import { ChatSessionsComponent } from './chat-sessions/chat-sessions.component';

export const aiChatSessionsRoutes: Routes = [
  {
    path: '',
    component: ChatSessionsComponent,
    resolve: { sessions: aiChatSessionsResolver },
  },
];
