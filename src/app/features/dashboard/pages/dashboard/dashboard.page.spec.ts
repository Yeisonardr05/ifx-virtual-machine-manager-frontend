import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { sampleVm } from '../../../../../testing/fixtures';
import { AuthStore } from '../../../../store/auth.store';
import { VmStore } from '../../../../store/vm.store';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  const vm = sampleVm();
  const vmStoreMock = {
    vms: signal([vm]),
    totalCount: signal(1),
    runningCount: signal(1),
    statusBreakdown: signal({ RUNNING: 1, STOPPED: 0, PAUSED: 0 }),
    osBreakdown: signal([{ os: vm.os, count: 1 }]),
    loading: signal(false),
    initialLoaded: signal(true),
    refresh: vi.fn(),
    totalCores: signal(vm.cores),
    totalRam: signal(vm.ram),
    totalDisk: signal(vm.disk),
    highlightedId: signal<number | null>(null),
  };
  const authMock = {
    isAdmin: signal(true),
    role: signal<'ADMIN' | 'CLIENT'>('ADMIN'),
  };

  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideCharts(withDefaultRegisterables()),
        { provide: VmStore, useValue: vmStoreMock },
        { provide: AuthStore, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
  });

  it('refresh calls store', () => {
    fixture.componentInstance.refresh();
    expect(vmStoreMock.refresh).toHaveBeenCalled();
  });

  it('computes chart data from store', () => {
    const data = fixture.componentInstance.statusChartData();
    expect(data.datasets?.[0]?.data).toEqual([1, 0, 0]);
  });
});
