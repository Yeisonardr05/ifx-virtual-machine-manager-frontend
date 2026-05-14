import { RelativeTimePipe } from './relative-time.pipe';
import { StorageSizePipe } from './storage-size.pipe';

describe('RelativeTimePipe', () => {
  const pipe = new RelativeTimePipe();

  it('returns em dash for empty or invalid', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('')).toBe('—');
    expect(pipe.transform('not-a-date')).toBe('—');
  });

  it('formats a near date', () => {
    const d = new Date(Date.now() + 60_000);
    expect(pipe.transform(d)).toBeTruthy();
  });
});

describe('StorageSizePipe', () => {
  const pipe = new StorageSizePipe();

  it('handles nullish and NaN', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(Number.NaN)).toBe('—');
  });

  it('formats TB rollover from GB', () => {
    expect(pipe.transform(2048, 'GB')).toContain('TB');
  });

  it('formats MB to GB', () => {
    expect(pipe.transform(2048, 'MB')).toContain('GB');
  });

  it('prints plain GB', () => {
    expect(pipe.transform(100, 'GB')).toBe('100 GB');
  });
});
