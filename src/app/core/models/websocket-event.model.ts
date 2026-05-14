import { VirtualMachine } from './vm.model';

export type VmEventType =
  | 'VM_CREATED'
  | 'VM_UPDATED'
  | 'VM_DELETED'
  | 'VM_STATUS_CHANGED';

export interface VmEvent {
  event: VmEventType;
  data: VirtualMachine | { id: number };
}
