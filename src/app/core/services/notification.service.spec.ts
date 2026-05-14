import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let snackBar: { open: ReturnType<typeof vi.fn> };
  let service: NotificationService;

  beforeEach(() => {
    snackBar = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [NotificationService, { provide: MatSnackBar, useValue: snackBar }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('opens snack bar for each variant', () => {
    service.success('ok');
    service.error('bad');
    service.info('fyi');
    service.warn('care');
    expect(snackBar.open).toHaveBeenCalledTimes(4);
    expect(snackBar.open.mock.calls[0][2]?.panelClass).toContain('app-toast--success');
    expect(snackBar.open.mock.calls[1][2]?.panelClass).toContain('app-toast--error');
  });
});
