import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'vm-manager:theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly mode = signal<ThemeMode>(this.resolveInitialMode());

  constructor() {
    effect(() => {
      const mode = this.mode();
      const root = this.document.documentElement;
      root.dataset['theme'] = mode;
      root.classList.toggle('theme-dark', mode === 'dark');
      root.classList.toggle('theme-light', mode === 'light');
      try {
        this.document.defaultView?.localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // ignore storage errors (private mode, ssr, etc.)
      }
    });
  }

  toggle(): void {
    this.mode.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private resolveInitialMode(): ThemeMode {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      const prefersDark = this.document.defaultView?.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      return prefersDark ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  }
}
