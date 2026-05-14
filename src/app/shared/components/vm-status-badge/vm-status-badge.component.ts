import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { VM_STATUS_META } from '../../../core/constants/vm-status';
import { VmStatus } from '../../../core/models/vm.model';

@Component({
  selector: 'app-vm-status-badge',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [attr.data-color]="meta().color">
      <span class="badge__dot"></span>
      <mat-icon class="badge__icon">{{ meta().icon }}</mat-icon>
      {{ meta().label }}
    </span>
  `,
  styleUrl: './vm-status-badge.component.scss',
})
export class VmStatusBadgeComponent {
  readonly status = input.required<VmStatus>();

  readonly meta = computed(() => VM_STATUS_META[this.status()]);
}
