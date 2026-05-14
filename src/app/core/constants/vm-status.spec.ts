import { VM_STATUS_META, VM_STATUS_OPTIONS } from './vm-status';

describe('vm-status constants', () => {
  it('covers every status key', () => {
    for (const opt of VM_STATUS_OPTIONS) {
      expect(VM_STATUS_META[opt.value].label).toBeTruthy();
    }
  });
});
