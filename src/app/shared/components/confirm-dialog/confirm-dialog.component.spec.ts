import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  const close = vi.fn();

  beforeEach(async () => {
    close.mockReset();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'T', message: 'M', tone: 'danger' as const },
        },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
  });

  it('confirm closes true', () => {
    fixture.componentInstance.confirm();
    expect(close).toHaveBeenCalledWith(true);
  });

  it('cancel closes false', () => {
    fixture.componentInstance.cancel();
    expect(close).toHaveBeenCalledWith(false);
  });

  it('defaultIcon reflects danger tone', () => {
    expect(fixture.componentInstance.defaultIcon).toBe('warning');
  });
});

describe('ConfirmDialogComponent primary tone', () => {
  it('defaultIcon uses help when not danger', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Q', message: 'Continue?', tone: 'primary' as const },
        },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.defaultIcon).toBe('help');
  });
});
