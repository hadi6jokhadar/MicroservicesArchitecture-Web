export enum DeliveryType {
  SignalR = 1,
  Firebase = 2,
  Both = 3,
}

export enum Priority {
  Waitable = 0,
  Immediate = 1,
}

export enum QueueStatus {
  Pending = 0,
  Processing = 1,
  Sent = 2,
  Failed = 3,
  Expired = 4,
}

export interface INotificationResponse {
  id: number;
  title: string;
  message?: string;
  data?: string;
  isRead: boolean;
  readAt?: string;
  userId?: number;
  // BaseDto properties
  created: string;
  createdBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  isArchived: boolean;
  status: boolean;
}

export class NotificationResponseClass implements INotificationResponse {
  id: number;
  title: string;
  message?: string;
  data?: string;
  isRead: boolean;
  readAt?: string;
  userId?: number;
  created: string;
  createdBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  isArchived: boolean;
  status: boolean;

  constructor(data: Partial<INotificationResponse> = {}) {
    this.id = data.id || 0;
    this.title = data.title || '';
    this.message = data.message;
    this.data = data.data;
    this.isRead = data.isRead ?? false;
    this.readAt = data.readAt;
    this.userId = data.userId;
    this.created = data.created || '';
    this.createdBy = data.createdBy;
    this.lastModified = data.lastModified;
    this.lastModifiedBy = data.lastModifiedBy;
    this.isArchived = data.isArchived ?? false;
    this.status = data.status ?? true;
  }
}

export interface ISendNotificationResponse {
  queueItemId: number;
  status: string;
  queuedAt: string;
  priority?: string;
  deliveryType?: string;
}

export class SendNotificationResponseClass
  implements ISendNotificationResponse
{
  queueItemId: number;
  status: string;
  queuedAt: string;
  priority?: string;
  deliveryType?: string;

  constructor(data: Partial<ISendNotificationResponse> = {}) {
    this.queueItemId = data.queueItemId || 0;
    this.status = data.status || 'Queued';
    this.queuedAt = data.queuedAt || '';
    this.priority = data.priority;
    this.deliveryType = data.deliveryType;
  }
}

export interface IQueueItemStatusResponse {
  queueItemId: number;
  status: string;
  retryCount: number;
  processedAt?: string;
  error?: string;
  notificationId?: number;
  created: string;
}

export class QueueItemStatusResponseClass implements IQueueItemStatusResponse {
  queueItemId: number;
  status: string;
  retryCount: number;
  processedAt?: string;
  error?: string;
  notificationId?: number;
  created: string;

  constructor(data: Partial<IQueueItemStatusResponse> = {}) {
    this.queueItemId = data.queueItemId || 0;
    this.status = data.status || '';
    this.retryCount = data.retryCount || 0;
    this.processedAt = data.processedAt;
    this.error = data.error;
    this.notificationId = data.notificationId;
    this.created = data.created || '';
  }
}

export interface IQueueItemDto {
  id: number;
  tenantId?: string;
  userId?: number;
  deliveryType: DeliveryType;
  priority: Priority;
  title: string;
  message?: string;
  data?: string;
  queueStatus: QueueStatus;
  retryCount: number;
  processedAt?: string;
  expiresAt: string;
  error?: string;
  notificationId?: number;
  // BaseDto properties
  created: string;
  createdBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  isArchived: boolean;
  status: boolean;
}

export class QueueItemDtoClass implements IQueueItemDto {
  id: number;
  tenantId?: string;
  userId?: number;
  deliveryType: DeliveryType;
  priority: Priority;
  title: string;
  message?: string;
  data?: string;
  queueStatus: QueueStatus;
  retryCount: number;
  processedAt?: string;
  expiresAt: string;
  error?: string;
  notificationId?: number;
  created: string;
  createdBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  isArchived: boolean;
  status: boolean;

  constructor(data: Partial<IQueueItemDto> = {}) {
    this.id = data.id || 0;
    this.tenantId = data.tenantId;
    this.userId = data.userId;
    this.deliveryType = data.deliveryType ?? DeliveryType.SignalR;
    this.priority = data.priority ?? Priority.Waitable;
    this.title = data.title || '';
    this.message = data.message;
    this.data = data.data;
    this.queueStatus = data.queueStatus ?? QueueStatus.Pending;
    this.retryCount = data.retryCount || 0;
    this.processedAt = data.processedAt;
    this.expiresAt = data.expiresAt || '';
    this.error = data.error;
    this.notificationId = data.notificationId;
    this.created = data.created || '';
    this.createdBy = data.createdBy;
    this.lastModified = data.lastModified;
    this.lastModifiedBy = data.lastModifiedBy;
    this.isArchived = data.isArchived ?? false;
    this.status = data.status ?? true;
  }
}

export interface ISendNotificationRequest {
  tenantId: string;
  userId: number;
  title: string;
  message: string;
  data?: string;
  deliveryType?: DeliveryType;
  priority?: Priority;
}
