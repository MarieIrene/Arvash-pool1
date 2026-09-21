import { RevenuePoint } from '../types';
import { randInt } from './rng';

function buildTrend(days: number, base: number, variance: number): RevenuePoint[] {
  const points: RevenuePoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const weekendBoost = [0, 6].includes(d.getDay()) ? 1.25 : 1;
    points.push({
      date: d.toISOString().slice(0, 10),
      revenue: Math.round(base * weekendBoost + randInt(-variance, variance)),
    });
  }
  return points;
}

export const platformRevenueTrend: RevenuePoint[] = buildTrend(30, 480_000, 120_000);
export const ownerRevenueTrend: RevenuePoint[] = buildTrend(30, 62_000, 18_000);

// For scoping a revenue trend to a single organization's monthly total (e.g. Organization Details).
export function revenueTrendForMonthlyTotal(monthlyTotal: number): RevenuePoint[] {
  const dailyBase = monthlyTotal / 30;
  return buildTrend(30, dailyBase, dailyBase * 0.3);
}

export interface CountPoint {
  date: string;
  count: number;
}

// Same shape/cadence as the revenue trend, but transaction count per day rather than RWF.
export const paymentVolumeTrend: CountPoint[] = buildTrend(30, 140, 35).map((p) => ({
  date: p.date,
  count: Math.round(p.revenue / 1000),
}));
