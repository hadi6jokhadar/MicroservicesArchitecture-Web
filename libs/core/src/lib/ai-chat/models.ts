// ---------------------------------------------------------------------------
// Chat Send Request / Response
// ---------------------------------------------------------------------------

export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface IChatMessagePayload {
  role: ChatRole;
  content: string;
}

export interface IChatSendRequest {
  session_id?: string | null;
  settings_key: string;
  system_prompt_key?: string | null;
  messages: IChatMessagePayload[];
  file_ids?: number[];
}

export interface IChatSingleResponse {
  session_id: string;
  content: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// ---------------------------------------------------------------------------
// Chat Session
// ---------------------------------------------------------------------------

export interface IAiChatSession {
  Id: string;
  TenantId: string;
  UserId: string;
  Title?: string | null;
  CreatedAt: string;
}

export interface IAiChatSessionFilter {
  user_id?: string;
  title?: string;
  created_from?: string;
  created_to?: string;
  skip?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Chat Message
// ---------------------------------------------------------------------------

export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface IAiChatMessage {
  Id: string;
  SessionId: string;
  Role: ChatMessageRole;
  Content: string;
  PromptTokens: number;
  CompletionTokens: number;
  CreatedAt: string;
}

export interface IAiChatMessageFilter {
  session_id?: string;
  role?: ChatMessageRole;
  created_from?: string;
  created_to?: string;
  skip?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Chat Message File
// ---------------------------------------------------------------------------

export interface IAiChatMessageFile {
  MessageId: string;
  FileId: string;
}

export interface IAiChatMessageFileFilter {
  message_id?: string;
  file_id?: string;
  skip?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Token Usage Log
// ---------------------------------------------------------------------------

export interface IAiTokenUsageLog {
  Id: string;
  TenantId?: string | null;
  UserId?: string | null;
  ModelName: string;
  PromptTokens: number;
  CompletionTokens: number;
  TotalTokens: number;
  Endpoint: string;
  CreatedAt: string;
}

export interface IAiTokenUsageLogFilter {
  user_id?: string;
  model_name?: string;
  endpoint?: string;
  created_from?: string;
  created_to?: string;
  skip?: number;
  limit?: number;
}
