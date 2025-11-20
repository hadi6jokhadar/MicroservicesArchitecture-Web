// Example User Model
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IUser> = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || UserRole.User;
    this.avatar = data.avatar;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get isAdmin(): boolean {
    return this.role === UserRole.Admin;
  }

  get displayName(): string {
    return this.name || this.email;
  }

  getInitials(): string {
    return this.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
}

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}
