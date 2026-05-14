import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { LoginRequest, User, UserRole } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';

const USER_STORAGE_KEY = 'vm-manager:user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(this.restoreUser());
  private readonly _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed<UserRole | null>(() => this._user()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly initials = computed(() => {
    const name = this._user()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  });

  login(payload: LoginRequest): Observable<User> {
    this._loading.set(true);
    return this.authService.login(payload).pipe(
      tap((user) => {
        this._user.set(user);
        this.persistUser(user);
        this.notifications.success(`Welcome back, ${user.name}!`);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.handleLogout(),
      error: () => this.handleLogout(),
    });
  }

  /**
   * Confirms the HttpOnly session with `GET /vms` (same contract as the backend). Started once at
   * bootstrap (`provideAppInitializer`); it must not block app bootstrap or the UI can hang on a
   * blank shell if this request never completes.
   */
  hydrateSession(): Observable<void> {
    if (this._user() === null) {
      return of(void 0);
    }

    return this.authService.validateSession().pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          this.clearUser();
        }
        return of(void 0);
      }),
    );
  }

  /** @deprecated Prefer `hydrateSession()` for bootstrap; kept for call sites if any. */
  hydrateFromServer(): void {
    this.hydrateSession().subscribe();
  }

  clearUser(): void {
    this._user.set(null);
    this.persistUser(null);
  }

  private handleLogout(): void {
    this.clearUser();
    this.notifications.info('Signed out successfully.');
    this.router.navigate(['/login']);
  }

  private restoreUser(): User | null {
    try {
      const raw = globalThis.localStorage?.getItem(USER_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private persistUser(user: User | null): void {
    try {
      if (user) {
        globalThis.localStorage?.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        globalThis.localStorage?.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
}
