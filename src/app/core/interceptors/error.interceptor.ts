import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { SESSION_HYDRATE_PROBE } from '../http-context';
import { NotificationService } from '../services/notification.service';
import { AuthStore } from '../../store/auth.store';

const FRIENDLY_MESSAGES: Record<number, string> = {
  0: 'Network error. Unable to reach the server.',
  400: 'The request could not be processed.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'Conflict: the resource is already in a different state.',
  422: 'The submitted data is invalid.',
  500: 'Internal server error. Please try again later.',
  502: 'Bad gateway. The server is unreachable.',
  503: 'Service unavailable. Please try again later.',
};

function isBackendRequest(url: string): boolean {
  return url.startsWith(APP_CONFIG.apiBaseUrl);
}

function scheduleLoginRedirect(router: Router): void {
  // Avoid calling Router.navigate synchronously from the HTTP pipeline (e.g. during APP_INITIALIZER
  // session hydrate) before the root navigation has settled — that can strand the app on an empty outlet.
  setTimeout(() => {
    void router.navigate(['/login']);
  }, 0);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const router = inject(Router);
  const auth = inject(AuthStore);
  const isSessionProbe = req.context.get(SESSION_HYDRATE_PROBE);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRoute = req.url.endsWith('/login');
      const isApi = isBackendRequest(req.url);

      const backendMessage =
        typeof error.error === 'object' && error.error
          ? ((error.error as { message?: string }).message ??
              (error.error as { error?: string }).error)
          : undefined;

      const message =
        backendMessage ?? FRIENDLY_MESSAGES[error.status] ?? 'Unexpected error.';

      if (error.status === 0 && isApi && !isLoginRoute) {
        auth.clearUser();
        notifications.error(message);
        scheduleLoginRedirect(router);
        return throwError(() => error);
      }

      if (error.status === 401) {
        auth.clearUser();
        if (!isLoginRoute) {
          if (!isSessionProbe) {
            notifications.warn(message);
          }
          scheduleLoginRedirect(router);
        }
      } else if (error.status === 403 && !isSessionProbe) {
        notifications.error(message);
      } else if (!isSessionProbe && !isLoginRoute) {
        notifications.error(message);
      }

      return throwError(() => error);
    }),
  );
};
