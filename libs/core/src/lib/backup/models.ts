// Backup targets ------------------------------------------------------------

export interface IBackupTarget {
  id: number;
  scope: string;
  serviceName?: string;
  tenantId?: string;
  displayName: string;
  isEnabled: boolean;
  retentionDays?: number;
  created: string;
}

export class BackupTargetClass implements IBackupTarget {
  id: number;
  scope: string;
  serviceName?: string;
  tenantId?: string;
  displayName: string;
  isEnabled: boolean;
  retentionDays?: number;
  created: string;

  constructor(data: Partial<IBackupTarget> = {}) {
    this.id = data.id || 0;
    this.scope = data.scope || '';
    this.serviceName = data.serviceName;
    this.tenantId = data.tenantId;
    this.displayName = data.displayName || '';
    this.isEnabled = data.isEnabled ?? true;
    this.retentionDays = data.retentionDays;
    this.created = data.created || '';
  }
}

// Backup runs -----------------------------------------------------------------

export interface IBackupRun {
  id: number;
  backupTargetId?: number;
  scope: string;
  serviceName?: string;
  tenantId?: string;
  databaseName?: string;
  triggerType: string;
  triggeredByUserId?: number;
  triggeredByEmail?: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  localFilePath?: string;
  localStatus: string;
  cloudStorageKey?: string;
  cloudStatus: string;
  fileSizeBytes?: number;
  sha256Checksum?: string;
  errorMessage?: string;
  created: string;
}

export class BackupRunClass implements IBackupRun {
  id: number;
  backupTargetId?: number;
  scope: string;
  serviceName?: string;
  tenantId?: string;
  databaseName?: string;
  triggerType: string;
  triggeredByUserId?: number;
  triggeredByEmail?: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  localFilePath?: string;
  localStatus: string;
  cloudStorageKey?: string;
  cloudStatus: string;
  fileSizeBytes?: number;
  sha256Checksum?: string;
  errorMessage?: string;
  created: string;

  constructor(data: Partial<IBackupRun> = {}) {
    this.id = data.id || 0;
    this.backupTargetId = data.backupTargetId;
    this.scope = data.scope || '';
    this.serviceName = data.serviceName;
    this.tenantId = data.tenantId;
    this.databaseName = data.databaseName;
    this.triggerType = data.triggerType || '';
    this.triggeredByUserId = data.triggeredByUserId;
    this.triggeredByEmail = data.triggeredByEmail;
    this.status = data.status || '';
    this.startedAt = data.startedAt;
    this.completedAt = data.completedAt;
    this.localFilePath = data.localFilePath;
    this.localStatus = data.localStatus || '';
    this.cloudStorageKey = data.cloudStorageKey;
    this.cloudStatus = data.cloudStatus || '';
    this.fileSizeBytes = data.fileSizeBytes;
    this.sha256Checksum = data.sha256Checksum;
    this.errorMessage = data.errorMessage;
    this.created = data.created || '';
  }
}

// Restore runs ------------------------------------------------------------------

export interface IRestoreRun {
  id: number;
  backupRunId: number;
  status: string;
  startedAt?: string;
  completedAt?: string;
  targetConnectionOverride?: string;
  triggeredByUserId?: number;
  triggeredByEmail?: string;
  errorMessage?: string;
  created: string;
}

export class RestoreRunClass implements IRestoreRun {
  id: number;
  backupRunId: number;
  status: string;
  startedAt?: string;
  completedAt?: string;
  targetConnectionOverride?: string;
  triggeredByUserId?: number;
  triggeredByEmail?: string;
  errorMessage?: string;
  created: string;

  constructor(data: Partial<IRestoreRun> = {}) {
    this.id = data.id || 0;
    this.backupRunId = data.backupRunId || 0;
    this.status = data.status || '';
    this.startedAt = data.startedAt;
    this.completedAt = data.completedAt;
    this.targetConnectionOverride = data.targetConnectionOverride;
    this.triggeredByUserId = data.triggeredByUserId;
    this.triggeredByEmail = data.triggeredByEmail;
    this.errorMessage = data.errorMessage;
    this.created = data.created || '';
  }
}

// Backup summary (flagship overview table) -------------------------------------

export interface IBackupSummary {
  scope: string;
  serviceName?: string;
  tenantId?: string;
  displayName: string;
  lastBackupRunId?: number;
  lastBackupAt?: string;
  lastBackupStatus?: string;
  lastLocalStatus?: string;
  lastCloudStatus?: string;
  lastFileSizeBytes?: number;
  lastErrorMessage?: string;
}

export class BackupSummaryClass implements IBackupSummary {
  scope: string;
  serviceName?: string;
  tenantId?: string;
  displayName: string;
  lastBackupRunId?: number;
  lastBackupAt?: string;
  lastBackupStatus?: string;
  lastLocalStatus?: string;
  lastCloudStatus?: string;
  lastFileSizeBytes?: number;
  lastErrorMessage?: string;

  constructor(data: Partial<IBackupSummary> = {}) {
    this.scope = data.scope || '';
    this.serviceName = data.serviceName;
    this.tenantId = data.tenantId;
    this.displayName = data.displayName || '';
    this.lastBackupRunId = data.lastBackupRunId;
    this.lastBackupAt = data.lastBackupAt;
    this.lastBackupStatus = data.lastBackupStatus;
    this.lastLocalStatus = data.lastLocalStatus;
    this.lastCloudStatus = data.lastCloudStatus;
    this.lastFileSizeBytes = data.lastFileSizeBytes;
    this.lastErrorMessage = data.lastErrorMessage;
  }
}

// Requests -----------------------------------------------------------------------

export interface ITriggerBackupRequest {
  scope: string;
  serviceName?: string;
  tenantId?: string;
}

export interface IUpdateBackupTargetRequest {
  id: number;
  isEnabled?: boolean;
  retentionDays?: number;
}

export interface ITriggerRestoreRequest {
  backupRunId: number;
  confirm: boolean;
  targetConnectionOverride?: string;
}

export interface IBackupRunFilterRequest {
  scope?: string;
  serviceName?: string;
  tenantId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface IRestoreRunFilterRequest {
  pageNumber?: number;
  pageSize?: number;
}
