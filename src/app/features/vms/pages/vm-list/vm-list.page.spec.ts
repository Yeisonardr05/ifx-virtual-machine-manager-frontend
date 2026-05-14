import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { sampleVm } from '../../../../../testing/fixtures';
import { AuthStore } from '../../../../store/auth.store';
import { VmStore } from '../../../../store/vm.store';
import { VmListPage } from './vm-list.page';

describe('VmListPage', () => {
  let fixture: ComponentFixture<VmListPage>;
  const authMock = {
    isAdmin: signal(true),
  };
  const vmStoreMock = {
    filteredVms: signal([sampleVm()]),
    filters: signal({ search: '', status: 'ALL' as const, os: 'ALL' as const }),
    availableOs: signal<string[]>(['Ubuntu 22.04']),
    totalCount: signal(1),
    runningCount: signal(1),
    pausedCount: signal(0),
    stoppedCount: signal(0),
    loading: signal(false),
    initialLoaded: signal(true),
    highlightedId: signal<number | null>(null),
    refresh: vi.fn(),
    clearFilters: vi.fn(),
    updateVm: vi.fn().mockReturnValue(of(sampleVm())),
    deleteVm: vi.fn().mockReturnValue(of(undefined)),
  };
  const dialogMock = {
    open: vi.fn().mockReturnValue({
      afterClosed: () => of(true),
    }),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    dialogMock.open.mockClear();
    await TestBed.configureTestingModule({
      imports: [VmListPage],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: AuthStore, useValue: authMock },
        { provide: VmStore, useValue: vmStoreMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VmListPage);
    fixture.detectChanges();
  });

  it('refresh delegates to store', () => {
    fixture.componentInstance.refresh();
    expect(vmStoreMock.refresh).toHaveBeenCalled();
  });

  it('onEdit navigates', () => {
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');
    fixture.componentInstance.onEdit(sampleVm({ id: 7 }));
    expect(spy).toHaveBeenCalledWith(['/vms/edit', 7]);
  });

  it('onStatusChange calls updateVm', () => {
    const vm = sampleVm();
    fixture.componentInstance.onStatusChange({ vm, status: 'STOPPED' });
    expect(vmStoreMock.updateVm).toHaveBeenCalledWith(vm.id, { status: 'STOPPED' });
  });

  it('clearFilters calls store', () => {
    fixture.componentInstance.clearFilters();
    expect(vmStoreMock.clearFilters).toHaveBeenCalled();
  });

  it('onRemove deletes when dialog confirms', () => {
    fixture.componentInstance.onRemove(sampleVm({ id: 3, name: 'x' }));
    expect(dialogMock.open).toHaveBeenCalled();
    expect(vmStoreMock.deleteVm).toHaveBeenCalledWith(3);
  });
});
