import { OPERATING_SYSTEMS } from './operating-systems';

describe('OPERATING_SYSTEMS', () => {
  it('has unique values', () => {
    const values = OPERATING_SYSTEMS.map((o) => o.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
