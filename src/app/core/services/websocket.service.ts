import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { resolveVmWebSocketUrl } from '../config/app.config';
import { VmEvent } from '../models/websocket-event.model';

export type WsStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manualClose = false;
  private readonly reconnectDelayMs = 4000;
  private readonly vmEvents$ = new Subject<VmEvent>();

  readonly status = signal<WsStatus>('idle');

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.manualClose = false;
    this.clearReconnectTimer();
    this.detachSocket();
    this.openSocket();
  }

  disconnect(): void {
    this.manualClose = true;
    this.clearReconnectTimer();
    this.detachSocket();
    this.status.set('idle');
  }

  onVmEvents(): Observable<VmEvent> {
    return this.vmEvents$.asObservable();
  }

  private openSocket(): void {
    this.status.set('connecting');
    const url = resolveVmWebSocketUrl();
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      this.status.set('error');
      this.scheduleReconnect();
      return;
    }

    this.socket = ws;

    ws.onopen = () => {
      this.status.set('connected');
    };

    ws.onmessage = (event: MessageEvent) => {
      const raw = typeof event.data === 'string' ? event.data : undefined;
      if (!raw) {
        return;
      }
      try {
        const payload = JSON.parse(raw) as VmEvent;
        this.vmEvents$.next(payload);
      } catch {
        // Ignore malformed payloads.
      }
    };

    ws.onerror = () => {
      this.status.set('error');
    };

    ws.onclose = () => {
      this.socket = null;
      if (this.manualClose) {
        this.status.set('idle');
        return;
      }
      this.status.set('disconnected');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.manualClose) {
      return;
    }
    this.clearReconnectTimer();
    this.reconnectTimer = globalThis.setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.manualClose && !this.socket) {
        this.openSocket();
      }
    }, this.reconnectDelayMs);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      globalThis.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private detachSocket(): void {
    const ws = this.socket;
    this.socket = null;
    if (!ws) {
      return;
    }
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }
}
