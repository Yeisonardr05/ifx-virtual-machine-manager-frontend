import { Routes } from '@angular/router';

import { roleGuard } from '../../core/guards/role.guard';

export const VMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/vm-list/vm-list.page').then((m) => m.VmListPage),
    title: 'Virtual machines · VM Console',
  },
  {
    path: 'create',
    canActivate: [roleGuard(['ADMIN'])],
    loadComponent: () => import('./pages/vm-form/vm-form.page').then((m) => m.VmFormPage),
    title: 'New VM · VM Console',
  },
  {
    path: 'edit/:id',
    canActivate: [roleGuard(['ADMIN'])],
    loadComponent: () => import('./pages/vm-form/vm-form.page').then((m) => m.VmFormPage),
    title: 'Edit VM · VM Console',
  },
];
