import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { sampleVm } from '../../../../testing/fixtures';
import { VmCardComponent } from './vm-card.component';

describe('VmCardComponent', () => {
  let fixture: ComponentFixture<VmCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VmCardComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(VmCardComponent);
    fixture.componentRef.setInput('vm', sampleVm());
    fixture.componentRef.setInput('canManage', true);
    fixture.detectChanges();
  });

  it('emits statusChange when picking a new status', () => {
    const spy = vi.fn();
    fixture.componentInstance.statusChange.subscribe(spy);
    fixture.componentInstance.pickStatus('STOPPED');
    expect(spy).toHaveBeenCalled();
  });

  it('ignores pickStatus when unchanged', () => {
    const spy = vi.fn();
    fixture.componentInstance.statusChange.subscribe(spy);
    fixture.componentInstance.pickStatus('RUNNING');
    expect(spy).not.toHaveBeenCalled();
  });

  it('displayId maps negative ids to NEW', () => {
    fixture.componentRef.setInput('vm', sampleVm({ id: -1 }));
    expect(fixture.componentInstance.displayId()).toBe('NEW');
  });

  it('statusIcon delegates to meta', () => {
    expect(fixture.componentInstance.statusIcon('PAUSED')).toBeTruthy();
  });

  it('emits edit and remove', () => {
    const vm = sampleVm();
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    fixture.componentInstance.edit.subscribe(onEdit);
    fixture.componentInstance.remove.subscribe(onRemove);
    fixture.componentInstance.edit.emit(vm);
    fixture.componentInstance.remove.emit(vm);
    expect(onEdit).toHaveBeenCalledWith(vm);
    expect(onRemove).toHaveBeenCalledWith(vm);
  });
});
