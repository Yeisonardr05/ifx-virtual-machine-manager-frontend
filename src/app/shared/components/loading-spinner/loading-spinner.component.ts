import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner" [style.--size.px]="size()">
      <span class="spinner__dot"></span>
      <span class="spinner__dot"></span>
      <span class="spinner__dot"></span>
    </div>
  `,
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  readonly size = input<number>(36);
}
