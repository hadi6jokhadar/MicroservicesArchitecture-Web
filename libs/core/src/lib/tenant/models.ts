export interface IJwtSettings {
  secret?: string;
  issuer?: string;
  audience?: string;
  accessTokenExpirationMinutes: number;
  refreshTokenExpirationDays: number;
}

export interface IDatabaseSettings {
  provider: string;
  connectionString: string;
}

export interface ICorsSettings {
  allowedOrigins: string[];
}

export interface IOtpSettings {
  expiryMinutes: number;
  length: number;
}

export interface ITenantConfiguration {
  jwt?: IJwtSettings;
  databaseSettings?: IDatabaseSettings;
  cors?: ICorsSettings;
  otp?: IOtpSettings;
}

export interface ITenant {
  id: number;
  tenantId: string;
  tenantName: string;
  userId: number;
  startDate: string;
  expireDate: string;
  isActive: boolean;
  isExpired: boolean;
  created: string;
  lastModified?: string;
  isArchived: boolean;
}

export class TenantClass implements ITenant {
  id: number;
  tenantId: string;
  tenantName: string;
  userId: number;
  startDate: string;
  expireDate: string;
  isActive: boolean;
  isExpired: boolean;
  created: string;
  lastModified?: string;
  isArchived: boolean;

  constructor(data: Partial<ITenant> = {}) {
    this.id = data.id || 0;
    this.tenantId = data.tenantId || '';
    this.tenantName = data.tenantName || '';
    this.userId = data.userId || 0;
    this.startDate = data.startDate || '';
    this.expireDate = data.expireDate || '';
    this.isActive = data.isActive ?? true;
    this.isExpired = data.isExpired ?? false;
    this.created = data.created || '';
    this.lastModified = data.lastModified;
    this.isArchived = data.isArchived ?? false;
  }
}

export interface ITenantConfig extends ITenant {
  data?: ITenantConfiguration;
}

export class TenantConfigClass extends TenantClass implements ITenantConfig {
  data?: ITenantConfiguration;

  constructor(data: Partial<ITenantConfig> = {}) {
    super(data);
    this.data = data.data;
  }
}

export interface ICreateTenantRequest {
  tenantId: string;
  tenantName: string;
  userId: number;
  startDate: string;
  expireDate: string;
  data: ITenantConfiguration;
  isActive: boolean;
}

export interface IUpdateTenantRequest {
  tenantId: string;
  tenantName: string;
  startDate: string;
  expireDate: string;
  data: ITenantConfiguration;
  isActive: boolean;
}
