import { DASHBOARD_ROUTES } from './dashboard.routes';

describe('DASHBOARD_ROUTES', () => {
  it('loads dashboard page lazily', () => {
    expect(DASHBOARD_ROUTES[0].path).toBe('');
    expect(typeof DASHBOARD_ROUTES[0].loadComponent).toBe('function');
  });

  it('loadComponent resolves DashboardPage', async () => {
    const mod = await DASHBOARD_ROUTES[0].loadComponent!();
    expect(mod).toBeTruthy();
  });
});
