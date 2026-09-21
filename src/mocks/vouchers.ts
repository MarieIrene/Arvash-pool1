import { Voucher } from '../types';
import { devices } from './devices';
import { randInt, pick, isoDaysAgo } from './rng';

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[randInt(0, chars.length - 1)]).join('');
}

export const vouchers: Voucher[] = Array.from({ length: 24 }, () => {
  const device = pick(devices);
  const redeemed = Math.random() < 0.55;
  return {
    code: randomCode(),
    deviceId: device.id,
    deviceName: device.tableName,
    redeemed,
    expiresAt: isoDaysAgo(-randInt(1, 20)), // negative "days ago" = a future date
  };
});

export function findVoucher(code: string, deviceId: string): Voucher | undefined {
  return vouchers.find((v) => v.code.toUpperCase() === code.trim().toUpperCase() && v.deviceId === deviceId);
}
