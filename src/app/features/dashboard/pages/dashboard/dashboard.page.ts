import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import type { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { VM_STATUS_META } from '../../../../core/constants/vm-status';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { VmCardComponent } from '../../../../shared/components/vm-card/vm-card.component';
import { StorageSizePipe } from '../../../../shared/pipes/storage-size.pipe';
import { AuthStore } from '../../../../store/auth.store';
import { VmStore } from '../../../../store/vm.store';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    BaseChartDirective,
    StatCardComponent,
    SkeletonComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    VmCardComponent,
    StorageSizePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  protected readonly vmStore = inject(VmStore);
  protected readonly auth = inject(AuthStore);

  protected readonly recentVms = computed(() => this.vmStore.vms().slice(0, 4));

  readonly statusChartData = computed<ChartData<'doughnut'>>(() => {
    const breakdown = this.vmStore.statusBreakdown();
    return {
      labels: ['Running', 'Stopped', 'Paused'],
      datasets: [
        {
          data: [breakdown.RUNNING, breakdown.STOPPED, breakdown.PAUSED],
          backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly statusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(148, 163, 184, 1)',
          usePointStyle: true,
          padding: 14,
          font: { size: 12 },
        },
      },
      tooltip: { padding: 10, displayColors: true },
    },
  };

  readonly osChartData = computed<ChartData<'bar'>>(() => {
    const breakdown = this.vmStore.osBreakdown().slice(0, 6);
    return {
      labels: breakdown.map((entry) => entry.os),
      datasets: [
        {
          label: 'VMs',
          data: breakdown.map((entry) => entry.count),
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 36,
        },
      ],
    };
  });

  readonly osChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { padding: 10 },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: 'rgba(148, 163, 184, 0.9)', precision: 0 },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
      y: {
        ticks: { color: 'rgba(148, 163, 184, 0.9)' },
        grid: { display: false },
      },
    },
  };

  readonly resourceChartData = computed<ChartData<'bar'>>(() => {
    const vms = this.vmStore.vms().slice(0, 6);
    return {
      labels: vms.map((vm) => vm.name),
      datasets: [
        {
          label: 'Cores',
          data: vms.map((vm) => vm.cores),
          backgroundColor: 'rgba(99, 102, 241, 0.9)',
          borderRadius: 6,
          maxBarThickness: 26,
        },
        {
          label: 'RAM (GB)',
          data: vms.map((vm) => vm.ram),
          backgroundColor: 'rgba(34, 197, 94, 0.9)',
          borderRadius: 6,
          maxBarThickness: 26,
        },
        {
          label: 'Disk (GB)',
          data: vms.map((vm) => vm.disk),
          backgroundColor: 'rgba(245, 158, 11, 0.9)',
          borderRadius: 6,
          maxBarThickness: 26,
        },
      ],
    };
  });

  readonly resourceChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(148, 163, 184, 1)',
          usePointStyle: true,
          padding: 12,
          font: { size: 12 },
        },
      },
      tooltip: { padding: 10 },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(148, 163, 184, 0.9)' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: 'rgba(148, 163, 184, 0.9)', precision: 0 },
        grid: { color: 'rgba(148, 163, 184, 0.12)' },
      },
    },
  };

  readonly statusLegend = Object.entries(VM_STATUS_META).map(([key, meta]) => ({
    key,
    ...meta,
  }));

  readonly hasData = computed(() => this.vmStore.totalCount() > 0);

  refresh(): void {
    this.vmStore.refresh();
  }
}

// Re-exported for template type checking convenience.
export type _DashboardChartConfig = ChartConfiguration;
