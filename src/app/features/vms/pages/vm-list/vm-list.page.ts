import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

import { VirtualMachine, VmStatus } from '../../../../core/models/vm.model';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { VmCardComponent } from '../../../../shared/components/vm-card/vm-card.component';
import { AuthStore } from '../../../../store/auth.store';
import { VmStore } from '../../../../store/vm.store';
import { VmFiltersComponent } from '../../components/vm-filters/vm-filters.component';

@Component({
  selector: 'app-vm-list-page',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    VmCardComponent,
    VmFiltersComponent,
    EmptyStateComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vm-list.page.html',
  styleUrl: './vm-list.page.scss',
})
export class VmListPage {
  protected readonly vmStore = inject(VmStore);
  protected readonly auth = inject(AuthStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly placeholders = Array.from({ length: 6 });

  onEdit(vm: VirtualMachine): void {
    this.router.navigate(['/vms/edit', vm.id]);
  }

  onStatusChange(event: { vm: VirtualMachine; status: VmStatus }): void {
    this.vmStore.updateVm(event.vm.id, { status: event.status }).subscribe({ error: () => undefined });
  }

  onRemove(vm: VirtualMachine): void {
    const data: ConfirmDialogData = {
      title: `Delete "${vm.name}"?`,
      message:
        'This will permanently remove the virtual machine. The change will be reflected immediately and rolled back if the server rejects it.',
      confirmLabel: 'Delete VM',
      cancelLabel: 'Cancel',
      tone: 'danger',
      icon: 'delete_forever',
    };

    this.dialog
      .open(ConfirmDialogComponent, { data, panelClass: 'app-dialog-panel' })
      .afterClosed()
      .pipe(filter((result) => result === true))
      .subscribe(() => {
        this.vmStore.deleteVm(vm.id).subscribe({ error: () => undefined });
      });
  }

  refresh(): void {
    this.vmStore.refresh();
  }

  clearFilters(): void {
    this.vmStore.clearFilters();
  }
}
