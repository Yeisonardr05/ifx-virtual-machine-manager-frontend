import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { APP_CONFIG } from '../../../core/config/app.config';
import { AuthStore } from '../../../store/auth.store';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="collapsed()">
      <div class="sidebar__brand">
        <span class="brand-logo">
          <mat-icon>bolt</mat-icon>
        </span>
        @if (!collapsed()) {
          <div class="brand-text">
            <span class="brand-title">{{ appName }}</span>
            <span class="brand-subtitle">Cloud Manager</span>
          </div>
        }
      </div>

      <nav class="sidebar__nav">
        @for (item of visibleItems(); track item.route) {
          <a
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="nav-item--active"
            [matTooltip]="collapsed() ? item.label : ''"
            matTooltipPosition="right"
          >
            <mat-icon>{{ item.icon }}</mat-icon>
            @if (!collapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <button
        type="button"
        class="sidebar__collapse"
        (click)="toggle.emit()"
        [matTooltip]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
        matTooltipPosition="right"
      >
        <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
      </button>
    </aside>
  `,
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthStore);

  readonly collapsed = input<boolean>(false);
  readonly toggle = output<void>();

  readonly appName = APP_CONFIG.appName;

  private readonly items: ReadonlyArray<NavItem> = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Virtual Machines', icon: 'dns', route: '/vms' },
  ];

  readonly visibleItems = computed(() =>
    this.items.filter((item) => !item.adminOnly || this.auth.isAdmin()),
  );
}
