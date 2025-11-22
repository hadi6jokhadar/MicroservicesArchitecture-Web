export enum FileGroup {
  Personal = 1,
  Shared = 2,
  System = 3,
  Project = 4,
  Archive = 5,
}

export enum FileType {
  Music = 1,
  Video = 2,
  Image = 3,
  Other = 4,
}

export interface IFileManagerResponse {
  id: number;
  name: string;
  extension: string;
  size: number;
  path: string;
  url: string;
  group: FileGroup;
  type: FileType;
  temp: boolean;
  status: boolean;
  isArchived: boolean;
  userId?: number;
  created: string;
  lastModified?: string;
}

export class FileManagerResponseClass implements IFileManagerResponse {
  id: number;
  name: string;
  extension: string;
  size: number;
  path: string;
  url: string;
  group: FileGroup;
  type: FileType;
  temp: boolean;
  status: boolean;
  isArchived: boolean;
  userId?: number;
  created: string;
  lastModified?: string;

  constructor(data: Partial<IFileManagerResponse> = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.extension = data.extension || '';
    this.size = data.size || 0;
    this.path = data.path || '';
    this.url = data.url || '';
    this.group = data.group ?? FileGroup.Personal;
    this.type = data.type ?? FileType.Other;
    this.temp = data.temp ?? false;
    this.status = data.status ?? true;
    this.isArchived = data.isArchived ?? false;
    this.userId = data.userId;
    this.created = data.created || '';
    this.lastModified = data.lastModified;
  }
}

export interface IFileManagerListRequest {
  id?: number;
  status?: boolean;
  isArchived?: boolean;
  from?: string;
  to?: string;
  textFilter?: string;
  group?: FileGroup;
  type?: FileType;
  temp?: boolean;
  userId?: number;
  sortBy?: string;
  ascending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface IUpdateFileRequest {
  name?: string;
  group?: FileGroup;
  status?: boolean;
  isArchived?: boolean;
  temp?: boolean;
}

export interface IPaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
