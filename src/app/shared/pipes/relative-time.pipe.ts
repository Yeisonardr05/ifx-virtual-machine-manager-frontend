import { Pipe, PipeTransform } from '@angular/core';

const DIVISIONS: ReadonlyArray<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' },
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
];

@Pipe({ name: 'relativeTime', standalone: true, pure: true })
export class RelativeTimePipe implements PipeTransform {
  private readonly formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '—';
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    let duration = (date.getTime() - Date.now()) / 1000;
    for (const division of DIVISIONS) {
      if (Math.abs(duration) < division.amount) {
        return this.formatter.format(Math.round(duration), division.unit);
      }
      duration /= division.amount;
    }
    return '';
  }
}
