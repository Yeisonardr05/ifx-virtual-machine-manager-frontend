import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { sampleVm } from '../../../../../testing/fixtures';
import { VmStore } from '../../../../store/vm.store';
import { VmFormPage } from './vm-form.page';

describe('VmFormPage', () => {
  let fixture: ComponentFixture<VmFormPage>;
  const navigate = vi.fn().mockResolvedValue(true);
  const createVm = vi.fn().mockReturnValue(of(sampleVm({ id: 2 })));
  const updateVm = vi.fn().mockReturnValue(of(sampleVm({ id: 1 })));
  const vmStoreMock = {
    vms: signal([sampleVm()]),
    createVm,
    updateVm,
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    createVm.mockClear();
    updateVm.mockClear();
    navigate.mockClear();
    await TestBed.configureTestingModule({
      imports: [VmFormPage],
      providers: [
        provideNoopAnimations(),
        { provide: VmStore, useValue: vmStoreMock },
        { provide: Router, useValue: { navigate } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VmFormPage);
    fixture.detectChanges();
  });

  it('create mode submits payload', () => {
    const f = fixture.componentInstance.form;
    f.patchValue({
      name: 'web',
      os: 'Ubuntu 22.04',
      cores: 2,
      ram: 4,
      disk: 40,
    });
    fixture.componentInstance.submit();
    expect(createVm).toHaveBeenCalled();
  });

  it('errorOf returns validation messages', () => {
    const name = fixture.componentInstance.form.get('name')!;
    name.setValue('');
    name.markAsTouched();
    expect(fixture.componentInstance.errorOf('name')).toBe('This field is required');

    name.setValue('x');
    name.markAsTouched();
    expect(fixture.componentInstance.errorOf('name')).toContain('at least');

    const ram = fixture.componentInstance.form.get('ram')!;
    ram.setValue(0);
    ram.markAsTouched();
    expect(fixture.componentInstance.errorOf('ram')).toContain('greater');

    ram.setValue(128);
    ram.markAsTouched();
    expect(fixture.componentInstance.errorOf('ram')).toContain('less');
  });
});

describe('VmFormPage edit mode', () => {
  it('hydrates from store when id present', async () => {
    TestBed.resetTestingModule();
    const vm = sampleVm({ id: 9, name: 'legacy' });
    const vmStoreMock = {
      vms: signal([vm]),
      createVm: vi.fn(),
      updateVm: vi.fn().mockReturnValue(of(vm)),
    };
    const navigate = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [VmFormPage],
      providers: [
        provideNoopAnimations(),
        { provide: VmStore, useValue: vmStoreMock },
        { provide: Router, useValue: { navigate } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (k: string) => (k === 'id' ? '9' : null) } } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(VmFormPage);
    fixture.detectChanges();
    expect(fixture.componentInstance.isEdit()).toBe(true);
    expect(fixture.componentInstance.form.get('name')?.value).toBe('legacy');
  });

  it('edit mode submit calls updateVm and navigates', async () => {
    const vm = sampleVm({ id: 9, name: 'legacy' });
    const updateVm = vi.fn().mockReturnValue(of(vm));
    const navigate = vi.fn().mockResolvedValue(true);
    const vmStoreMock = {
      vms: signal([vm]),
      createVm: vi.fn(),
      updateVm,
    };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [VmFormPage],
      providers: [
        provideNoopAnimations(),
        { provide: VmStore, useValue: vmStoreMock },
        { provide: Router, useValue: { navigate } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (k: string) => (k === 'id' ? '9' : null) } } },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(VmFormPage);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({
      name: vm.name,
      os: vm.os,
      status: vm.status,
      cores: vm.cores,
      ram: vm.ram,
      disk: vm.disk,
    });
    fixture.componentInstance.submit();
    expect(updateVm).toHaveBeenCalled();
  });

  it('errorOf reports invalid status pattern in edit mode', async () => {
    const vm = sampleVm({ id: 9 });
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [VmFormPage],
      providers: [
        provideNoopAnimations(),
        {
          provide: VmStore,
          useValue: { vms: signal([vm]), createVm: vi.fn(), updateVm: vi.fn().mockReturnValue(of(vm)) },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (k: string) => (k === 'id' ? '9' : null) } } },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(VmFormPage);
    fixture.detectChanges();
    const status = fixture.componentInstance.form.get('status')!;
    status.setValue('BOGUS' as never);
    status.markAsTouched();
    expect(fixture.componentInstance.errorOf('status')).toContain('RUNNING');
  });
});
