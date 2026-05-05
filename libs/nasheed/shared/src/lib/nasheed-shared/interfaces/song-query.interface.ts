import { IGetQuery } from './artist-query.interface';
import { SongState } from '../enums/song-state.enum';
import { SearchIndexStatus } from '../enums/search-index-status.enum';

export interface ISongQuery extends IGetQuery {
  textFilter?: string;
  artistId?: number;
  state?: SongState;
  searchIndexStatus?: SearchIndexStatus;
  languageCode?: string;
  copyrightRiskLevel?: string;
  contentSafetyFlag?: string;
}
