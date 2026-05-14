import { VMS_ROUTES } from './vms.routes';

describe('VMS_ROUTES', () => {
  it('defines list, create, and edit routes', () => {
    expect(VMS_ROUTES.map((r) => r.path)).toEqual(['', 'create', 'edit/:id']);
  });

  it('loadComponent resolves each lazy page', async () => {
    for (const r of VMS_ROUTES) {
      if (r.loadComponent) {
        const mod = await r.loadComponent();
        expect(mod).toBeTruthy();
      }
    }
  });
});
