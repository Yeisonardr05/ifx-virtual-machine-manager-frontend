import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { APP_CONFIG } from '../config/app.config';
import { SESSION_HYDRATE_PROBE } from '../http-context';
import { LoginRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = APP_CONFIG.apiBaseUrl;

  login(payload: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, payload);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  /**
   * Confirms the HttpOnly session using an endpoint the backend already exposes.
   * Both ADMIN and CLIENT may GET /vms (per API contract).
   */
  validateSession(): Observable<void> {
    const context = new HttpContext().set(SESSION_HYDRATE_PROBE, true);
    return this.http.get<unknown>(`${this.baseUrl}/vms`, { context }).pipe(
      take(1),
      map(() => void 0),
    );
  }
}
