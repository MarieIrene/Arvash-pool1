import { Device, DeviceStatus } from '../types';
import { devices, getDeviceById } from '../mocks/devices';
import { getEventsByDevice, getSessionsByDevice } from '../mocks/deviceHistory';

const LATENCY = 420;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface DeviceFilter {
  organizationId?: string;
  status?: DeviceStatus;
  province?: string;
  district?: string;
  sector?: string;
  search?: string;
}

export const deviceService = {
  async list(filter: DeviceFilter = {}): Promise<Device[]> {
    let result = [...devices];
    if (filter.organizationId) result = result.filter((d) => d.organizationId === filter.organizationId);
    if (filter.status) result = result.filter((d) => d.status === filter.status);
    if (filter.province) result = result.filter((d) => d.province === filter.province);
    if (filter.district) result = result.filter((d) => d.district === filter.district);
    if (filter.sector) result = result.filter((d) => d.sector === filter.sector);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.tableName.toLowerCase().includes(q) ||
          d.serial.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q)
      );
    }
    return delay(result);
  },
  async get(id: string): Promise<Device | undefined> {
    return delay(getDeviceById(id));
  },
  async events(deviceId: string) {
    return delay(getEventsByDevice(deviceId));
  },
  async sessions(deviceId: string) {
    return delay(getSessionsByDevice(deviceId));
  },
};
