import type { ZardIcon } from '@ihsan/ui';

export interface ISidebarPage {
  translationKey: string;
  icon: ZardIcon;
  group?: string;
  route?: string;
  action?: () => void;
  children?: ISidebarPage[];
}

export class SidebarPageClass implements ISidebarPage {
  translationKey: string;
  icon: ZardIcon;
  group?: string;
  route?: string;
  action?: () => void;
  children?: ISidebarPage[];

  constructor(data: Partial<ISidebarPage> = {}) {
    this.translationKey = data.translationKey || '';
    this.icon = data.icon || 'circle';
    this.group = data.group;
    this.route = data.route;
    this.action = data.action;
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
