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
  role: string;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  created: string;
  profilePictureId?: number;
  profilePicture?: IFileManagerResponse;
  verificationCode?: string;
  data?: string;
}

export class UserClass implements IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  created: string;

  profilePictureId?: number;
  profilePicture?: IFileManagerResponse;
  verificationCode?: string;
  data?: string;

  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || 0;
    this.email = data.email || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.role = data.role || '';
    this.isActive = data.isActive ?? true;
    this.emailConfirmed = data.emailConfirmed ?? false;
    this.phoneNumberConfirmed = data.phoneNumberConfirmed ?? false;
    this.created = data.created || '';
    this.profilePictureId = data.profilePictureId;
    this.profilePicture = data.profilePicture;
    this.verificationCode = data.verificationCode;
    this.data = data.data;
  }
}

export interface IAuthResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpiryTime: string;
  user: IUser;
}

export class AuthResponseClass implements IAuthResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpiryTime: string;
  user: IUser;

  constructor(data: Partial<IAuthResponse> = {}) {
    this.token = data.token || '';
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
  token: string;
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
