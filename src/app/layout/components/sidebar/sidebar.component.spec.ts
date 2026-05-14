import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { AuthStore } from '../../../store/auth.store';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  const authMock = {
    isAdmin: signal(true),
  };

  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideNoopAnimations(), provideRouter([]), { provide: AuthStore, useValue: authMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.componentRef.setInput('collapsed', false);
    fixture.detectChanges();
  });

  it('emits toggle when collapse control used', () => {
    const spy = vi.fn();
    fixture.componentInstance.toggle.subscribe(spy);
    fixture.nativeElement.querySelector('.sidebar__collapse')?.dispatchEvent(new Event('click'));
    expect(spy).toHaveBeenCalled();
  });
});
