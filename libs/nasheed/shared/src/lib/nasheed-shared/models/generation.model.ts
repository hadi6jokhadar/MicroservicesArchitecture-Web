export interface GenerateLyricsResponseModel {
  lyrics: string;
  theme?: string;
  style?: string;
}

export interface GenerateLyricsCommand {
  prompt: string;
  language: string;
  style?: string;
  numberOfVerses?: number;
}
