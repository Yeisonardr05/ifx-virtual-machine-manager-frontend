import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserRole } from '../models/user.model';
import { NotificationService } from '../services/notification.service';
import { AuthStore } from '../../store/auth.store';

export const roleGuard = (allowed: ReadonlyArray<UserRole>): CanActivateFn => {
  return () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    const notifications = inject(NotificationService);

    const role = auth.role();
    if (role && allowed.includes(role)) {
      return true;
    }

    notifications.error('You do not have permission to access that page.');
    return router.createUrlTree(['/dashboard']);
  };
};
