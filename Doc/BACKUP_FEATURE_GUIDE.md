# Backup Feature Guide

**Version:** 1.0
**Status:** ✅ Complete

---

## Overview

Admin UI for the platform's centralized database backup/restore service (backend: `MicroservicesArchitecture/Doc/BACKUP_SERVICE_GUIDE.md`, port 5010, reached through the Gateway like every other admin feature). Gives a SuperAdmin one place to see backup status per database (service global DB or tenant DB), trigger a backup for any database on demand, and restore from a completed backup.

Sidebar: **Backup** (System group, SuperAdmin only) → **Overview** and **History** children — same shell pattern as the Identity feature (`IdentityComponent` + child routes).

---

## Features

### Overview (`/backup/overview`) — the flagship status table

- One row per known database (every service's global DB + every active tenant), consuming `GET /api/v1/admin/backups/summary`.
- Columns: target name + scope badge, last backup time, run status, **independent Local Status and Cloud Status badges** (mirrors the backend's dual "saved locally / safely offsite" tracking), size, error (truncated with tooltip).
- Row actions (dropdown): **Trigger Backup Now**, **Enable/Disable** (scheduled backups for this target), **View Last Run** (opens a detail sheet), **Restore** (shown only once a run has `Status: Completed`).
- Header action: **New Backup** — opens a dialog to trigger a backup for *any* service/tenant, including ones with no row yet (the backend auto-creates the target and adds it to the nightly schedule in the same call).

### History (`/backup/history`)

Two tabs (plain signal-driven `z-button` toggle, not `z-tabs` — same pattern as `ai-token-usage-logs`' table/charts toggle):

- **Backups** tab — paginated, filterable log of every backup run (`GET /api/v1/admin/backups`) — filters: scope, status, service name, tenant ID. Same View/Restore row actions as Overview.
- **Restores** tab — paginated log of every restore attempt (`GET /api/v1/admin/restores`, no filters — the backend query only takes pagination). Columns: backup run reference, status, triggered by, started/completed, error. Row action: "View" opens the *backup* run's detail sheet (the one that was restored from), since a restore doesn't have its own detail view.

Each tab has its own independent pagination state (`BackupService.totalCount`/`totalPages` for backups, `restoreRunsTotalCount`/`restoreRunsTotalPages` for restores — kept as separate signals specifically so switching tabs doesn't clobber the other tab's page count).

### Shared dialogs/sheet

- **View Backup Run** (sheet) — full run detail: scope, target, database, trigger type, status, started/completed, local file path + status, cloud storage key + status, file size, SHA-256 checksum, error message.
- **Restore Backup** (dialog) — destructive action gated behind a required confirmation checkbox (`Validators.requiredTrue`), plus an optional "advanced" target-connection override field (inside a `z-accordion`) to restore into a different database instead of the original.
- **Trigger Backup** (dialog) — pick Scope (Global Service / Tenant), then either select a known service from a static list or type a tenant ID.

---

## Architecture

### File structure

```
libs/core/src/lib/backup/
├── models.ts                          # IBackupTarget/Run/RestoreRun/Summary + request DTOs
├── backup.service.ts                  # HTTP service, signal-backed state
├── backup.resolver.ts                 # backupSummaryResolver (pre-warms Overview data)
└── index.ts

apps/admin/src/app/features/backup/
├── backup.routes.ts                   # shell + overview/history children
├── backup.component.ts/.html          # router-outlet shell (mirrors IdentityComponent)
├── backup-events.service.ts           # dataChanged$ — refresh-after-mutation coordination
├── overview/
│   └── backup-overview.component.{ts,html,scss}
├── history/
│   └── backup-history.component.{ts,html,scss}
├── view-backup-run-sheet/
│   └── view-backup-run-sheet.component.{ts,html,scss}
├── restore-backup-dialog/
│   └── restore-backup-dialog.component.{ts,html,scss}
└── trigger-backup-dialog/
    └── trigger-backup-dialog.component.{ts,html,scss}
```

### BackupService

**Location:** `libs/core/src/lib/backup/backup.service.ts`
**Base URL:** `` `${ENVIRONMENT.apiUrls.gateway}/api/v1/admin` `` — same gateway-routed pattern as `TenantService`, never a raw port.

```typescript
getBackupTargets(): Observable<IBackupTarget[]>
updateBackupTarget(id, request, context?): Observable<IBackupTarget>
getBackupSummary(): Observable<IBackupSummary[]>
triggerBackup(request, context?): Observable<IBackupRun>
getBackupRuns(filter?): Observable<IPaginatedResponse<IBackupRun>>
getBackupRunById(id): Observable<IBackupRun>
restoreBackup(id, request, context?): Observable<IRestoreRun>
getRestoreRuns(filter?): Observable<IPaginatedResponse<IRestoreRun>>
```

**Important:** every enum-shaped field (`scope`, `status`, `localStatus`, `cloudStatus`, `triggerType`) is a **plain string** on the wire (`"GlobalService"`, `"Completed"`, ...) — the backend DTOs map C# enums to strings manually via `.ToString()`. Models type these fields as `string`, and badge/label lookups compare against the literal string values (e.g. `status === 'Completed'`), not numeric enum indices — unlike, say, `QueueStatus` in the Notification feature, which *is* a numeric enum reverse-looked-up by value.

### BackupEventsService

Same `dataChanged$` `Subject`-based coordination as `TenantEventsService`/`CategoryEventsService`: dialogs call `notifyDataChanged()` on success, both `BackupOverviewComponent` and `BackupHistoryComponent` subscribe in their constructors and reload. This is what makes triggering a backup from the History page immediately reflect on Overview (and vice versa) without a manual refresh.

---

## UI Patterns

### Enable/disable a target — confirm dialog, not an inline switch

There's no inline `z-switch` per row anywhere in this codebase's tables — the established convention for any row-level state flip is confirm-dialog + dropdown-item + full reload (`ZardAlertDialogService.confirm()`, same shape as `tenant-list.component.ts`'s `onToggleArchive`/`users.component.ts`'s `onToggleStatus`). `onToggleEnable()` in `backup-overview.component.ts` follows this exactly.

### Status → badge mapping (string-valued)

```typescript
getStatusBadgeType(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Completed': return 'default';
    case 'Running': return 'secondary';
    case 'Failed': return 'destructive';
    default: return 'outline'; // Pending
  }
}
```
Same shape repeated for `getLocalStatusBadgeType`/`getCloudStatusBadgeType` with their own value sets (`Saved`/`Uploaded`/`Disabled`/etc.). Labels are translated via `'backup.status.' + status.toLowerCase() | translate`.

### Trigger/Restore dialogs — SKIP_ERROR_TOAST + inline error

Both dialogs follow the standard dialog pattern (`add-role-dialog.component.ts` is the canonical reference): `new HttpContext().set(SKIP_ERROR_TOAST, true)` on the HTTP call, `toast.success(...)` + `dialogRef.close({ success: true })` on success, `<z-alert zType="destructive">` populated from `extractErrorMessage(error)` on failure. Both are opened via `ZardDialogService.create({ zTitle, zContent, ... })` with the title passed at the call site (not rendered inside the dialog's own template).

### Read-only detail sheet

`ViewBackupRunSheetComponent` fetches the full `IBackupRun` via `getBackupRunById(runId)` in `ngOnInit` (the summary/list rows only carry a subset of fields) and renders `.info-group` blocks in a `grid grid-cols-2 gap-4` layout — same structure as Notification's `view-queue-item-sheet.component.ts`.

---

## Backend Integration

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/admin/backup-targets` | GET | List all registered targets |
| `/api/v1/admin/backup-targets/{id}` | PATCH | Enable/disable, adjust retention |
| `/api/v1/admin/backups/trigger` | POST | On-demand backup (find-or-creates the target) |
| `/api/v1/admin/backups/summary` | GET | **Overview page's data source** |
| `/api/v1/admin/backups` | GET | **History page's data source** (paginated) |
| `/api/v1/admin/backups/{id}` | GET | Single run detail (the view sheet) |
| `/api/v1/admin/backups/{id}/restore` | POST | Restore (requires `confirm: true`) |
| `/api/v1/admin/restores` | GET | Restore run history — **History page's Restores tab** |

Full backend behavior (scheduling, target auto-discovery, retention, cloud upload) is documented in `MicroservicesArchitecture/Doc/BACKUP_SERVICE_GUIDE.md`.

---

## Known limitations

- **Restoring a database does not invalidate any application-level cache in front of it.** `pg_restore` only touches PostgreSQL — it has no visibility into Redis or in-memory caches a running service holds (e.g. Category service caches its category tree in Redis). Confirmed by direct testing: modifying a row, restoring the pre-modification backup, and re-querying PostgreSQL directly showed the correct reverted data every time — but a service that's still running and serving from its own cache will keep showing the pre-restore value until that cache expires or the service restarts. **After any restore, restart the affected service(s) (or flush their cache) before verifying** — don't conclude a restore "didn't work" from stale application-level reads.
- **Restores tab has no filters.** The backend's `GET /api/v1/admin/restores` only supports pagination, not scope/status/date filtering like backups do.
- **Known service list for the Trigger dialog is hardcoded** (`KNOWN_GLOBAL_SERVICES` in `trigger-backup-dialog.component.ts`) — there's no "list configured global targets" endpoint distinct from `GET /backup-targets`, so this mirrors the backend's `Backup:GlobalTargets` appsettings entries by hand. Keep both in sync if a new platform service is added.

---

## Related Documentation

- Backend: `MicroservicesArchitecture/Doc/BACKUP_SERVICE_GUIDE.md`
- Dialog patterns: `DIALOG_DESIGN_GUIDE.md`
- Zardui components: `ZARDUI_AI_REFERENCE.md`
- Error handling / `SKIP_ERROR_TOAST`: `ERROR_HANDLER_USAGE_GUIDE.md`
