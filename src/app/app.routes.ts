import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';

/**
 * Order matters: the `path: ''` + `pathMatch: 'full'` redirect must run before the lazy shell
 * route (also `path: ''`), otherwise `/` can activate the shell and fight the auth guard.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
    title: 'Sign in · VM Console',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'vms',
        loadChildren: () => import('./features/vms/vms.routes').then((m) => m.VMS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
