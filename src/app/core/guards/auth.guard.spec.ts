import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { AuthStore } from '../../store/auth.store';
import { authGuard, guestGuard } from './auth.guard';

describe('authGuard', () => {
  const authMock = { isAuthenticated: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthStore, useValue: authMock }],
    });
  });

  it('allows navigation when authenticated', () => {
    authMock.isAuthenticated.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/vms' } as never),
    );
    expect(result).toBe(true);
  });

  it('redirects to login with redirect param when anonymous', () => {
    authMock.isAuthenticated.mockReturnValue(false);
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'createUrlTree');

    TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/vms' } as never));

    expect(spy).toHaveBeenCalledWith(['/login'], { queryParams: { redirect: '/vms' } });
  });
});

describe('guestGuard', () => {
  const authMock = { isAuthenticated: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthStore, useValue: authMock }],
    });
  });

  it('redirects authenticated users to dashboard', () => {
    authMock.isAuthenticated.mockReturnValue(true);
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'parseUrl');

    TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(spy).toHaveBeenCalledWith('/dashboard');
  });

  it('allows guests', () => {
    authMock.isAuthenticated.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));
    expect(result).toBe(true);
  });
});
