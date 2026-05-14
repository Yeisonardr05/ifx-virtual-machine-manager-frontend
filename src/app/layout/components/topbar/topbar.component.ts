import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WebsocketService } from '../../../core/services/websocket.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthStore } from '../../../store/auth.store';
import { VmStore } from '../../../store/vm.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <h1 class="topbar__title">{{ pageTitle() }}</h1>
        <p class="topbar__subtitle">{{ pageSubtitle() }}</p>
      </div>

      <div class="topbar__right">
        <div
          class="ws-pill"
          [attr.data-status]="wsStatus()"
          [matTooltip]="'Real-time connection: ' + wsStatus()"
        >
          <span class="ws-pill__dot"></span>
          <span class="ws-pill__label">Live</span>
        </div>

        <button
          mat-icon-button
          type="button"
          (click)="theme.toggle()"
          [matTooltip]="theme.mode() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          class="topbar__icon-btn"
        >
          <mat-icon>{{ theme.mode() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <button
          mat-button
          [matMenuTriggerFor]="userMenu"
          class="user-chip"
          aria-label="Account menu"
        >
          <span class="user-chip__avatar">{{ initials() }}</span>
          <span class="user-chip__meta">
            <span class="user-chip__name">{{ user()?.name }}</span>
            <span class="user-chip__role">{{ user()?.role }}</span>
          </span>
          <mat-icon class="user-chip__caret">expand_more</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="menu-header">
            <span class="menu-header__avatar">{{ initials() }}</span>
            <div>
              <p class="menu-header__name">{{ user()?.name }}</p>
              <p class="menu-header__email">{{ user()?.email }}</p>
            </div>
          </div>
          <button mat-menu-item (click)="signOut()">
            <mat-icon>logout</mat-icon>
            <span>Sign out</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly vmStore = inject(VmStore);
  protected readonly theme = inject(ThemeService);
  private readonly ws = inject(WebsocketService);

  readonly user = this.auth.user;
  readonly initials = this.auth.initials;
  readonly wsStatus = this.ws.status;

  readonly pageTitle = computed(() => {
    const role = this.auth.role();
    if (role === 'ADMIN') {
      return `Welcome back, ${this.firstName()}`;
    }
    return `Hi ${this.firstName()}`;
  });

  readonly pageSubtitle = computed(() => {
    const total = this.vmStore.totalCount();
    const running = this.vmStore.runningCount();
    if (!total) {
      return 'Provision your first virtual machine to get started.';
    }
    return `${total} virtual machines · ${running} running right now`;
  });

  signOut(): void {
    this.auth.logout();
  }

  private firstName(): string {
    const name = this.auth.user()?.name ?? '';
    return name.split(' ')[0] ?? '';
  }
}
