import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { APP_CONFIG } from '../config/app.config';
import { SESSION_HYDRATE_PROBE } from '../http-context';
import { NotificationService } from '../services/notification.service';
import { AuthStore } from '../../store/auth.store';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  const notifications = { error: vi.fn(), warn: vi.fn() };
  const auth = { clearUser: vi.fn() };

  beforeEach(() => {
    notifications.error.mockClear();
    notifications.warn.mockClear();
    auth.clearUser.mockClear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notifications },
        { provide: AuthStore, useValue: auth },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('clears user and redirects on status 0 for API calls', async () => {
    const http = TestBed.inject(HttpClient);
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get(`${APP_CONFIG.apiBaseUrl}/vms`).subscribe({ error: () => undefined });
    const req = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms`);
    req.error(new ProgressEvent('offline'), { status: 0 });

    expect(auth.clearUser).toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalled();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(nav).toHaveBeenCalledWith(['/login']);
  });

  it('401 clears session and warns when not login and not probe', async () => {
    const http = TestBed.inject(HttpClient);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get(`${APP_CONFIG.apiBaseUrl}/vms`).subscribe({ error: () => undefined });
    httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.clearUser).toHaveBeenCalled();
    expect(notifications.warn).toHaveBeenCalled();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });

  it('401 on session probe does not warn', () => {
    const http = TestBed.inject(HttpClient);
    const ctx = new HttpContext().set(SESSION_HYDRATE_PROBE, true);

    http.get(`${APP_CONFIG.apiBaseUrl}/vms`, { context: ctx }).subscribe({ error: () => undefined });
    const testReq = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms`);
    expect(testReq.request.context.get(SESSION_HYDRATE_PROBE)).toBe(true);
    testReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.clearUser).toHaveBeenCalled();
    expect(notifications.warn).not.toHaveBeenCalled();
  });

  it('403 shows error when not probe', () => {
    const http = TestBed.inject(HttpClient);
    http.get(`${APP_CONFIG.apiBaseUrl}/vms`).subscribe({ error: () => undefined });
    httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms`).flush(null, { status: 403, statusText: 'Forbidden' });
    expect(notifications.error).toHaveBeenCalled();
  });

  it('uses backend message when present', () => {
    const http = TestBed.inject(HttpClient);
    http.get(`${APP_CONFIG.apiBaseUrl}/vms`).subscribe({ error: () => undefined });
    httpMock
      .expectOne(`${APP_CONFIG.apiBaseUrl}/vms`)
      .flush({ message: 'Custom' }, { status: 422, statusText: 'Error' });
    expect(notifications.error).toHaveBeenCalledWith('Custom');
  });
});
