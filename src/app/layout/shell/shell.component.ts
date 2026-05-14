import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { WebsocketService } from '../../core/services/websocket.service';
import { VmStore } from '../../store/vm.store';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopbarComponent } from '../components/topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <app-sidebar [collapsed]="collapsed()" (toggle)="toggleSidebar()" />
      <div class="shell__main">
        <app-topbar />
        <main class="shell__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnDestroy {
  private readonly ws = inject(WebsocketService);
  private readonly vmStore = inject(VmStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly collapsed = signal(false);

  constructor() {
    afterNextRender(() => {
      // Give the browser time to attach the HttpOnly cookie after login before GET /vms.
      globalThis.setTimeout(() => {
        this.vmStore.loadVms();
        this.ws.connect();
      }, 150);
    });

    this.ws
      .onVmEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.vmStore.applyServerEvent(event));
  }

  ngOnDestroy(): void {
    this.ws.disconnect();
    this.vmStore.reset();
  }

  toggleSidebar(): void {
    this.collapsed.update((value) => !value);
  }
}
