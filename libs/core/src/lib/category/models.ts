import { IFileManagerResponse } from '../file-manager/models';

// ── Response interfaces ────────────────────────────────────────────────────

export interface ICategoryDto {
  id: number;
  slug: string;
  uri: string;
  iconFileId?: number;
  imageFileId?: number;
  iconName?: string;
  iconFile?: IFileManagerResponse;
  imageFile?: IFileManagerResponse;
  parentId?: number;
  path: string;
  depth: number;
  nameTranslations: Record<string, string>;
  attributes: Record<string, unknown>;
  children: ICategoryDto[];
  // BaseDto
  created: string;
  createdBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  isArchived: boolean;
  status: boolean;
}

// ── Request interfaces ─────────────────────────────────────────────────────

export interface ICreateCategoryRequest {
  slug: string;
  uri: string;
  nameTranslations: Record<string, string>;
  parentId?: number;
  iconFileId?: number;
  imageFileId?: number;
  iconName?: string;
  attributes?: Record<string, unknown>;
}

export interface IUpdateCategoryRequest {
  id: number;
  slug?: string;
  uri?: string;
  nameTranslations?: Record<string, string>;
  iconFileId?: number | null;
  imageFileId?: number | null;
  iconName?: string | null;
  attributes?: Record<string, unknown>;
}

export interface IMoveCategoryRequest {
  newParentId?: number | null;
}

// ── Filter / query interfaces ──────────────────────────────────────────────

export interface ICategoryFilterRequest {
  pageNumber?: number;
  pageSize?: number;
  textFilter?: string;
}
