import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AiChatService } from './ai-chat.service';
import {
  IAiChatMessage,
  IAiChatMessageFile,
  IAiChatSession,
  IAiTokenUsageLog,
} from './models';

export const aiChatSessionsResolver: ResolveFn<IAiChatSession[]> = () => {
  const service = inject(AiChatService);
  return service.getChatSessions().pipe(catchError(() => of([])));
};

export const aiChatMessagesResolver: ResolveFn<IAiChatMessage[]> = (route) => {
  const service = inject(AiChatService);
  const sessionId = route.paramMap.get('sessionId') ?? undefined;
  return service
    .getChatMessages(sessionId ? { session_id: sessionId } : {})
    .pipe(catchError(() => of([])));
};

export const aiChatMessageFilesResolver: ResolveFn<IAiChatMessageFile[]> = (
  route
) => {
  const service = inject(AiChatService);
  const messageId = route.paramMap.get('messageId') ?? undefined;
  return service
    .getChatMessageFiles(messageId ? { message_id: messageId } : {})
    .pipe(catchError(() => of([])));
};

export const aiTokenUsageLogsResolver: ResolveFn<IAiTokenUsageLog[]> = () => {
  const service = inject(AiChatService);
  return service.getTokenUsageLogs().pipe(catchError(() => of([])));
};
