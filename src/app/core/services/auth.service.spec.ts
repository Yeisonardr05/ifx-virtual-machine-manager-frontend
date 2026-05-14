import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../config/app.config';
import { SESSION_HYDRATE_PROBE } from '../http-context';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let httpMock: HttpTestingController;
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login posts credentials', () => {
    const user = { id: 1, name: 'A', email: 'a@b.com', role: 'ADMIN' as const };
    service.login({ email: 'a@b.com', password: 'x' }).subscribe((u) => expect(u).toEqual(user));
    const req = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(user);
  });

  it('validateSession sets probe context', () => {
    service.validateSession().subscribe();
    const req = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms`);
    expect(req.request.context.get(SESSION_HYDRATE_PROBE)).toBe(true);
    req.flush([]);
  });

  it('logout posts to logout endpoint', () => {
    service.logout().subscribe();
    const req = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/logout`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
});
