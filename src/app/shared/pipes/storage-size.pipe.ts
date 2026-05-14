import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'storageSize', standalone: true })
export class StorageSizePipe implements PipeTransform {
  transform(value: number | null | undefined, unit: 'GB' | 'MB' = 'GB'): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '—';
    }

    if (unit === 'GB' && value >= 1024) {
      return `${(value / 1024).toFixed(1)} TB`;
    }
    if (unit === 'MB' && value >= 1024) {
      return `${(value / 1024).toFixed(1)} GB`;
    }

    return `${value} ${unit}`;
  }
}
