import { IFileManagerResponse } from '@ihsan/core';

export interface ArtistModel {
  id: number;
  name: string;
  imageFileId?: number;
  imageFile?: IFileManagerResponse | null;
  songCount: number;
  status: boolean;
  isArchived: boolean;
  created: string;
  lastModified?: string;
}

export interface CreateArtistCommand {
  name: string;
  imageFileId?: number;
}

export interface UpdateArtistCommand {
  name: string;
  imageFileId?: number;
  status?: boolean;
}
