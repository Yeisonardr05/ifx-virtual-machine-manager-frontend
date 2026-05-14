import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { VirtualMachine } from '../../../core/models/vm.model';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { StorageSizePipe } from '../../pipes/storage-size.pipe';
import { VmStatusBadgeComponent } from '../vm-status-badge/vm-status-badge.component';

@Component({
  selector: 'app-vm-card',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    VmStatusBadgeComponent,
    StorageSizePipe,
    RelativeTimePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="vm-card" [class.vm-card--highlight]="highlighted()">
      <header class="vm-card__header">
        <div class="vm-card__title-block">
          <span class="vm-card__avatar">
            <mat-icon>dns</mat-icon>
          </span>
          <div>
            <h3 class="vm-card__name">{{ vm().name }}</h3>
            <p class="vm-card__os">{{ vm().os }}</p>
          </div>
        </div>

        <div class="vm-card__actions">
          <app-vm-status-badge [status]="vm().status" />
          @if (canManage()) {
            <button
              mat-icon-button
              [matMenuTriggerFor]="menu"
              aria-label="More actions"
              class="vm-card__menu-trigger"
            >
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="edit.emit(vm())">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
              <button mat-menu-item class="danger" (click)="remove.emit(vm())">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          }
        </div>
      </header>

      <div class="vm-card__metrics">
        <div class="metric">
          <mat-icon>memory</mat-icon>
          <div>
            <span class="metric__label">CORES</span>
            <span class="metric__value">{{ vm().cores }}</span>
          </div>
        </div>
        <div class="metric">
          <mat-icon>developer_board</mat-icon>
          <div>
            <span class="metric__label">RAM</span>
            <span class="metric__value">{{ vm().ram | storageSize }}</span>
          </div>
        </div>
        <div class="metric">
          <mat-icon>storage</mat-icon>
          <div>
            <span class="metric__label">DISK</span>
            <span class="metric__value">{{ vm().disk | storageSize }}</span>
          </div>
        </div>
      </div>

      <footer class="vm-card__footer">
        <span
          class="vm-card__timestamp"
          [matTooltip]="vm().updatedAt | date: 'medium'"
        >
          <mat-icon>schedule</mat-icon>
          Updated {{ vm().updatedAt | relativeTime }}
        </span>
        <span class="vm-card__id">#{{ displayId() }}</span>
      </footer>
    </article>
  `,
  styleUrl: './vm-card.component.scss',
})
export class VmCardComponent {
  readonly vm = input.required<VirtualMachine>();
  readonly canManage = input<boolean>(false);
  readonly highlighted = input<boolean>(false);

  readonly edit = output<VirtualMachine>();
  readonly remove = output<VirtualMachine>();

  displayId(): string {
    const id = this.vm().id;
    return id < 0 ? 'NEW' : String(id);
  }
}
