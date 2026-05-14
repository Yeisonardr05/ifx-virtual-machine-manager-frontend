import { sampleVm } from '../../../testing/fixtures';

import { unwrapVm, unwrapVmList } from './vm-api-response';

describe('vm-api-response', () => {
  const vm = sampleVm();

  it('unwrapVmList returns array body as-is', () => {
    expect(unwrapVmList([vm])).toEqual([vm]);
  });

  it('unwrapVmList reads data array from envelope', () => {
    expect(unwrapVmList({ success: true, data: [vm] })).toEqual([vm]);
  });

  it('unwrapVmList returns empty for unknown shape', () => {
    expect(unwrapVmList({ data: 'x' })).toEqual([]);
    expect(unwrapVmList(null)).toEqual([]);
    expect(unwrapVmList({})).toEqual([]);
  });

  it('unwrapVm reads data object from envelope', () => {
    expect(unwrapVm({ data: vm })).toEqual(vm);
  });

  it('unwrapVm falls back to body cast', () => {
    expect(unwrapVm(vm)).toEqual(vm);
  });
});
