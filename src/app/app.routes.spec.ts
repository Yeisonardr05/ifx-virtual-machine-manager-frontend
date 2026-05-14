import type { Routes } from '@angular/router';

import { routes } from './app.routes';

describe('app.routes', () => {
  it('defines login, shell children, and wildcard fallback', () => {
    const paths = routes.map((r) => r.path);
    expect(paths).toContain('login');
    expect(paths).toContain('**');
    const shell = routes.find((r) => r.path === '' && r.children?.length);
    expect(shell?.canActivate?.length).toBeGreaterThan(0);
    expect(shell?.children?.some((c) => c.path === 'dashboard')).toBe(true);
    expect(shell?.children?.some((c) => c.path === 'vms')).toBe(true);
  });

  it('lazy-loads login page component', async () => {
    const route = routes.find((r) => r.path === 'login');
    const mod = await route!.loadComponent!();
    expect(mod).toBeTruthy();
  });

  it('lazy-loads shell layout component', async () => {
    const route = routes.find((r) => r.path === '' && r.loadComponent);
    const mod = await route!.loadComponent!();
    expect(mod).toBeTruthy();
  });

  it('lazy-loads dashboard child routes', async () => {
    const shell = routes.find((r) => r.path === '' && r.children?.length);
    const dash = shell!.children!.find((c) => c.path === 'dashboard');
    const childRoutes = (await dash!.loadChildren!()) as Routes;
    expect(Array.isArray(childRoutes)).toBe(true);
    expect(childRoutes!.length).toBeGreaterThan(0);
    if (childRoutes![0].loadComponent) {
      const page = await childRoutes![0].loadComponent!();
      expect(page).toBeTruthy();
    }
  });

  it('lazy-loads vms child routes', async () => {
    const shell = routes.find((r) => r.path === '' && r.children?.length);
    const vms = shell!.children!.find((c) => c.path === 'vms');
    const childRoutes = (await vms!.loadChildren!()) as Routes;
    expect(Array.isArray(childRoutes)).toBe(true);
    for (const r of childRoutes!) {
      if (r.loadComponent) {
        const comp = await r.loadComponent();
        expect(comp).toBeTruthy();
      }
    }
  });
});
