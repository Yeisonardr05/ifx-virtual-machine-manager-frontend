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

export type CreateVmPayload = Omit<VirtualMachine, 'id' | 'createdAt' | 'updatedAt' | 'status'>;

/** Partial changes from UI; {@link VmStore.updateVm} merges onto the current row before PUT. */
export type UpdateVmPayload = Partial<Omit<VirtualMachine, 'id' | 'createdAt' | 'updatedAt'>>;

/** Full VM fields required by the backend on `PUT /vms/{id}`. */
export type VmUpdateRequestBody = Omit<VirtualMachine, 'id' | 'createdAt' | 'updatedAt'>;
