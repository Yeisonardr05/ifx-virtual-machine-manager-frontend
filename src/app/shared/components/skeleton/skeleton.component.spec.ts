import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SkeletonComponent] }).compileComponents();
    fixture = TestBed.createComponent(SkeletonComponent);
    fixture.detectChanges();
  });

  it('applies width style input', () => {
    fixture.componentRef.setInput('width', '50%');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.skeleton') as HTMLElement;
    expect(el.style.width).toBe('50%');
  });
});
