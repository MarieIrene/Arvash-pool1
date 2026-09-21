import { randInt } from './rng';

export interface CountPoint {
  date: string;
  count: number;
}

function buildCountTrend(days: number, base: number, variance: number): CountPoint[] {
  const points: CountPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const weekendBoost = [0, 6].includes(d.getDay()) ? 1.3 : 1;
    points.push({
      date: d.toISOString().slice(0, 10),
      count: Math.max(0, Math.round(base * weekendBoost + randInt(-variance, variance))),
    });
  }
  return points;
}

export const gamesPlayedTrend: CountPoint[] = buildCountTrend(30, 340, 90);
