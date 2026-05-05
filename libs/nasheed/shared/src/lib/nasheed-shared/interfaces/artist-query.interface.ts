export interface IGetQuery {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: number;
  isArchived?: boolean;
}

export interface IArtistQuery extends IGetQuery {
  // Additional artist-specific filters can be added here
}
