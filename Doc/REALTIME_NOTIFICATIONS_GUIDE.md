# Real-Time Notifications (SignalR) Guide

**Purpose:** How the Angular frontend connects to the backend Notification service's SignalR hub, and the convention for feeding a real-time push into app-specific state without spamming a toast popup.
**Read When:**

- Connecting a new app (`apps/*/admin`) to the notification hub
- Adding a new domain-specific real-time listener (e.g. a feature's own events service reacting to a live push)
- Deciding whether a new backend-pushed event should show a toast or update the UI silently
- Debugging why a notification isn't updating a table, or why it's popping an unwanted toast

---

## Architecture

```
Backend Notification service (/hubs/notifications)
        │  "ReceiveNotification" event
        ▼
BaseSignalrService (libs/shared/src/lib/services/base-signalr.service.ts)
  — owns the HubConnection lifecycle: connect, auto-reconnect, token/tenant, stop on destroy
        │
        ▼
SignalrService (libs/shared/src/lib/services/signalr.service.ts)
  — the app-wide concrete connection (one per app: admin, nasheed/admin, polysnap/admin)
  — exposes `notificationReceived: Subject<SignalRNotification>` — every push, unfiltered
  — shows a toast for every push EXCEPT ones marked `"silent": true` in the `data` payload
        │
        ▼
Domain-specific listeners (e.g. libs/nasheed/shared's IngestionEventsService, SongEventsService)
  — inject SignalrService, subscribe to notificationReceived
  — filter by a payload marker specific to their event (e.g. `event: "nasheed-ingestion-progress"`)
  — call their own notifyDataChanged() to trigger a table refetch
```

`SignalrService.initializeConnection()` is called once per app, in that app's root component (e.g. `apps/nasheed/admin/src/app/app.ts`) inside `constructor()` guarded by `isPlatformBrowser`. Do not call it again elsewhere — `BaseSignalrService.initializeConnection()` is already a no-op if the connection is already `Connected`.

## The `"silent": true` convention

There is no server-side concept of a silent notification — the backend's `deliveryType` field (`"SignalR"`, `"Firebase"`, or `"Both"`) only controls which *server-side* channel(s) dispatch it. Toast suppression is a purely frontend concern, implemented once in the shared `SignalrService`:

```ts
// libs/shared/src/lib/services/signalr.service.ts
private isSilent(notification: SignalRNotification): boolean {
  if (typeof notification?.data !== 'string') return false;
  try {
    return JSON.parse(notification.data)?.silent === true;
  } catch {
    return false;
  }
}
```

`notificationReceived.next(data)` still fires for silent notifications — only the toast is skipped. Any backend producer of a high-frequency, internal-progress-style push (job status, sync progress, etc.) should set `"silent": true` inside its JSON `data` payload rather than accepting toast spam per event. See `MicroservicesArchitecture/Doc/NOTIFICATION_SERVICE_README.md` "Known Service-to-Service Consumers" for the backend side of this convention.

## Adding a new domain-specific real-time listener

Reference implementation: `libs/nasheed/shared/src/lib/nasheed-shared/services/ingestion-events.service.ts` and `song-events.service.ts`, driven by ingestion job-status pushes documented in `MicroservicesArchitecture/Doc/../src/Apps/Nasheed/Doc/INGESTION_PIPELINE.md` "Real-Time Progress Broadcast".

1. Give the backend event a unique `event` marker string inside its `data` JSON payload (e.g. `"nasheed-ingestion-progress"`). Keep the check function next to the constant so both stay in sync — see `libs/nasheed/shared/src/lib/nasheed-shared/services/nasheed-realtime.constants.ts`.
2. In the `providedIn: 'root'` events/state service that already owns a `dataChanged$` refetch bus for its feature (do **not** create a second bus), inject `SignalrService` from `@ihsan/shared` and subscribe in the constructor:

   ```ts
   constructor() {
     this._signalrService.notificationReceived.subscribe((notification) => {
       if (isNasheedIngestionProgressNotification(notification)) {
         this.notifyDataChanged();
       }
     });
   }
   ```
3. Do **not** modify `libs/shared`'s `SignalrService`/`BaseSignalrService` to know about domain-specific event types — `libs/shared` is generic and consumed by every app; domain filtering belongs in the domain lib (e.g. `libs/nasheed/shared`), which is allowed to depend on `@ihsan/shared` (not the reverse).
4. If the push should never show a toast, make sure the backend producer sets `"silent": true` in its payload — that's a backend-side change, not something the frontend listener controls.

This pattern intentionally reuses the existing full-refetch-on-change convention (`dataChanged$` → `loadData()`) rather than pushing a partial/targeted row update — consistent with how manual mutations (create/edit/delete/retry) already trigger the same bus. If a future feature needs a lower-latency partial update instead of a full refetch, that's a separate, larger change to the events-service contract — don't special-case it just for the real-time path.

## Environment / hub URL

Never hardcode a port or host. The hub URL is built from the injected `ENVIRONMENT` token's `apiUrls.notification`, exactly like `SignalrService.initializeConnection()` does:

```ts
const hubUrl = `${this.env.apiUrls.notification}/hubs/notifications`;
```

Every app's `environments/environment*.ts` must have `apiUrls.notification` set for this to work — check the app you're wiring up if the connection fails to establish.

---

**Last Updated:** August 2026
**Version:** 1.0
