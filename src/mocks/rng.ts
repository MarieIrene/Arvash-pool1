// Small deterministic PRNG so mock data is stable across reloads.
let seed = 42;

export function rand(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function isoDaysAgo(days: number, hours = 0, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours, d.getMinutes() - minutes);
  return d.toISOString();
}

export function isoMinutesAgo(minutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}
