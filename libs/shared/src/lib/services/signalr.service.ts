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
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class SignalrService extends BaseSignalrService implements OnDestroy {
  public notificationReceived = new Subject<SignalRNotification>();
  private env = inject(ENVIRONMENT);

  public override initializeConnection(): void {
    const hubUrl = `${this.env.apiUrls.notification}/hubs/notifications`;
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

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.notificationReceived.complete();
  }
}
