import { Injectable, inject, OnDestroy } from '@angular/core';
import { ENVIRONMENT } from '@ihsan/core';
import { toast } from 'ngx-sonner';
import { Subject } from 'rxjs';
import { BaseSignalrService } from './base-signalr.service';

export interface SignalRNotification {
  title?: string;
  message?: string;
  content?: string;
  body?: string;
  type?: string;
  queueItemId?: number;
  /** JSON-encoded string. A `"silent": true` marker inside it suppresses the toast popup below
   * (used for high-frequency internal events, e.g. Nasheed ingestion progress, that should update
   * the UI live without popping a notification per event). */
  data?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class SignalrService extends BaseSignalrService implements OnDestroy {
  public notificationReceived = new Subject<SignalRNotification>();
  private env = inject(ENVIRONMENT);

  public override initializeConnection(): void {
    // Routed through Gateway, not Notification's own port directly — that port is
    // 127.0.0.1-bound on PC2 (July 2026 security audit) and unreachable via the public
    // hostname. Gateway's "notification-hub-route" (Gateway.API/appsettings.json) proxies
    // WebSocket upgrades transparently.
    const hubUrl = `${this.env.apiUrls.gateway}/hubs/notifications`;
    super.initializeConnection(hubUrl);
  }

  protected override onConnectionSuccess(): void {
    toast.success('Connected to notifications server', {
      duration: 3000,
    });
  }

  protected override addListeners(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on(
      'ReceiveNotification',
      (data: SignalRNotification) => {
        this.notificationReceived.next(data);

        if (data?.queueItemId) {
          this.acknowledgeDelivery(data.queueItemId);
        }

        if (this.isSilent(data)) {
          return;
        }

        const title = data?.title || 'New Notification';
        const description =
          data?.message ||
          data?.body ||
          data?.content ||
          'You have received a new notification';

        toast.info(title, {
          description: description,
          duration: 5000,
        });
      }
    );
  }

  private isSilent(notification: SignalRNotification): boolean {
    if (typeof notification?.data !== 'string') return false;
    try {
      return JSON.parse(notification.data)?.silent === true;
    } catch {
      return false;
    }
  }

  public async acknowledgeDelivery(queueItemId: number): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('AcknowledgeDelivery', queueItemId);
        console.info(
          `Successfully acknowledged delivery for queue item: ${queueItemId}`
        );
      } catch (error) {
        console.error(
          `Failed to acknowledge delivery for queue item: ${queueItemId}`,
          error
        );
      }
    } else {
      console.warn(
        'Cannot acknowledge delivery: SignalR connection is not active.'
      );
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.notificationReceived.complete();
  }
}
