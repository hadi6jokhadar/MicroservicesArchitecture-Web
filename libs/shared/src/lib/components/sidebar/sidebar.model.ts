import type { ZardIcon } from '@ihsan/ui';

export interface ISidebarPage {
  label: string;
  icon: ZardIcon;
  group?: string;
  route?: string;
  children?: ISidebarPage[];
}

export class SidebarPageClass implements ISidebarPage {
  label: string;
  icon: ZardIcon;
  group?: string;
  route?: string;
  children?: ISidebarPage[];

  constructor(data: Partial<ISidebarPage> = {}) {
    this.label = data.label || '';
    this.icon = data.icon || 'circle';
    this.group = data.group;
    this.route = data.route;
    this.children = data.children;
  }
}

export interface ISidebarUser {
  name: string;
  username: string;
  imageUrl?: string;
}

export class SidebarUserClass implements ISidebarUser {
  name: string;
  username: string;
  imageUrl?: string;

  constructor(data: Partial<ISidebarUser> = {}) {
    this.name = data.name || '';
    this.username = data.username || '';
    this.imageUrl = data.imageUrl;
  }
}
