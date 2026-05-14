import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { sampleUser, sampleVm } from '../../../testing/fixtures';
import type { VmEvent } from '../../core/models/websocket-event.model';
import { ThemeService } from '../../core/services/theme.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { AuthStore } from '../../store/auth.store';
import { VmStore } from '../../store/vm.store';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  let vmEvents: Subject<VmEvent>;
  let ws: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    onVmEvents: () => Observable<VmEvent>;
    status: ReturnType<typeof signal<'idle' | 'connected'>>;
  };

  const vmStore = {
    loadVms: vi.fn(),
    reset: vi.fn(),
    applyServerEvent: vi.fn(),
    totalCount: signal(0),
    runningCount: signal(0),
  };
  const authMock = {
    user: signal(sampleUser()),
    initials: computed(() => 'AL'),
    role: signal<'ADMIN' | 'CLIENT'>('ADMIN'),
    logout: vi.fn(),
  };
  const themeMock = {
    mode: signal<'light' | 'dark'>('dark'),
    toggle: vi.fn(),
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    vmStore.loadVms.mockClear();
    vmStore.reset.mockClear();
    vmStore.applyServerEvent.mockClear();
    vmEvents = new Subject();
    ws = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      onVmEvents: () => vmEvents.asObservable(),
      status: signal<'idle' | 'connected'>('idle'),
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vmEvents.complete();
    vi.useRealTimers();
  });

  async function configureShell(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: WebsocketService, useValue: ws },
        { provide: VmStore, useValue: vmStore },
        { provide: AuthStore, useValue: authMock },
        { provide: ThemeService, useValue: themeMock },
      ],
    }).compileComponents();
  }

  it('loads VMs and connects websocket after render delay', async () => {
    await configureShell();
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    vi.advanceTimersByTime(200);
    expect(vmStore.loadVms).toHaveBeenCalled();
    expect(ws.connect).toHaveBeenCalled();
  });

  it('forwards websocket vm events to the store', async () => {
    await configureShell();
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const ev: VmEvent = { event: 'VM_CREATED', data: sampleVm({ id: 501 }) };
    vmEvents.next(ev);
    expect(vmStore.applyServerEvent).toHaveBeenCalledWith(ev);
  });

  it('ngOnDestroy cleans up', async () => {
    await configureShell();
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.destroy();
    expect(ws.disconnect).toHaveBeenCalled();
    expect(vmStore.reset).toHaveBeenCalled();
  });

  it('toggleSidebar flips collapsed', async () => {
    await configureShell();
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance.collapsed()).toBe(false);
    fixture.componentInstance.toggleSidebar();
    expect(fixture.componentInstance.collapsed()).toBe(true);
  });
});
