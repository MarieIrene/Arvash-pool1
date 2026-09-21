import { FirmwareVersion } from '../types';
import { firmwareVersions } from '../mocks/firmware';

const LATENCY = 400;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const firmwareService = {
  async list(): Promise<FirmwareVersion[]> {
    return delay([...firmwareVersions]);
  },
};
