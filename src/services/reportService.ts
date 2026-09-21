import { organizations } from '../mocks/organizations';
import { gamesPlayedTrend, CountPoint } from '../mocks/reports';
import { paymentVolumeTrend } from '../mocks/revenue';

const LATENCY = 450;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export interface OrgMetric {
  organizationId: string;
  organizationName: string;
  value: number;
}

export const reportService = {
  async revenueByOrganization(): Promise<OrgMetric[]> {
    return delay(
      organizations.map((o) => ({ organizationId: o.id, organizationName: o.name, value: o.revenueThisMonth }))
    );
  },
  async uptimeByOrganization(): Promise<OrgMetric[]> {
    return delay(
      organizations.map((o) => ({
        organizationId: o.id,
        organizationName: o.name,
        value: o.deviceCount > 0 ? Math.round((o.onlineCount / o.deviceCount) * 100) : 100,
      }))
    );
  },
  async gamesPlayedTrend(): Promise<CountPoint[]> {
    return delay([...gamesPlayedTrend]);
  },
  async paymentVolumeTrend() {
    return delay([...paymentVolumeTrend]);
  },
};
