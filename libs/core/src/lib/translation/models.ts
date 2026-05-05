export interface ITranslationKey {
  id: number;
  key: string;
  category?: string;
  description?: string;
  created: string;
}

export interface ITranslationValue {
  id: number;
  translationKeyId: number;
  language: string;
  value: string;
  tenantId?: string;
  created: string;
  lastModified: string;
}

export interface ITranslationKeyDto {
  id: number;
  key: string;
  category?: string;
  description?: string;
  tenantId?: string;
  values: ITranslationValueDto[];
  created: string;
  isArchived: boolean;
}

export interface ITranslationValueDto {
  id: number;
  translationKeyId: number;
  language: string;
  value: string;
  tenantId?: string;
  created: string;
  lastModified: string;
}

export interface IGetTranslationKeysQuery {
  pageNumber: number;
  pageSize: number;
  category?: string;
  tenantId?: string;
  searchTerm?: string;
  isArchived?: boolean;
}

export interface ICreateTranslationKeyCommand {
  key: string;
  category: string;
  description?: string;
}

export interface IUpdateTranslationKeyCommand {
  id: number;
  description?: string;
}

export interface ISetTranslationCommand {
  key: string;
  language: string;
  value: string;
  tenantId?: string;
  category: string;
}

export interface IImportTranslationsCommand {
  translations: Record<string, string>;
  language: string;
  tenantId?: string;
  category: string;
}

export interface IImportTranslationsResult {
  totalKeys: number;
  createdKeys: number;
  updatedValues: number;
  message: string;
}

export interface ITranslationsDto {
  language: string;
  translations: Record<string, string>;
}
