import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthStore } from '../../store/auth.store';
import { NotificationService } from '../services/notification.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  const authMock = { role: vi.fn() };
  const notifications = { error: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authMock },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('allows when role is in allowed list', () => {
    authMock.role.mockReturnValue('ADMIN');
    const guard = roleGuard(['ADMIN']);
    const result = TestBed.runInInjectionContext(() => guard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('blocks unknown role with notification and redirect', () => {
    authMock.role.mockReturnValue('CLIENT');
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'createUrlTree');
    const guard = roleGuard(['ADMIN']);

    TestBed.runInInjectionContext(() => guard({} as never, {} as never));

    expect(notifications.error).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('blocks when role is null', () => {
    authMock.role.mockReturnValue(null);
    const guard = roleGuard(['ADMIN']);
    TestBed.runInInjectionContext(() => guard({} as never, {} as never));
    expect(notifications.error).toHaveBeenCalled();
  });
});
