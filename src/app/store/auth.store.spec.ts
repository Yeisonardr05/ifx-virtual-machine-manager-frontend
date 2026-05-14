import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { lastValueFrom, of, throwError } from 'rxjs';

import { sampleUser } from '../../testing/fixtures';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { AuthStore } from './auth.store';

const USER_STORAGE_KEY = 'vm-manager:user';

describe('AuthStore', () => {
  const authService = {
    login: vi.fn(),
    logout: vi.fn(),
    validateSession: vi.fn(),
  };
  const notifications = {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
  const router = { navigate: vi.fn().mockResolvedValue(true) };

  function createStore(): AuthStore {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notifications },
        { provide: Router, useValue: router },
      ],
    });
    return TestBed.inject(AuthStore);
  }

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('login stores user and notifies', () => {
    const user = sampleUser();
    authService.login.mockReturnValue(of(user));
    const store = createStore();

    store.login({ email: 'a', password: 'b' }).subscribe((u) => expect(u).toEqual(user));

    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isAdmin()).toBe(true);
    expect(notifications.success).toHaveBeenCalled();
    expect(store.loading()).toBe(false);
  });

  it('logout clears session on success and error', () => {
    const store = createStore();
    authService.login.mockReturnValue(of(sampleUser()));
    store.login({ email: 'a', password: 'b' }).subscribe();

    authService.logout.mockReturnValue(of(undefined));
    store.logout();
    expect(store.user()).toBeNull();

    authService.login.mockReturnValue(of(sampleUser({ role: 'CLIENT' })));
    store.login({ email: 'a', password: 'b' }).subscribe();
    authService.logout.mockReturnValue(throwError(() => new Error('net')));
    store.logout();
    expect(store.user()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('hydrateSession skips when anonymous', async () => {
    const store = createStore();
    await lastValueFrom(store.hydrateSession());
    expect(authService.validateSession).not.toHaveBeenCalled();
  });

  it('hydrateSession probes server when user restored from storage', () => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sampleUser()));
    authService.validateSession.mockReturnValue(of(undefined));
    const store = createStore();
    store.hydrateSession().subscribe();
    expect(authService.validateSession).toHaveBeenCalled();
  });

  it('hydrateSession clears user on 401', () => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sampleUser()));
    authService.validateSession.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 })),
    );
    const store = createStore();
    store.hydrateSession().subscribe();
    expect(store.user()).toBeNull();
  });

  it('hydrateFromServer delegates to hydrateSession', () => {
    const store = createStore();
    const spy = vi.spyOn(store, 'hydrateSession').mockReturnValue(of(undefined));
    store.hydrateFromServer();
    expect(spy).toHaveBeenCalled();
  });

  it('initials derives from name', () => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sampleUser({ name: 'Ada Lovelace' })));
    const store = createStore();
    expect(store.initials()).toBe('AL');
  });
});
