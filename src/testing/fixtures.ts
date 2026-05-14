import type { User } from '../app/core/models/user.model';
import type { VirtualMachine } from '../app/core/models/vm.model';

export function sampleUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@test.com',
    role: 'ADMIN',
    ...overrides,
  };
}

export function sampleVm(overrides: Partial<VirtualMachine> = {}): VirtualMachine {
  return {
    id: 1,
    name: 'vm-1',
    cores: 2,
    ram: 4,
    disk: 40,
    os: 'Ubuntu 22.04',
    status: 'RUNNING',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    ...overrides,
  };
}
