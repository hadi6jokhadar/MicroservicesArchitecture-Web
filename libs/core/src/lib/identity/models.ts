import { IFileManagerResponse } from '../file-manager/models';

export enum Role {
  User = 'User',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
  Service = 'Service',
}

export interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: number; // Backend sends numeric role (1=User, 2=Admin, 3=SuperAdmin)
  roleName: string; // Backend sends roleName as string
  status: boolean; // Backend uses 'status'
  isActive?: boolean; // Frontend computed property
  emailConfirmed: boolean;
  phoneNumberConfirmed?: boolean;
  created: string;
  lastLogin?: string | null;
  profilePictureId?: number | null;
  profilePicture?: IFileManagerResponse | null;
  verificationCode?: string | null;
  data?: string | null;
  isArchived: boolean;
  createdBy?: string | null;
  lastModified?: string;
  lastModifiedBy?: string | null;
}

export interface IPaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export class UserClass implements IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: number;
  roleName: string;
  status: boolean;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed?: boolean;
  created: string;
  lastLogin?: string | null;
  isArchived: boolean;
  createdBy?: string | null;
  lastModified?: string;
  lastModifiedBy?: string | null;

  profilePictureId?: number | null;
  profilePicture?: IFileManagerResponse | null;
  verificationCode?: string | null;
  data?: string | null;

  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || 0;
    this.email = data.email || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.role = data.role || 1;
    this.roleName = data.roleName || 'User';
    // Map backend 'status' to frontend 'isActive'
    this.status = data.status ?? true;
    this.isActive = data.status ?? true;
    this.isArchived = data.isArchived ?? false;
    this.emailConfirmed = data.emailConfirmed ?? false;
    this.phoneNumberConfirmed = data.phoneNumberConfirmed;
    this.created = data.created || '';
    this.lastLogin = data.lastLogin;
    this.createdBy = data.createdBy;
    this.lastModified = data.lastModified;
    this.lastModifiedBy = data.lastModifiedBy;
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
  phoneNumber: string;
}

export interface ICreateUserRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive?: boolean;
}

export interface IUpdateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}
