import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="skeleton"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="radius()"
    ></span>
  `,
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('16px');
  readonly radius = input<string>('8px');
}
