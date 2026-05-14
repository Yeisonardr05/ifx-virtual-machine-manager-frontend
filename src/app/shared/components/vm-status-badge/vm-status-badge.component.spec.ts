import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { VmStatusBadgeComponent } from './vm-status-badge.component';

describe('VmStatusBadgeComponent', () => {
  let fixture: ComponentFixture<VmStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VmStatusBadgeComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(VmStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'RUNNING');
    fixture.detectChanges();
  });

  it('renders meta label', () => {
    expect(fixture.nativeElement.textContent).toContain('Running');
  });
});
