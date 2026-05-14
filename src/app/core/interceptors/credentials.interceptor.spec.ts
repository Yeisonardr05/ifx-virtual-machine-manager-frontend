import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../config/app.config';
import { credentialsInterceptor } from './credentials.interceptor';

describe('credentialsInterceptor', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adds withCredentials and JSON header for API URLs', () => {
    const http = TestBed.inject(HttpClient);
    http.get(`${APP_CONFIG.apiBaseUrl}/vms`).subscribe();
    const req = httpMock.expectOne(`${APP_CONFIG.apiBaseUrl}/vms`);
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush([]);
  });

  it('does not mutate external URLs', () => {
    const http = TestBed.inject(HttpClient);
    http.get('https://cdn.example.com/x').subscribe();
    const req = httpMock.expectOne('https://cdn.example.com/x');
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });
});
