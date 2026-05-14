import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { SkeletonComponent } from '../skeleton/skeleton.component';

export type StatTone = 'primary' | 'success' | 'warn' | 'danger' | 'info';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="stat" [attr.data-tone]="tone()">
      <header class="stat__header">
        <span class="stat__label">{{ label() }}</span>
        <span class="stat__icon">
          <mat-icon>{{ icon() }}</mat-icon>
        </span>
      </header>
      @if (loading()) {
        <app-skeleton height="34px" width="80%" radius="10px" />
      } @else {
        <div class="stat__value">{{ value() }}</div>
      }
      @if (hint()) {
        <p class="stat__hint">{{ hint() }}</p>
      }
      @if (badge()) {
        <span class="stat__badge">{{ badge() }}</span>
      }
    </article>
  `,
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input<string | number>('—');
  readonly icon = input<string>('insights');
  readonly tone = input<StatTone>('primary');
  readonly hint = input<string>('');
  readonly badge = input<string>('');
  readonly loading = input<boolean>(false);

  readonly displayValue = computed(() => this.value());
}
