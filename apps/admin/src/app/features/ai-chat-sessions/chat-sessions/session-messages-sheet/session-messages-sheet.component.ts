import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import {
  AiChatService,
  IAiChatMessage,
  IAiChatMessageFile,
  IAiChatSession,
  TranslatePipe,
} from '@ihsan/core';
import {
  Z_SHEET_DATA,
  ZardButtonComponent,
  ZardIconComponent,
  ZardBadgeComponent,
  ZardLoaderComponent,
  ZardEmptyComponent,
  ZardSheetRef,
} from '@ihsan/ui';
import { toast } from 'ngx-sonner';

export interface SessionMessagesSheetData {
  session: IAiChatSession;
}

interface IMessageWithFiles {
  message: IAiChatMessage;
  files: IAiChatMessageFile[];
  filesExpanded: boolean;
}

@Component({
  selector: 'app-session-messages-sheet',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TranslatePipe,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardLoaderComponent,
    ZardEmptyComponent,
  ],
  templateUrl: './session-messages-sheet.component.html',
  styleUrl: './session-messages-sheet.component.scss',
})
export class SessionMessagesSheetComponent implements OnInit {
  private readonly _data = inject<SessionMessagesSheetData>(Z_SHEET_DATA);
  private readonly _sheetRef = inject(ZardSheetRef);
  private readonly _aiChatService = inject(AiChatService);

  session!: IAiChatSession;
  readonly isLoading = signal(false);
  readonly messagesWithFiles = signal<IMessageWithFiles[]>([]);

  ngOnInit(): void {
    this.session = this._data.session;
    this.loadMessages();
  }

  loadMessages(): void {
    this.isLoading.set(true);
    this._aiChatService
      .getChatMessages({ session_id: this.session.Id })
      .subscribe({
        next: (messages) => {
          const entries: IMessageWithFiles[] = messages.map((m) => ({
            message: m,
            files: [],
            filesExpanded: false,
          }));
          this.messagesWithFiles.set(entries);
          this.isLoading.set(false);
          // Load files for all messages in parallel
          messages.forEach((m, index) => {
            this._aiChatService
              .getChatMessageFiles({ message_id: m.Id })
              .subscribe({
                next: (files) => {
                  const updated = [...this.messagesWithFiles()];
                  updated[index] = { ...updated[index], files };
                  this.messagesWithFiles.set(updated);
                },
              });
          });
        },
        error: () => {
          this.isLoading.set(false);
          toast.error('Failed to load messages');
        },
      });
  }

  toggleFiles(index: number): void {
    const updated = [...this.messagesWithFiles()];
    updated[index] = {
      ...updated[index],
      filesExpanded: !updated[index].filesExpanded,
    };
    this.messagesWithFiles.set(updated);
  }

  getRoleBadgeType(
    role: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (role) {
      case 'user':
        return 'default';
      case 'assistant':
        return 'secondary';
      case 'system':
        return 'outline';
      default:
        return 'outline';
    }
  }

  onClose(): void {
    this._sheetRef.close();
  }
}
