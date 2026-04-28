export type SystemPromptScopeFilter = 'all' | 'tenant' | 'global';

export interface IAiSystemPrompt {
  Id: string;
  Name: string;
  PromptText: string;
  TenantId?: string | null;
  ResponseFormat?: unknown | null;
}

export interface IUpsertAiSystemPromptRequest {
  Name: string;
  PromptText: string;
  TenantId?: string | null;
  ResponseFormat?: string | null;
}
