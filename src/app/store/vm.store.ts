import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, take, tap, throwError } from 'rxjs';

import { CreateVmPayload, UpdateVmPayload, VirtualMachine } from '../core/models/vm.model';
import { VmEvent } from '../core/models/websocket-event.model';
import { NotificationService } from '../core/services/notification.service';
import { VmService } from '../core/services/vm.service';

interface FilterState {
  search: string;
  status: 'ALL' | VirtualMachine['status'];
  os: 'ALL' | string;
}

@Injectable({ providedIn: 'root' })
export class VmStore {
  private readonly vmService = inject(VmService);
  private readonly notifications = inject(NotificationService);

  private readonly _vms = signal<VirtualMachine[]>([]);
  private readonly _loading = signal(false);
  private readonly _initialLoaded = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _highlightedId = signal<number | null>(null);
  /** Avoid duplicate GET /vms/:id while a sparse-VM hydration is in flight. */
  private readonly pendingVmHydrations = new Set<number>();
  private readonly _filters = signal<FilterState>({
    search: '',
    status: 'ALL',
    os: 'ALL',
  });

  readonly vms = this._vms.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly initialLoaded = this._initialLoaded.asReadonly();
  readonly error = this._error.asReadonly();
  readonly highlightedId = this._highlightedId.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly totalCount = computed(() => this._vms().length);
  readonly runningCount = computed(
    () => this._vms().filter((vm) => vm.status === 'RUNNING').length,
  );
  readonly stoppedCount = computed(
    () => this._vms().filter((vm) => vm.status === 'STOPPED').length,
  );
  readonly pausedCount = computed(
    () => this._vms().filter((vm) => vm.status === 'PAUSED').length,
  );
  readonly totalCores = computed(() =>
    this._vms().reduce((acc, vm) => acc + vm.cores, 0),
  );
  readonly totalRam = computed(() => this._vms().reduce((acc, vm) => acc + vm.ram, 0));
  readonly totalDisk = computed(() => this._vms().reduce((acc, vm) => acc + vm.disk, 0));

  readonly statusBreakdown = computed(() => ({
    RUNNING: this.runningCount(),
    STOPPED: this.stoppedCount(),
    PAUSED: this.pausedCount(),
  }));

  readonly osBreakdown = computed(() => {
    const map = new Map<string, number>();
    for (const vm of this._vms()) {
      map.set(vm.os, (map.get(vm.os) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count);
  });

  readonly availableOs = computed(() => {
    const set = new Set<string>();
    for (const vm of this._vms()) {
      set.add(vm.os);
    }
    return Array.from(set).sort();
  });

  readonly filteredVms = computed(() => {
    const { search, status, os } = this._filters();
    const normalized = search.trim().toLowerCase();
    return this._vms().filter((vm) => {
      const matchesSearch =
        !normalized ||
        vm.name.toLowerCase().includes(normalized) ||
        vm.os.toLowerCase().includes(normalized);
      const matchesStatus = status === 'ALL' || vm.status === status;
      const matchesOs = os === 'ALL' || vm.os === os;
      return matchesSearch && matchesStatus && matchesOs;
    });
  });

  loadVms(force = false): void {
    if (this._loading()) {
      return;
    }
    if (this._initialLoaded() && !force) {
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.vmService
      .list()
      .pipe(
        tap((vms) => {
          this._vms.set(this.sortByCreatedDesc(vms));
          this._initialLoaded.set(true);
        }),
        catchError((err) => {
          this._error.set('Unable to load virtual machines.');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({ error: () => undefined });
  }

  refresh(): void {
    this.loadVms(true);
  }

  setSearch(search: string): void {
    this._filters.update((state) => ({ ...state, search }));
  }

  setStatusFilter(status: FilterState['status']): void {
    this._filters.update((state) => ({ ...state, status }));
  }

  setOsFilter(os: FilterState['os']): void {
    this._filters.update((state) => ({ ...state, os }));
  }

  clearFilters(): void {
    this._filters.set({ search: '', status: 'ALL', os: 'ALL' });
  }

  reset(): void {
    this._vms.set([]);
    this._initialLoaded.set(false);
    this._error.set(null);
    this._highlightedId.set(null);
    this.clearFilters();
  }

  createVm(payload: CreateVmPayload): Observable<VirtualMachine> {
    const tempId = this.generateTempId();
    const now = new Date().toISOString();
    const optimistic: VirtualMachine = {
      id: tempId,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    this._vms.update((list) => [optimistic, ...list]);
    this.flashHighlight(tempId);

    return this.vmService.create(payload).pipe(
      tap((created) => {
        this._vms.update((list) => {
          const mapped = list.map((vm) => (vm.id === tempId ? created : vm));
          return this.sortByCreatedDesc(this.dedupeVmsById(mapped));
        });
        this.flashHighlight(created.id);
        this.notifications.success(`VM "${created.name}" created.`);
      }),
      catchError((err) => {
        this._vms.update((list) => list.filter((vm) => vm.id !== tempId));
        this.notifications.error('Failed to create VM. Changes were rolled back.');
        return throwError(() => err);
      }),
    );
  }

  updateVm(id: number, payload: UpdateVmPayload): Observable<VirtualMachine> {
    const previous = this._vms().find((vm) => vm.id === id);
    if (!previous) {
      return throwError(() => new Error('VM not found'));
    }

    const optimistic: VirtualMachine = {
      ...previous,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    this._vms.update((list) => list.map((vm) => (vm.id === id ? optimistic : vm)));
    this.flashHighlight(id);

    return this.vmService.update(id, payload).pipe(
      tap((updated) => {
        this._vms.update((list) =>
          list.map((vm) => (vm.id === id ? updated : vm)),
        );
        this.notifications.success(`VM "${updated.name}" updated.`);
      }),
      catchError((err) => {
        this._vms.update((list) => list.map((vm) => (vm.id === id ? previous : vm)));
        this.notifications.error('Failed to update VM. Changes were rolled back.');
        return throwError(() => err);
      }),
    );
  }

  deleteVm(id: number): Observable<void> {
    const previous = this._vms();
    const target = previous.find((vm) => vm.id === id);

    if (!target) {
      return throwError(() => new Error('VM not found'));
    }

    this._vms.update((list) => list.filter((vm) => vm.id !== id));

    return this.vmService.remove(id).pipe(
      tap(() => this.notifications.success(`VM "${target.name}" deleted.`)),
      catchError((err) => {
        this._vms.set(previous);
        this.notifications.error('Failed to delete VM. Changes were rolled back.');
        return throwError(() => err);
      }),
    );
  }

  applyServerEvent(event: VmEvent): void {
    if (event.event === 'VM_DELETED') {
      const id = event.data.id;
      this._vms.update((list) => list.filter((vm) => vm.id !== id));
      return;
    }

    const vm = event.data as VirtualMachine;
    if (event.event === 'VM_CREATED') {
      this._vms.update((list) => {
        if (list.some((existing) => existing.id === vm.id)) {
          return list.map((existing) =>
            existing.id === vm.id ? this.mergeVmRecords(existing, vm) : existing,
          );
        }
        return this.sortByCreatedDesc(this.dedupeVmsById([vm, ...list]));
      });
      this.flashHighlight(vm.id);
      this.hydrateVmIfIncomplete(vm.id);
    } else if (event.event === 'VM_UPDATED' || event.event === 'VM_STATUS_CHANGED') {
      this._vms.update((list) => {
        const exists = list.some((existing) => existing.id === vm.id);
        if (!exists) {
          return this.sortByCreatedDesc([vm, ...list]);
        }
        return list.map((existing) =>
          existing.id === vm.id ? { ...existing, ...vm } : existing,
        );
      });
      this.flashHighlight(vm.id);
      this.hydrateVmIfIncomplete(vm.id);
    }
  }

  private flashHighlight(id: number): void {
    this._highlightedId.set(id);
    setTimeout(() => {
      if (this._highlightedId() === id) {
        this._highlightedId.set(null);
      }
    }, 2000);
  }

  private sortByCreatedDesc(vms: VirtualMachine[]): VirtualMachine[] {
    return [...vms].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /** How complete the VM spec is (max 8). Used to prefer REST bodies over sparse WS payloads. */
  private vmSpecScore(v: VirtualMachine): number {
    return (
      (v.cores > 0 ? 2 : 0) +
      (v.ram > 0 ? 2 : 0) +
      (v.disk > 0 ? 2 : 0) +
      (v.os?.trim() ? 2 : 0)
    );
  }

  /** Prefer the snapshot with more filled spec fields (REST) over a sparse WS payload. */
  private mergeVmRecords(a: VirtualMachine, b: VirtualMachine): VirtualMachine {
    return this.vmSpecScore(a) <= this.vmSpecScore(b) ? { ...a, ...b } : { ...b, ...a };
  }

  /**
   * WebSocket payloads are often partial (e.g. other clients when an admin creates a VM).
   * Fetch the canonical row from the API when the in-memory snapshot is still incomplete.
   */
  private hydrateVmIfIncomplete(id: number): void {
    const row = this._vms().find((v) => v.id === id);
    if (!row || this.vmSpecScore(row) >= 8) {
      return;
    }
    if (this.pendingVmHydrations.has(id)) {
      return;
    }
    this.pendingVmHydrations.add(id);
    this.vmService
      .getById(id)
      .pipe(
        take(1),
        tap((full) => {
          this._vms.update((list) => list.map((e) => (e.id === full.id ? full : e)));
        }),
        finalize(() => this.pendingVmHydrations.delete(id)),
      )
      .subscribe({ error: () => undefined });
  }

  private dedupeVmsById(list: VirtualMachine[]): VirtualMachine[] {
    const byId = new Map<number, VirtualMachine>();
    for (const vm of list) {
      const prev = byId.get(vm.id);
      byId.set(vm.id, prev ? this.mergeVmRecords(prev, vm) : vm);
    }
    return Array.from(byId.values());
  }

  private generateTempId(): number {
    return Date.now() * -1;
  }
}
