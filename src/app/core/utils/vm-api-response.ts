import { VirtualMachine } from '../models/vm.model';

/** Backend often wraps payloads as `{ success, message, data, timestamp }`. */
interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function unwrapVmList(body: unknown): VirtualMachine[] {
  if (Array.isArray(body)) {
    return body as VirtualMachine[];
  }
  if (isRecord(body) && 'data' in body) {
    const data = (body as ApiEnvelope<unknown>).data;
    if (Array.isArray(data)) {
      return data as VirtualMachine[];
    }
  }
  return [];
}

export function unwrapVm(body: unknown): VirtualMachine {
  if (isRecord(body) && 'data' in body) {
    const data = (body as ApiEnvelope<unknown>).data;
    if (isRecord(data)) {
      return data as unknown as VirtualMachine;
    }
  }
  return body as VirtualMachine;
}
