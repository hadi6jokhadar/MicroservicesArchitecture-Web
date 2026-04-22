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

export type AiSettingsScopeFilter = 'all' | 'tenant' | 'global';

export interface IAiProviderSetting {
  Id: string;
  Key: string;
  ModelType: ModelTypeEnum;
  Provider: string;
  ApiKey: string;
  ModelName: string;
  TenantId?: string | null;
}

export class AiProviderSettingClass implements IAiProviderSetting {
  Id: string;
  Key: string;
  ModelType: ModelTypeEnum;
  Provider: string;
  ApiKey: string;
  ModelName: string;
  TenantId?: string | null;

  constructor(data: Partial<IAiProviderSetting> = {}) {
    this.Id = data.Id || '';
    this.Key = data.Key || '';
    this.ModelType = data.ModelType || 'Text';
    this.Provider = data.Provider || '';
    this.ApiKey = data.ApiKey || '';
    this.ModelName = data.ModelName || '';
    this.TenantId = data.TenantId ?? null;
  }
}

export interface IUpsertAiProviderSettingRequest {
  Key: string;
  ModelType: ModelTypeEnum;
  Provider: string;
  ApiKey: string;
  ModelName: string;
  TenantId?: string;
}
