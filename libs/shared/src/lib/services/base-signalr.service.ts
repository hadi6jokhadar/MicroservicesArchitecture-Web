import { inject, Injectable, OnDestroy } from '@angular/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  HubConnection,
  HubConnectionState,
  HubConnectionBuilder,
} from '@microsoft/signalr';
import { IdentityStorageService, TenantService } from '@ihsan/core';

@Injectable()
export abstract class BaseSignalrService implements OnDestroy {
  protected hubConnection: HubConnection | null = null;

  protected identityStorage = inject(IdentityStorageService);
  protected tenantService = inject(TenantService);

  /**
   * Initializes the SignalR connection using the provided base URL.
   * Handles appending the tenantId if available and setting up the access token.
   * @param hubUrl The endpoint URL for the SignalR hub.
   */
  public initializeConnection(hubUrl: string): void {
    if (
      this.hubConnection &&
      this.hubConnection.state === HubConnectionState.Connected
    ) {
      return;
    }

    const token = this.identityStorage.getAccessToken();
    const tenantId = this.tenantService.getCurrentTenantId;

    let finalHubUrl = hubUrl;
    if (tenantId) {
      finalHubUrl += `?tenantId=${encodeURIComponent(tenantId)}`;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(finalHubUrl, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log(`SignalR connection established to ${hubUrl}.`);
        this.onConnectionSuccess();
        this.addListeners();
      })
      .catch((err: unknown) => {
        console.error(
          `Error while establishing SignalR connection to ${hubUrl}:`,
          err
        );
      });
  }

  /**
   * Hook for actions to perform upon successful connection.
   */
  protected abstract onConnectionSuccess(): void;

  /**
   * Hook for adding specific listeners to the hub connection.
   */
  protected abstract addListeners(): void;

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => console.log('SignalR connection stopped.'))
        .catch((err: unknown) =>
          console.error('Error while stopping SignalR connection:', err)
        );
    }
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}
