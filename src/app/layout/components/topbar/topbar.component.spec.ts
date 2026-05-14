import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { sampleUser } from '../../../../testing/fixtures';
import { WebsocketService } from '../../../core/services/websocket.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthStore } from '../../../store/auth.store';
import { VmStore } from '../../../store/vm.store';
import { TopbarComponent } from './topbar.component';

describe('TopbarComponent', () => {
  const authMock = {
    user: signal(sampleUser()),
    initials: computed(() => 'AL'),
    role: signal<'ADMIN' | 'CLIENT'>('ADMIN'),
    logout: vi.fn(),
  };
  const vmStoreMock = {
    totalCount: signal(3),
    runningCount: signal(2),
  };
  const themeMock = {
    mode: signal<'light' | 'dark'>('dark'),
    toggle: vi.fn(),
  };
  const wsMock = {
    status: signal<'idle' | 'connected'>('connected'),
  };

  let fixture: ComponentFixture<TopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AuthStore, useValue: authMock },
        { provide: VmStore, useValue: vmStoreMock },
        { provide: ThemeService, useValue: themeMock },
        { provide: WebsocketService, useValue: wsMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();
  });

  it('pageTitle welcomes admins', () => {
    expect(fixture.componentInstance.pageTitle()).toContain('Welcome back');
  });

  it('signOut calls auth.logout', () => {
    fixture.componentInstance.signOut();
    expect(authMock.logout).toHaveBeenCalled();
  });

  it('invokes theme toggle from toolbar', () => {
    themeMock.toggle.mockClear();
    (fixture.nativeElement.querySelector('.topbar__icon-btn') as HTMLButtonElement | null)?.click();
    expect(themeMock.toggle).toHaveBeenCalled();
  });
});

describe('TopbarComponent client', () => {
  it('pageTitle greets clients', async () => {
    const authMock = {
      user: signal(sampleUser({ role: 'CLIENT' })),
      initials: computed(() => 'CL'),
      role: signal<'ADMIN' | 'CLIENT'>('CLIENT'),
      logout: vi.fn(),
    };
    const vmStoreMock = {
      totalCount: signal(0),
      runningCount: signal(0),
    };
    const themeMock = {
      mode: signal<'light' | 'dark'>('dark'),
      toggle: vi.fn(),
    };
    const wsMock = {
      status: signal<'idle' | 'connected'>('idle'),
    };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AuthStore, useValue: authMock },
        { provide: VmStore, useValue: vmStoreMock },
        { provide: ThemeService, useValue: themeMock },
        { provide: WebsocketService, useValue: wsMock },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.pageTitle()).toContain('Hi');
  });
});
