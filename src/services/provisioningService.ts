import { Device } from '../types';
import { devices } from '../mocks/devices';
import { randInt } from '../mocks/rng';

const LATENCY = 450;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface RegisterDeviceInput {
  serial: string;
  tableName: string;
  firmwareVersion: string;
}

export const provisioningService = {
  async queue(): Promise<Device[]> {
    return delay(devices.filter((d) => d.status === 'PROVISIONED'));
  },
  isDuplicateSerial(serial: string): boolean {
    return devices.some((d) => d.serial.toLowerCase() === serial.trim().toLowerCase());
  },
  async register(input: RegisterDeviceInput): Promise<Device> {
    const device: Device = {
      id: crypto.randomUUID(),
      serial: input.serial.trim(),
      tableName: input.tableName.trim(),
      organizationId: '',
      organizationName: 'Unassigned',
      locationId: '',
      locationName: 'Unassigned',
      province: '',
      district: '',
      sector: '',
      status: 'PROVISIONED',
      battery: 100,
      signal: 4,
      firmwareVersion: input.firmwareVersion,
      firmwareUpdateAvailable: false,
      lastSeen: new Date().toISOString(),
      offlineCredits: 0,
    };
    return delay(device);
  },
  async assign(_deviceId: string, _organizationId: string): Promise<{ ok: true }> {
    return delay({ ok: true }, randInt(350, 550));
  },
};
