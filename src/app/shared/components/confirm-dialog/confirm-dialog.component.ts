import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirm">
      <div class="confirm__icon" [class.confirm__icon--danger]="data.tone === 'danger'">
        <mat-icon>{{ data.icon ?? defaultIcon }}</mat-icon>
      </div>
      <h2 class="confirm__title">{{ data.title }}</h2>
      <p class="confirm__message">{{ data.message }}</p>
      <div class="confirm__actions">
        <button mat-stroked-button type="button" (click)="cancel()">
          {{ data.cancelLabel ?? 'Cancel' }}
        </button>
        <button
          mat-flat-button
          type="button"
          [color]="data.tone === 'danger' ? 'warn' : 'primary'"
          (click)="confirm()"
        >
          {{ data.confirmLabel ?? 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);

  get defaultIcon(): string {
    return this.data.tone === 'danger' ? 'warning' : 'help';
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
