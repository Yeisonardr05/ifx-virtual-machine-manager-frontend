import { HttpInterceptorFn } from '@angular/common/http';

import { APP_CONFIG } from '../config/app.config';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiCall =
    req.url.startsWith(APP_CONFIG.apiBaseUrl) || req.url.startsWith('/');

  if (!isApiCall) {
    return next(req);
  }

  return next(
    req.clone({
      withCredentials: true,
      setHeaders: req.headers.has('Content-Type')
        ? {}
        : { 'Content-Type': 'application/json' },
    }),
  );
};
