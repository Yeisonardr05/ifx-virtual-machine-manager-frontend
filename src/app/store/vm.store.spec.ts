import { TestBed } from '@angular/core/testing';
import { lastValueFrom, of, Subject, throwError } from 'rxjs';

import { sampleVm } from '../../testing/fixtures';
import type { VirtualMachine } from '../core/models/vm.model';
import { NotificationService } from '../core/services/notification.service';
import { VmService } from '../core/services/vm.service';
import { VmStore } from './vm.store';

describe('VmStore', () => {
  const vmService = {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getById: vi.fn(),
  };
  const notifications = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  };

  function createStore(): VmStore {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        VmStore,
        { provide: VmService, useValue: vmService },
        { provide: NotificationService, useValue: notifications },
      ],
    });
    return TestBed.inject(VmStore);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loadVms populates list and computed metrics', () => {
    const a = sampleVm({ id: 1, status: 'RUNNING', cores: 2, ram: 4, disk: 8 });
    const b = sampleVm({ id: 2, status: 'STOPPED', cores: 1, ram: 2, disk: 4, os: 'Debian 12' });
    vmService.list.mockReturnValue(of([a, b]));
    const store = createStore();

    store.loadVms();

    expect(store.totalCount()).toBe(2);
    expect(store.runningCount()).toBe(1);
    expect(store.stoppedCount()).toBe(1);
    expect(store.totalCores()).toBe(3);
    expect(store.totalRam()).toBe(6);
    expect(store.totalDisk()).toBe(12);
    expect(store.availableOs().length).toBe(2);
    expect(store.osBreakdown().length).toBe(2);
  });

  it('ignores concurrent loadVms while loading', () => {
    const subj = new Subject<VirtualMachine[]>();
    vmService.list.mockReturnValue(subj.asObservable());
    const store = createStore();
    store.loadVms();
    store.loadVms();
    expect(vmService.list).toHaveBeenCalledTimes(1);
    subj.next([]);
    subj.complete();
  });

  it('skips reload until refresh when already loaded', () => {
    vmService.list.mockReturnValue(of([sampleVm()]));
    const store = createStore();
    store.loadVms();
    store.loadVms();
    expect(vmService.list).toHaveBeenCalledTimes(1);
    store.refresh();
    expect(vmService.list).toHaveBeenCalledTimes(2);
  });

  it('sets error when list fails', () => {
    vmService.list.mockReturnValue(throwError(() => new Error('x')));
    const store = createStore();
    store.loadVms();
    expect(store.error()).toBe('Unable to load virtual machines.');
    expect(store.loading()).toBe(false);
  });

  it('filters by search, status, and os', () => {
    vmService.list.mockReturnValue(
      of([
        sampleVm({ id: 1, name: 'web-1', os: 'Ubuntu 22.04', status: 'RUNNING' }),
        sampleVm({ id: 2, name: 'db-1', os: 'Debian 12', status: 'STOPPED' }),
      ]),
    );
    const store = createStore();
    store.loadVms();

    store.setSearch('web');
    expect(store.filteredVms().length).toBe(1);

    store.setStatusFilter('STOPPED');
    expect(store.filteredVms().length).toBe(0);

    store.clearFilters();
    store.setOsFilter('Debian 12');
    expect(store.filteredVms().length).toBe(1);

    store.clearFilters();
    expect(store.filters().status).toBe('ALL');
  });

  it('createVm applies optimistic row then replaces with server vm', () => {
    const created = sampleVm({ id: 99, name: 'new' });
    vmService.create.mockReturnValue(of(created));
    const store = createStore();

    store
      .createVm({
        name: 'new',
        cores: 2,
        ram: 4,
        disk: 40,
        os: 'Ubuntu 22.04',
      })
      .subscribe();

    expect(store.vms().some((v) => v.name === 'new')).toBe(true);
    expect(store.vms().find((v) => v.id === 99)).toEqual(created);
    expect(notifications.success).toHaveBeenCalled();
  });

  it('createVm rolls back on failure', () => {
    vmService.create.mockReturnValue(throwError(() => new Error('fail')));
    const store = createStore();

    store
      .createVm({
        name: 'bad',
        cores: 1,
        ram: 1,
        disk: 1,
        os: 'Ubuntu 22.04',
      })
      .subscribe({ error: () => undefined });

    expect(store.vms().some((v) => v.name === 'bad')).toBe(false);
    expect(notifications.error).toHaveBeenCalled();
  });

  it('updateVm errors when vm missing', async () => {
    const store = createStore();
    await expect(lastValueFrom(store.updateVm(1, { name: 'x' }))).rejects.toThrow(/not found/);
  });

  it('updateVm merges and rolls back on error', () => {
    const vm = sampleVm({ id: 1 });
    vmService.list.mockReturnValue(of([vm]));
    const store = createStore();
    store.loadVms();
    vmService.update.mockReturnValue(throwError(() => new Error('no')));

    store
      .updateVm(1, { name: 'changed' })
      .subscribe({ error: () => undefined });

    expect(store.vms()[0].name).toBe(vm.name);
    expect(notifications.error).toHaveBeenCalled();
  });

  it('deleteVm removes and restores on error', () => {
    const vm = sampleVm({ id: 1 });
    vmService.list.mockReturnValue(of([vm]));
    vmService.remove.mockReturnValue(throwError(() => new Error('no')));
    const store = createStore();
    store.loadVms();

    store.deleteVm(1).subscribe({ error: () => undefined });

    expect(store.vms().length).toBe(1);
    expect(notifications.error).toHaveBeenCalled();
  });

  it('applyServerEvent deletes vm', () => {
    vmService.list.mockReturnValue(of([sampleVm({ id: 5 })]));
    const store = createStore();
    store.loadVms();
    store.applyServerEvent({ event: 'VM_DELETED', data: { id: 5 } });
    expect(store.vms().length).toBe(0);
  });

  it('applyServerEvent hydrates sparse created vm', () => {
    const full = sampleVm({ id: 10, cores: 2, ram: 4, disk: 40, os: 'Ubuntu 22.04' });
    vmService.getById.mockReturnValue(of(full));
    const store = createStore();
    const sparse = { ...full, cores: 0, ram: 0, disk: 0, os: ' ' };
    store.applyServerEvent({ event: 'VM_CREATED', data: sparse });
    expect(vmService.getById).toHaveBeenCalledWith(10);
    expect(store.vms().find((v) => v.id === 10)?.cores).toBe(2);
  });

  it('applyServerEvent updates existing vm', () => {
    const vm = sampleVm({ id: 3, status: 'STOPPED' });
    vmService.list.mockReturnValue(of([vm]));
    const store = createStore();
    store.loadVms();
    store.applyServerEvent({
      event: 'VM_STATUS_CHANGED',
      data: { ...vm, status: 'RUNNING' },
    });
    expect(store.vms()[0].status).toBe('RUNNING');
  });

  it('reset clears state', () => {
    vmService.list.mockReturnValue(of([sampleVm()]));
    const store = createStore();
    store.loadVms();
    store.setSearch('x');
    store.reset();
    expect(store.vms().length).toBe(0);
    expect(store.filters().search).toBe('');
  });
});
