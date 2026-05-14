import { VmStatus } from '../models/vm.model';

export interface VmStatusMeta {
  label: string;
  color: string;
  icon: string;
}

export const VM_STATUS_META: Readonly<Record<VmStatus, VmStatusMeta>> = {
  RUNNING: { label: 'Running', color: 'success', icon: 'play_circle' },
  STOPPED: { label: 'Stopped', color: 'danger', icon: 'stop_circle' },
  PAUSED: { label: 'Paused', color: 'warn', icon: 'pause_circle' },
};

export const VM_STATUS_OPTIONS: ReadonlyArray<{ value: VmStatus; label: string }> = [
  { value: 'RUNNING', label: 'Running' },
  { value: 'STOPPED', label: 'Stopped' },
  { value: 'PAUSED', label: 'Paused' },
];
