# Quick Start Guide

> **⚠️ Having issues?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common errors and solutions.

## ⚡ Quick Commands

```bash
# Start development (web-app on port 4200)
npx nx serve web-app

# Start playground (on port 4201)
npx nx serve playground

# Build
npx nx build web-app
npx nx build playground

# Test
npx nx test web-app
npx nx test playground

# Lint
npx nx lint web-app
npx nx lint playground

# Generate new application
npx nx g @nx/angular:application my-app --directory=apps

# Generate component
npx nx g @nx/angular:component my-component --project=shared --standalone

# Generate service
npx nx g @nx/angular:service my-service --project=core

# Generate library
npx nx g @nx/angular:library my-feature --directory=libs/features/my-feature
```

## 📁 Where to Put Your Code

### Models (Interfaces + Classes)

```
libs/core/src/lib/models/your-model.model.ts
```

### Services

```
libs/core/src/lib/services/your-service.service.ts
```

### Reusable Components

```
libs/shared/src/lib/components/your-component/
```

### Feature Modules

```
libs/features/feature-name/
```

## 🎨 Creating a Component

```typescript
// user-list.component.ts
import { Component, input, output, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  // Inputs
  users = input.required<User[]>();

  // Outputs
  userSelected = output<User>();

  // State
  private _selectedId = signal<string>('');

  onSelect(user: User): void {
    this._selectedId.set(user.id);
    this.userSelected.emit(user);
  }
}
```

## 🎨 Component Styling

```scss
// user-list.component.scss
:host {
  display: block;
  padding: var(--spacing-md);

  .user-row {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: background-color var(--transition-fast);

    &:hover {
      background-color: var(--surface-color);
    }

    &.selected {
      background-color: var(--primary-color);
      color: white;
    }
  }

  // RTL Support
  :host-context([dir='rtl']) & {
    text-align: right;
  }
}
```

## 📦 Using Services

```typescript
// app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <button (click)="toggleTheme()">Toggle Theme</button>
    <button (click)="toggleDirection()">Toggle Direction</button>
  `,
})
export class AppComponent {
  private _themeService = inject(ThemeService);

  toggleTheme(): void {
    this._themeService.toggleTheme();
  }

  toggleDirection(): void {
    this._themeService.toggleDirection();
  }
}
```

## 🌐 HTTP Service Example

```typescript
// user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, IUser } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _http = inject(HttpClient);
  private _baseUrl = '/api/users';

  getUsers(): Observable<User[]> {
    return this._http
      .get<IUser[]>(this._baseUrl)
      .pipe(map((users) => users.map((u) => new User(u))));
  }

  getUserById(id: string): Observable<User> {
    return this._http
      .get<IUser>(`${this._baseUrl}/${id}`)
      .pipe(map((user) => new User(user)));
  }

  createUser(user: Partial<IUser>): Observable<User> {
    return this._http
      .post<IUser>(this._baseUrl, user)
      .pipe(map((u) => new User(u)));
  }

  updateUser(id: string, user: Partial<IUser>): Observable<User> {
    return this._http
      .put<IUser>(`${this._baseUrl}/${id}`, user)
      .pipe(map((u) => new User(u)));
  }

  deleteUser(id: string): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/${id}`);
  }
}
```

## 🔒 Creating Guards

```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

## 🎯 Creating Interceptors

```typescript
// auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
```

## 🚦 Routing Example

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
```

## 🧪 Testing Example

```typescript
// user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '@core/models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch users', () => {
    const mockUsers = [{ id: '1', name: 'John', email: 'john@example.com' }];

    service.getUsers().subscribe((users) => {
      expect(users).toHaveLength(1);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[0].name).toBe('John');
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });
});
```

## 📝 Remember

- ✅ Always use signal `input()` and `output()`
- ✅ Private variables with `_` prefix
- ✅ Observables with `$` suffix
- ✅ Interface + Class for entities
- ✅ Use `inject()` for dependencies
- ✅ Style from `:host` in SCSS
- ✅ Use CSS variables
- ✅ Import only needed Material modules
- ✅ Write minimal code

---

**Need help?**

- **Errors?** → Check `TROUBLESHOOTING.md` first
- **Architecture?** → Check `PROJECT_STRUCTURE.md`
- **Coding standards?** → Check `.github/.copilot-instructions.md`

## 🚨 Common Issues

### Error: Cannot find module '@angular/animations/browser'

```bash
npm install @angular/animations@~20.3.0
```

### Error: Undefined function mat.define-palette()

Angular Material 20+ uses M3 API. Update your theme file to use `mat.define-theme()` instead.
See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for details.

### Error: The current directory isn't part of an Nx workspace

In PowerShell, use quotes for paths with spaces:

```powershell
cd "C:\Users\Name With Spaces\..." ; npx nx serve playground
```

For more issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
