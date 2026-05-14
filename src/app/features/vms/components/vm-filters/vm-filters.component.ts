import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { VM_STATUS_OPTIONS } from '../../../../core/constants/vm-status';
import { VmStore } from '../../../../store/vm.store';

@Component({
  selector: 'app-vm-filters',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filters">
      <mat-form-field appearance="outline" class="filters__search">
        <mat-icon matPrefix>search</mat-icon>
        <mat-label>Search VMs</mat-label>
        <input
          matInput
          [ngModel]="filters().search"
          (ngModelChange)="onSearch($event)"
          placeholder="Name or OS..."
          autocomplete="off"
        />
        @if (filters().search) {
          <button
            matSuffix
            mat-icon-button
            type="button"
            aria-label="Clear search"
            (click)="onSearch('')"
          >
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="filters__select">
        <mat-label>Status</mat-label>
        <mat-select
          [value]="filters().status"
          (valueChange)="onStatus($event)"
        >
          <mat-option value="ALL">All statuses</mat-option>
          @for (option of statusOptions; track option.value) {
            <mat-option [value]="option.value">{{ option.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filters__select">
        <mat-label>Operating system</mat-label>
        <mat-select
          [value]="filters().os"
          (valueChange)="onOs($event)"
          [disabled]="!availableOs().length"
        >
          <mat-option value="ALL">All OS</mat-option>
          @for (os of availableOs(); track os) {
            <mat-option [value]="os">{{ os }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (hasActiveFilter()) {
        <button mat-stroked-button type="button" class="filters__reset" (click)="reset()">
          <mat-icon>filter_alt_off</mat-icon>
          <span>Clear</span>
        </button>
      }
    </div>
  `,
  styleUrl: './vm-filters.component.scss',
})
export class VmFiltersComponent {
  private readonly store = inject(VmStore);

  readonly filters = this.store.filters;
  readonly availableOs = this.store.availableOs;
  readonly statusOptions = VM_STATUS_OPTIONS;

  readonly hasActiveFilter = computed(() => {
    const { search, status, os } = this.filters();
    return Boolean(search) || status !== 'ALL' || os !== 'ALL';
  });

  onSearch(value: string): void {
    this.store.setSearch(value);
  }

  onStatus(value: 'ALL' | 'RUNNING' | 'STOPPED' | 'PAUSED'): void {
    this.store.setStatusFilter(value);
  }

  onOs(value: string): void {
    this.store.setOsFilter(value);
  }

  reset(): void {
    this.store.clearFilters();
  }
}
