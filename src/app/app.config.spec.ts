import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { appConfig, sessionHydrateInitializer } from './app.config';
import { AuthStore } from './store/auth.store';

describe('appConfig', () => {
  it('registers core runtime providers', () => {
    expect(appConfig.providers?.length).toBeGreaterThan(5);
  });
});

describe('sessionHydrateInitializer', () => {
  it('starts session hydration from AuthStore', () => {
    const hydrateSession = vi.fn().mockReturnValue(of(undefined));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthStore, useValue: { hydrateSession } }],
    });
    TestBed.runInInjectionContext(() => sessionHydrateInitializer());
    expect(hydrateSession).toHaveBeenCalled();
  });
});
