import { HttpContext } from '@angular/common/http';

import { SESSION_HYDRATE_PROBE } from './http-context';

describe('SESSION_HYDRATE_PROBE', () => {
  it('defaults to false in a fresh context', () => {
    const ctx = new HttpContext();
    expect(ctx.get(SESSION_HYDRATE_PROBE)).toBe(false);
  });

  it('can be set to true', () => {
    const ctx = new HttpContext().set(SESSION_HYDRATE_PROBE, true);
    expect(ctx.get(SESSION_HYDRATE_PROBE)).toBe(true);
  });
});
