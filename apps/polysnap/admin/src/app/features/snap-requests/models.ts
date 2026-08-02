// ── Response interfaces ────────────────────────────────────────────────────

export interface ISnapRequestDto {
  id: number;
  name: string;
  rawGeometryGeoJson: string;
  snappedGeometryGeoJson: string | null;
  threshold: number;
  // BaseDto
  created: string;
  createdBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  isArchived: boolean;
  status: boolean;
}

export interface ISnapRequestPaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ── Request interfaces ─────────────────────────────────────────────────────

export interface ICreateSnapRequestCommand {
  name: string;
  rawGeometryGeoJson: string;
  threshold?: number;
}

export interface IUpdateSnapRequestCommand {
  name?: string;
  rawGeometryGeoJson?: string;
  snappedGeometryGeoJson?: string;
  threshold?: number;
}

// ── Filter / query interfaces ──────────────────────────────────────────────

export interface IGetSnapRequestsQuery {
  textFilter?: string;
  pageNumber?: number;
  pageSize?: number;
}
