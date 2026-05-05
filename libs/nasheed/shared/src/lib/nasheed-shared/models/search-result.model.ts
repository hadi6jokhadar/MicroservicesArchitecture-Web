export interface SearchResultModel {
  songId: number;
  title: string;
  artistName?: string;
  summary?: string;
  vocalStyle?: string;
  moodTags: string[];
  score: number;
  languageCode?: string;
}
