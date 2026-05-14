export type VmStatus = 'RUNNING' | 'STOPPED' | 'PAUSED';

export interface VirtualMachine {
  id: number;
  name: string;
  cores: number;
  ram: number;
  disk: number;
  os: string;
  status: VmStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateVmPayload = Omit<VirtualMachine, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateVmPayload = Partial<CreateVmPayload>;
