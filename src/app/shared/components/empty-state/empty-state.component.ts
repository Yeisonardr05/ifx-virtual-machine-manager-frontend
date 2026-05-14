import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <div class="empty__icon">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <h3 class="empty__title">{{ title() }}</h3>
      @if (description()) {
        <p class="empty__description">{{ description() }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly title = input.required<string>();
  readonly description = input<string>('');
}
