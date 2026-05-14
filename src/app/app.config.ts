import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthStore } from './store/auth.store';

/** Exported for unit tests and explicit bootstrap contract. */
export function sessionHydrateInitializer(): void {
  inject(AuthStore).hydrateSession().subscribe();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([credentialsInterceptor, errorInterceptor])),
    // After HttpClient exists: confirm HttpOnly cookie matches cached profile (fixes reload / guestGuard).
    // Do not block bootstrap on this request: if GET /vms hangs, the app never mounted and the UI stayed
    // on a blank dark shell (only index.html styles). Navigation from interceptors during a blocking
    // initializer can also leave the router in a bad state.
    provideAppInitializer(sessionHydrateInitializer),
    provideCharts(withDefaultRegisterables()),
  ],
};
