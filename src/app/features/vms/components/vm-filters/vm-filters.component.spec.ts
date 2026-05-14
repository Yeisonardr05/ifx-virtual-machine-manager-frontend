import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { VmService } from '../../../../core/services/vm.service';
import { VmStore } from '../../../../store/vm.store';
import { VmFiltersComponent } from './vm-filters.component';

describe('VmFiltersComponent', () => {
  let fixture: ComponentFixture<VmFiltersComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [VmFiltersComponent],
      providers: [
        VmStore,
        provideNoopAnimations(),
        { provide: VmService, useValue: { list: () => of([]) } },
        {
          provide: NotificationService,
          useValue: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VmFiltersComponent);
    fixture.detectChanges();
  });

  it('delegates search to store', () => {
    const store: VmStore = TestBed.inject(VmStore);
    const spy = vi.spyOn(store, 'setSearch');
    fixture.componentInstance.onSearch('db');
    expect(spy).toHaveBeenCalledWith('db');
  });

  it('onStatus delegates to store', () => {
    const store: VmStore = TestBed.inject(VmStore);
    const spy = vi.spyOn(store, 'setStatusFilter');
    fixture.componentInstance.onStatus('RUNNING');
    expect(spy).toHaveBeenCalledWith('RUNNING');
  });

  it('onOs delegates to store', () => {
    const store: VmStore = TestBed.inject(VmStore);
    const spy = vi.spyOn(store, 'setOsFilter');
    fixture.componentInstance.onOs('Debian 12');
    expect(spy).toHaveBeenCalledWith('Debian 12');
  });

  it('reset clears filters', () => {
    const store: VmStore = TestBed.inject(VmStore);
    store.setSearch('x');
    fixture.componentInstance.reset();
    expect(store.filters().search).toBe('');
  });

  it('shows clear control when filters are active', () => {
    const store: VmStore = TestBed.inject(VmStore);
    store.setSearch('prod');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Clear');
  });
});
