import { IFileManagerResponse } from '../file-manager';

export enum Role {
  User = 'User',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
  Service = 'Service',
}

export interface IUser {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailConfirmed?: boolean;
  lastLogin?: string | null;
  status: boolean;
  created: string;
  lastModified?: string | null;
  roles: IRole[];
  profilePictureId?: number | null;
  profilePicture?: IFileManagerResponse | null;
  verificationCode?: string | null;
  data?: string | null;
}

export class UserClass implements IUser {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailConfirmed?: boolean;
  lastLogin?: string | null;
  status: boolean;
  created: string;
  lastModified?: string | null;
  roles: IRole[];
  profilePictureId?: number | null;
  profilePicture?: IFileManagerResponse | null;
  verificationCode?: string | null;
  data?: string | null;

  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || 0;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.emailConfirmed = data.emailConfirmed ?? false;
    this.lastLogin = data.lastLogin;
    this.status = data.status ?? true;
    this.created = data.created || '';
    this.lastModified = data.lastModified;
    this.roles = data.roles?.map((r) => new RoleClass(r)) || [];
    this.profilePictureId = data.profilePictureId;
    this.profilePicture = data.profilePicture;
    this.verificationCode = data.verificationCode;
    this.data = data.data;
  }
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiryTime: string;
  user: IUser;
}

export class AuthResponseClass implements IAuthResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiryTime: string;
  user: IUser;

  constructor(data: Partial<IAuthResponse> = {}) {
    this.accessToken = data.accessToken || '';
    this.refreshToken = data.refreshToken || '';
    this.refreshTokenExpiryTime = data.refreshTokenExpiryTime || '';
    this.user = data.user ? new UserClass(data.user) : new UserClass();
  }
}

export interface ILoginRequest {
  email: string;
  password?: string;
}

export interface IRegisterRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface IRefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IUpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  profilePictureId?: number | null;
  id?: number | null;
  data?: string | null;
}

export interface ICreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleIds: number[];
  phoneNumber?: string | null;
  profilePictureId?: number | null;
  data?: string | null;
}

export interface IUpdateUserRequest {
  id: number;
  firstName: string;
  lastName: string;
  roleIds: number[];
  phoneNumber?: string | null;
  profilePictureId?: number | null;
  emailConfirmed?: boolean | null;
  status?: boolean | null;
  data?: string | null;
}

// Role Management
export interface IRole {
  id: number;
  name: string;
  description?: string;
  isSystemRole: boolean;
  status: boolean;
  claims?: IClaim[];
}

export class RoleClass implements IRole {
  id: number;
  name: string;
  description?: string;
  isSystemRole: boolean;
  status: boolean;
  claims?: IClaim[];

  constructor(data: Partial<IRole> = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.description = data.description;
    this.isSystemRole = data.isSystemRole ?? false;
    this.status = data.status ?? true;
    this.claims = data.claims?.map((c) => new ClaimClass(c));
  }
}

export interface ICreateRoleRequest {
  name: string;
  description?: string;
}

export interface IUpdateRoleRequest {
  name: string;
  description?: string;
}

export interface IAssignClaimsToRoleRequest {
  claimIds: number[];
}

export interface IAssignRolesToUserRequest {
  roleIds: number[];
}

// Claim Management
export interface IClaim {
  id: number;
  name: string;
  description?: string;
  claimType: string;
  claimValue: string;
  isSuperAdminOnly: boolean;
  status: boolean;
}

export class ClaimClass implements IClaim {
  id: number;
  name: string;
  description?: string;
  claimType: string;
  claimValue: string;
  isSuperAdminOnly: boolean;
  status: boolean;

  constructor(data: Partial<IClaim> = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.description = data.description;
    this.claimType = data.claimType || '';
    this.claimValue = data.claimValue || '';
    this.isSuperAdminOnly = data.isSuperAdminOnly ?? false;
    this.status = data.status ?? true;
  }
}

export interface ICreateClaimRequest {
  name: string;
  claimType: string;
  claimValue: string;
  description?: string;
  isSuperAdminOnly?: boolean;
}

export interface IUpdateClaimRequest {
  name: string;
  claimType: string;
  claimValue: string;
  description?: string;
  isSuperAdminOnly?: boolean;
}

// Device Token Management
export interface IDeviceToken {
  id: number;
  userId: number;
  token: string;
  platform: string;
  deviceId: string;
  created: string;
}

export class DeviceTokenClass implements IDeviceToken {
  id: number;
  userId: number;
  token: string;
  platform: string;
  deviceId: string;
  created: string;

  constructor(data: Partial<IDeviceToken> = {}) {
    this.id = data.id || 0;
    this.userId = data.userId || 0;
    this.token = data.token || '';
    this.platform = data.platform || '';
    this.deviceId = data.deviceId || '';
    this.created = data.created || '';
  }
}

export interface IAddDeviceTokenRequest {
  token: string;
  platform: string;
  deviceId: string;
}

export interface IUpdateDeviceTokenRequest {
  token: string;
  platform: string;
  deviceId: string;
}

export interface IGetBatchDeviceTokensRequest {
  userIds: number[];
}

export interface IDeleteBatchDeviceTokensRequest {
  tokenIds: number[];
}

// Enhanced Authentication
export interface IRegisterWithCodeByPhoneRequest {
  phoneNumber: string;
  code: string;
  firstName: string;
  lastName: string;
}

export interface IRegisterWithCodeByEmailRequest {
  email: string;
  code: string;
  firstName: string;
  lastName: string;
}

/**
 * Verification Code Response
 * In development mode: code is included in the response
 * In production mode: code is null (sent via SMS/Email only)
 */
export interface IVerificationCodeResponse {
  success: boolean;
  code: string | null;
  message?: string;
}

export class VerificationCodeResponseClass
  implements IVerificationCodeResponse
{
  success: boolean;
  code: string | null;
  message?: string;

  constructor(data: Partial<IVerificationCodeResponse> = {}) {
    this.success = data.success ?? false;
    this.code = data.code ?? null;
    this.message = data.message;
  }
}
