import { DeviceEvent, GameSession } from '../types';
import { devices } from './devices';
import { transactions } from './transactions';
import { randInt, isoMinutesAgo } from './rng';

export const deviceEvents: DeviceEvent[] = [];
export const gameSessions: GameSession[] = [];

devices.forEach((device) => {
  const eventCount = randInt(4, 9);
  for (let i = 0; i < eventCount; i++) {
    const roll = Math.random();
    let type: DeviceEvent['type'] = 'heartbeat';
    let payload: Record<string, string | number> = {};
    if (roll < 0.15) {
      type = 'boot';
      payload = { reason: 'scheduled restart', uptimeSeconds: randInt(1000, 90000) };
    } else if (roll < 0.3 && device.status === 'ERROR') {
      type = 'motor_error';
      payload = { code: 'E-204', detail: 'compartment motor stall' };
    } else if (roll < 0.4) {
      type = 'tamper_alert';
      payload = { sensor: 'lid switch', duration_ms: randInt(200, 4000) };
    } else if (roll < 0.75) {
      type = 'payment_success';
      payload = { amount_rwf: 400, method: 'MoMo' };
    } else {
      type = 'heartbeat';
      payload = { battery: device.battery, signal: device.signal };
    }
    deviceEvents.push({
      id: `evt-${device.id}-${i}`,
      deviceId: device.id,
      type,
      timestamp: isoMinutesAgo(randInt(0, 60 * 24 * 10)),
      payload,
    });
  }

  const txns = transactions.filter((t) => t.deviceId === device.id && t.hasSession);
  txns.forEach((t, idx) => {
    const gamesPlayed = randInt(0, t.gamesCount);
    gameSessions.push({
      id: `sess-${device.id}-${idx}`,
      deviceId: device.id,
      startedAt: t.timestamp,
      endedAt: gamesPlayed === t.gamesCount ? isoMinutesAgo(randInt(0, 60)) : null,
      gamesPlayed,
      gamesPurchased: t.gamesCount,
      paymentId: t.id,
    });
  });
});

export function getEventsByDevice(deviceId: string): DeviceEvent[] {
  return deviceEvents
    .filter((e) => e.deviceId === deviceId)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export function getSessionsByDevice(deviceId: string): GameSession[] {
  return gameSessions
    .filter((s) => s.deviceId === deviceId)
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
}
