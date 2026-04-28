export type ModelTypeEnum =
  | 'Text'
  | 'Vision'
  | 'Audio'
  | 'Embedding'
  | 'ImageGeneration';

export const MODEL_TYPE_OPTIONS: ModelTypeEnum[] = [
  'Text',
  'Vision',
  'Audio',
  'Embedding',
  'ImageGeneration',
];

/**
 * Controls how audio file bytes are delivered to the model API.
 * - Auto   — provider auto-detection (default); no column value needed.
 * - Url    — pass a real HTTP URL in an audio_url block (required for Qwen omni).
 * - Base64 — download bytes and Base64-encode in an input_audio block (required for OpenAI/Gemini).
 */
export type AudioDataModeEnum = 'Auto' | 'Url' | 'Base64';

export const AUDIO_DATA_MODE_OPTIONS: AudioDataModeEnum[] = [
  'Auto',
  'Url',
  'Base64',
];

export type AiSettingsScopeFilter = 'all' | 'tenant' | 'global';

export interface IAiProviderSetting {
  Id: string;
  Key: string;
  ModelType: ModelTypeEnum;
  Provider: string;
  ApiKey: string;
  ModelName: string;
  TenantId?: string | null;
  ApiBaseUrl?: string | null;
  Temperature?: number | null;
  Stream?: boolean | null;
  MaxCompletionTokens?: number | null;
  TopP?: number | null;
  FrequencyPenalty?: number | null;
  PresencePenalty?: number | null;
  Description?: string | null;
  AudioDataMode?: AudioDataModeEnum | null;
}

export class AiProviderSettingClass implements IAiProviderSetting {
  Id: string;
  Key: string;
  ModelType: ModelTypeEnum;
  Provider: string;
  ApiKey: string;
  ModelName: string;
  TenantId?: string | null;
  ApiBaseUrl?: string | null;
  Temperature?: number | null;
  Stream?: boolean | null;
  MaxCompletionTokens?: number | null;
  TopP?: number | null;
  FrequencyPenalty?: number | null;
  PresencePenalty?: number | null;
  Description?: string | null;
  AudioDataMode?: AudioDataModeEnum | null;

  constructor(data: Partial<IAiProviderSetting> = {}) {
    this.Id = data.Id || '';
    this.Key = data.Key || '';
    this.ModelType = data.ModelType || 'Text';
    this.Provider = data.Provider || '';
    this.ApiKey = data.ApiKey || '';
    this.ModelName = data.ModelName || '';
    this.TenantId = data.TenantId ?? null;
    this.ApiBaseUrl = data.ApiBaseUrl ?? null;
    this.Temperature = data.Temperature ?? null;
    this.Stream = data.Stream ?? null;
    this.MaxCompletionTokens = data.MaxCompletionTokens ?? null;
    this.TopP = data.TopP ?? null;
    this.FrequencyPenalty = data.FrequencyPenalty ?? null;
    this.PresencePenalty = data.PresencePenalty ?? null;
    this.Description = data.Description ?? null;
    this.AudioDataMode = data.AudioDataMode ?? null;
  }
}

export interface IUpsertAiProviderSettingRequest {
  Key: string;
  ModelType: ModelTypeEnum;
  Provider: string;
  ApiKey: string;
  ModelName: string;
  TenantId?: string;
  ApiBaseUrl?: string | null;
  Temperature?: number | null;
  Stream?: boolean | null;
  MaxCompletionTokens?: number | null;
  TopP?: number | null;
  FrequencyPenalty?: number | null;
  PresencePenalty?: number | null;
  Description?: string | null;
  AudioDataMode?: AudioDataModeEnum | null;
}
