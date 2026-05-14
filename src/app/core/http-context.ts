import { HttpContextToken } from '@angular/common/http';

/** Marks GET /vms used only to verify the cookie at bootstrap (quieter error handling). */
export const SESSION_HYDRATE_PROBE = new HttpContextToken<boolean>(() => false);
