import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'info' | 'warn';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, duration = 3500): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3500): void {
    this.show(message, 'info', duration);
  }

  warn(message: string, duration = 4000): void {
    this.show(message, 'warn', duration);
  }

  private show(message: string, type: NotificationType, duration: number): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['app-toast', `app-toast--${type}`],
    };
    this.snackBar.open(message, 'Close', config);
  }
}
