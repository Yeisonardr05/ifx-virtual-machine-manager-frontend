import { TestBed } from '@angular/core/testing';

import { WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('connect reaches connected and forwards JSON vm events', async () => {
    let capturedUrl = '';
    class MockWs {
      static OPEN = 1;
      static CONNECTING = 0;
      readyState = MockWs.CONNECTING;
      onopen: (() => void) | null = null;
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      onclose: (() => void) | null = null;
      constructor(public url: string) {
        capturedUrl = url;
        queueMicrotask(() => {
          this.readyState = MockWs.OPEN;
          this.onopen?.();
        });
      }
      close() {
        this.readyState = 3;
        this.onclose?.();
      }
    }
    vi.stubGlobal('WebSocket', MockWs as unknown as typeof WebSocket);

    TestBed.configureTestingModule({ providers: [WebsocketService] });
    const svc = TestBed.inject(WebsocketService);
    const events: unknown[] = [];
    svc.onVmEvents().subscribe((e) => events.push(e));

    svc.connect();
    await Promise.resolve();
    expect(svc.status()).toBe('connected');
    expect(capturedUrl).toContain('ws://');

    const active = (svc as unknown as { socket: MockWs | null }).socket;
    active?.onmessage?.({ data: JSON.stringify({ event: 'VM_CREATED', data: { id: 1 } }) } as MessageEvent);
    expect(events).toHaveLength(1);
  });

  it('disconnect stops reconnect loop', async () => {
    class MockWs {
      static OPEN = 1;
      static CONNECTING = 0;
      readyState = MockWs.CONNECTING;
      onopen: (() => void) | null = null;
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      onclose: (() => void) | null = null;
      constructor() {
        queueMicrotask(() => {
          this.readyState = MockWs.OPEN;
          this.onopen?.();
        });
      }
      close() {
        this.readyState = 3;
        this.onclose?.();
      }
    }
    vi.stubGlobal('WebSocket', MockWs as unknown as typeof WebSocket);

    TestBed.configureTestingModule({ providers: [WebsocketService] });
    const svc = TestBed.inject(WebsocketService);
    svc.connect();
    await Promise.resolve();
    svc.disconnect();
    expect(svc.status()).toBe('idle');
  });

  it('sets error status when socket reports error', async () => {
    class MockWs {
      static OPEN = 1;
      static CONNECTING = 0;
      readyState = MockWs.CONNECTING;
      onopen: (() => void) | null = null;
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: (() => void) | null = null;
      onclose: (() => void) | null = null;
      constructor() {
        queueMicrotask(() => {
          this.readyState = MockWs.OPEN;
          this.onopen?.();
        });
      }
      close() {
        this.readyState = 3;
        this.onclose?.();
      }
    }
    vi.stubGlobal('WebSocket', MockWs as unknown as typeof WebSocket);

    TestBed.configureTestingModule({ providers: [WebsocketService] });
    const svc = TestBed.inject(WebsocketService);
    svc.connect();
    await Promise.resolve();
    const active = (svc as unknown as { socket: MockWs | null }).socket;
    active?.onerror?.();
    expect(svc.status()).toBe('error');
    svc.disconnect();
  });
});
