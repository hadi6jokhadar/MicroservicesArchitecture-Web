export interface IAuditLog {
  id: string;
  userId: string | null;
  tenantId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  timestamp: string;
}

// Query param names match what MapAuditLogEndpoints() exposes on the backend.
export interface IAuditLogFilter {
  page?: number;
  pageSize?: number;
  userId?: string;
  tenantId?: string;
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDesc?: boolean;
}

export type AuditLogSource =
  | 'identity'
  | 'tenant'
  | 'notification'
  | 'fileManager'
  | 'translation'
  | 'category'
  | 'nasheed';

export interface IAuditLogSourceOption {
  value: AuditLogSource;
  labelKey: string;
}
