import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('label', 'Total');
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();
  });

  it('shows value when not loading', () => {
    expect(fixture.nativeElement.textContent).toContain('42');
  });

  it('shows skeleton when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.skeleton')).toBeTruthy();
  });

  it('displayValue mirrors value input', () => {
    expect(fixture.componentInstance.displayValue()).toBe(42);
  });

  it('renders optional hint and badge', () => {
    fixture.componentRef.setInput('hint', 'More info');
    fixture.componentRef.setInput('badge', 'New');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('More info');
    expect(fixture.nativeElement.textContent).toContain('New');
  });
});
