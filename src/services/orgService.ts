import { Organization } from '../types';
import { organizations, getOrganizationById } from '../mocks/organizations';

const LATENCY = 380;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const orgService = {
  async list(): Promise<Organization[]> {
    return delay([...organizations]);
  },
  async get(id: string): Promise<Organization | undefined> {
    return delay(getOrganizationById(id));
  },
};
