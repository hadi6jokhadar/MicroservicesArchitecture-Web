import { SongState } from '../enums/song-state.enum';
import { SearchIndexStatus } from '../enums/search-index-status.enum';
import { IFileManagerResponse } from '@ihsan/core';

export interface SongLegalComplianceModel {
  copyrightRiskLevel: string;
  contentSafetyFlag: string;
  riskReason?: string;
}

export interface SongModel {
  id: number;
  artistId?: number | null;
  artistName?: string;
  title: string;
  fileId: number;
  file?: IFileManagerResponse | null;
  durationSeconds?: number;
  languageCode?: string;
  lyricsRaw?: string;
  lyricsVerifiedLrc?: string;
  lyricsPlainText?: string;
  summary?: string;
  vocalStyle?: string;
  legalCompliance?: SongLegalComplianceModel;
  songState: SongState;
  searchIndexStatus: SearchIndexStatus;
  publishedAt?: string;
  moodTags: string[];
  status: number;
  isArchived: boolean;
  created: string;
  lastModified?: string;
}

export interface CreateSongCommand {
  artistId?: number | null;
  title: string;
  fileId?: number;
  copyrightRiskLevel?: string;
  contentSafetyFlag?: string;
  riskReason?: string;
  durationSeconds?: number;
  languageCode?: string;
  lyricsRaw?: string;
  lyricsVerifiedLrc?: string;
  lyricsPlainText?: string;
  summary?: string;
  vocalStyle?: string;
  publishedAt?: string;
  moodTags?: string[];
}

export interface UpdateSongCommand {
  artistId?: number | null;
  title?: string;
  copyrightRiskLevel?: string;
  contentSafetyFlag?: string;
  riskReason?: string;
  fileId?: number;
  durationSeconds?: number;
  languageCode?: string;
  lyricsRaw?: string;
  lyricsVerifiedLrc?: string;
  lyricsPlainText?: string;
  summary?: string;
  vocalStyle?: string;
  publishedAt?: string;
  moodTags?: string[];
  status?: number;
}
