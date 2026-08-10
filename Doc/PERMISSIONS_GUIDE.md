# Permission Claims — Frontend Guide

Roles gate broad access (`Admin`, `SuperAdmin`, ...). **Permission claims** gate a narrower slice of access for a lower-privileged role — e.g. a "data entry" hire who may create/edit songs but not delete them. Claims are created as plain data in Identity's admin UI (`/identity/roles`, `/identity/claims`) — see `MicroservicesArchitecture/Doc/SHARED_IDENTITY_SERVICE_GUIDE.md`'s "Permission Claims" section for the backend half of this pattern.

> **Backend guide:** `MicroservicesArchitecture/Doc/SHARED_IDENTITY_SERVICE_GUIDE.md` (Permission Claims section) and `MicroservicesArchitecture/src/Apps/Nasheed/Doc/API_ENDPOINTS.md` ("Content-Editor Permission Claims") for the reference implementation.

---

## Quick Reference

| Need | What to use |
|---|---|
| Guard a route by role OR permission | `roleGuard` + `data: { roles: [...], permissions: [...] }` |
| Hide/show a sidebar page by role OR permission | `ISidebarPage.roles` / `ISidebarPage.permissions` |
| Read the current user's permissions in TypeScript | `AuthService.currentUser()?.permissions` (`string[]`) |
| Gate an action button (create/edit/delete) inside a page | A local `computed()` in the component — see "Action-Level Gating" below |

---

## Where a Permission Claim Comes From

The `/api/v1/user/profile` response already nests claims under each role: `IUser.roles[].claims[]` (`IClaim { claimType, claimValue, ... }`). `UserClass` (`libs/core/src/lib/identity/models.ts`) flattens every claim with `claimType === 'Permission'` across all of the user's roles into a single `permissions: string[]` array, computed once in its constructor — mirroring how `roles` is already derived. Nothing needs to be fetched separately; `permissions` is populated wherever a `UserClass` is constructed (login response, profile refresh).

```typescript
const user = this._authService.currentUser();
user?.permissions; // e.g. ['nasheed.songs.create', 'nasheed.pages.songs']
```

**System claims are read-only in the admin UI.** `IClaim.isSystemClaim` (`libs/core/src/lib/identity/models.ts`) marks a claim as seeded by the backend's `SystemPermissionCatalog` (never created by hand — see the backend guide's "Permission Claims" section). The claims admin page (`libs/shared/src/lib/features/identity/claims/claims.component.html`) shows a "System Claim" badge for these and hides their Delete menu item — matching the backend's 400 rejection if you tried to delete/rename one via the API directly.

---

## Route Guard — `roleGuard` (role OR permission)

`roleGuard` (`libs/core/src/lib/identity/role.guard.ts`) checks **both** `data.roles` and `data.permissions` — a route is reachable if the user holds *any* of the required roles **or** *any* of the required permissions. This mirrors the backend's `RequireAssertion(role-check OR claim-check)` pattern so a role page shows up for both an Admin (via role) and a data-entry user (via permission).

```typescript
{
  path: 'songs',
  loadChildren: () => import('../features/songs/songs.routes').then((m) => m.SONGS_ROUTES),
  canActivate: [authGuard, roleGuard],
  data: {
    roles: ['Admin', 'SuperAdmin'],
    permissions: ['nasheed.pages.songs'],
  },
},
```

If `data` has neither `roles` nor `permissions`, the route is open to any authenticated user (unchanged from before this pattern existed).

---

## Sidebar Visibility — `ISidebarPage.permissions`

`SidebarComponent`'s `_canShowPage()` (`libs/shared/src/lib/components/sidebar/sidebar.component.ts`) applies the identical role-OR-permission check to menu items. Add `permissions` alongside `roles` on any `SidebarPageClass` entry:

```typescript
new SidebarPageClass({
  translationKey: 'sidebar.pages.songs',
  icon: 'music' as ZardIcon,
  route: '/songs',
  roles: ['Admin', 'SuperAdmin'],
  permissions: ['nasheed.pages.songs'],
}),
```

The app's `currentUser` computed must also forward `permissions` onto `ISidebarUser`, alongside `roles`. **This is currently only wired up in `apps/nasheed/admin/src/app/pages/pages.component.ts`** — `apps/admin`'s own `pages.component.ts` still builds its `SidebarUserClass` without a `permissions` array. If `apps/admin` ever adds a `permissions`-gated sidebar entry, its `currentUser` computed must be updated the same way first, or that entry will never resolve as visible.

```typescript
return new SidebarUserClass({
  name,
  username: user?.email || '',
  roles: user?.roles?.map((r) => r.name) || [],
  permissions: user?.permissions || [],
});
```

---

## Action-Level Gating (Create/Edit/Delete Buttons)

Route/sidebar gating controls whether a **page** is reachable — it does not by itself hide individual buttons on a shared page that both Admins and a lower-privileged role can see (e.g. Songs, where a data-entry user should see "Add" and "Edit" but never "Delete"). There is no generic directive for this yet — gate it with a small `computed()` in the component, following the pattern in `apps/nasheed/admin/src/app/features/songs/songs.component.ts`:

```typescript
private static readonly ADMIN_ROLES = ['Admin', 'Superadmin', 'SuperAdmin'];

readonly isAdmin = computed(() => {
  const roles = this._authService.currentUser()?.roles?.map((r) => r.name) ?? [];
  return roles.some((role) => SongsComponent.ADMIN_ROLES.includes(role));
});

readonly canCreateSongs = computed(
  () => this.isAdmin() || (this._authService.currentUser()?.permissions ?? []).includes('nasheed.songs.create'),
);

/** Admins may edit any record; everyone else only the ones they created. */
canEditSong(song: SongModel): boolean {
  if (this.isAdmin()) return true;
  const currentUserId = this._authService.currentUser()?.id;
  return currentUserId != null && song.createdBy === String(currentUserId);
}
```

```html
@if (canCreateSongs()) {
  <button z-button (click)="onAddSong()">...</button>
}
...
@if (canEditSong(song)) {
  <z-dropdown-menu-item (click)="onEditSong(song)">...</z-dropdown-menu-item>
}
@if (isAdmin()) {
  <!-- delete and other admin-only actions the role never gets a claim for -->
}
```

**Ownership comparison note:** a DTO's `createdBy` field (present on any entity inheriting the shared `BaseDto`/`BaseEntity`) is the string form of the creating user's id (`ICurrentUserService.UserId`, itself the JWT's `NameIdentifier`) — compare it with `String(currentUser.id)`, not `currentUser.id` directly (numeric vs string). If a model doesn't yet expose `createdBy`, add it to the backend DTO's `MapFrom` (it's already a field on `BaseDto`, usually just unset) and the frontend model interface — see `SongDto.cs`/`song.model.ts` for the reference addition.

**This is a UX nicety, not the security boundary** — the backend's claim-checked policy (and any ownership check inside the command handler) is what actually enforces the restriction. A hidden button that could still be reached by a stale UI or crafted request must 403 on the backend regardless of what the frontend shows.

**Not every action-gated feature needs an ownership check.** Artists (`apps/nasheed/admin/src/app/features/artists/artists.component.ts`) follows the same `isAdmin`/`canCreateArtists` pattern as Songs' `canCreateSongs`, but Edit/Delete stay `isAdmin()`-only — there's no `canEditArtist` ownership variant, because artist records aren't attributed to the user who created them the way songs are. Use the ownership-comparison variant (`canEditSong`-style) only when the entity actually tracks a creator and the backend enforces that ownership check too.

---

## What NOT to Do

| ❌ Wrong | ✅ Correct |
|---|---|
| Add a new `IClaim`-shaped field just to check permissions | Use `UserClass.permissions` — already flattened from `roles[].claims[]` |
| Gate a route by permission only, dropping the role check | Always pass both `roles` and `permissions` in route `data` — Admin must keep working without needing a claim |
| Assume hiding a button is sufficient security | The backend policy/ownership check is the real boundary — frontend gating only improves the experience |
| Hardcode a permission string in more than one place per app | Keep it inline where used (unlike feature flags, there's no shared `Permissions` constants file yet — add one if a third consumer appears) |
