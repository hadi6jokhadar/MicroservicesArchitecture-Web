import type { ZardIcon } from '@ihsan/ui';

export enum SidebarPageType {
  Management = 'Management',
  Tenant = 'Tenant',
  Both = 'Both',
}

export interface ISidebarPage {
  translationKey: string;
  icon: ZardIcon;
  group?: string;
  route?: string;
  action?: () => void;
  roles?: string[];
  type?: SidebarPageType;
  children?: ISidebarPage[];
}

export class SidebarPageClass implements ISidebarPage {
  translationKey: string;
  icon: ZardIcon;
  group?: string;
  route?: string;
  action?: () => void;
  roles?: string[];
  type?: SidebarPageType;
  children?: ISidebarPage[];

  constructor(data: Partial<ISidebarPage> = {}) {
    this.translationKey = data.translationKey || '';
    this.icon = data.icon || 'circle';
    this.group = data.group;
    this.route = data.route;
    this.action = data.action;
    this.roles = data.roles;
    this.type = data.type || SidebarPageType.Both;
    this.children = data.children;
  }
}

export interface ISidebarUser {
  name: string;
  username: string;
  imageUrl?: string;
  roles?: string[];
}

export class SidebarUserClass implements ISidebarUser {
  name: string;
  username: string;
  imageUrl?: string;
  roles?: string[];

  constructor(data: Partial<ISidebarUser> = {}) {
    this.name = data.name || '';
    this.username = data.username || '';
    this.imageUrl = data.imageUrl;
    this.roles = data.roles;
  }
}
