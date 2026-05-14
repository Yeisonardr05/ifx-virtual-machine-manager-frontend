import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  function setup(localStorageData: Record<string, string> = {}) {
    const html = document.createElement('html');
    const doc = {
      documentElement: html,
      defaultView: {
        localStorage: {
          getItem: (k: string) => localStorageData[k] ?? null,
          setItem: vi.fn(),
        },
        matchMedia: vi.fn().mockReturnValue({ matches: false }),
      },
    } as unknown as Document;

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: DOCUMENT, useValue: doc }],
    });
    return { service: TestBed.inject(ThemeService), html, doc };
  }

  it('toggle flips mode', () => {
    const { service } = setup({ 'vm-manager:theme': 'dark' });
    service.toggle();
    expect(service.mode()).toBe('light');
  });

  it('set assigns mode', () => {
    const { service } = setup();
    service.set('dark');
    expect(service.mode()).toBe('dark');
  });
});
