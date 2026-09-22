import { Transaction, PaymentMethod, PaymentStatus } from '../types';
import { devices } from './devices';
import { randInt, pick, isoMinutesAgo } from './rng';

const METHODS: PaymentMethod[] = ['MoMo', 'Airtel'];

function randomPhone(): string {
  return `+250 7${randInt(2, 9)}${randInt(100, 999)}${randInt(1000, 9999)}`;
}

export const transactions: Transaction[] = Array.from({ length: 90 }, (_, i) => {
  const device = pick(devices);
  const roll = Math.random();
  let status: PaymentStatus = 'SUCCESS';
  let hasSession = true;
  if (roll < 0.08) {
    status = 'FAILED';
    hasSession = false;
  } else if (roll < 0.15) {
    status = 'PENDING';
    hasSession = false;
  } else if (roll < 0.2) {
    // "stuck payment": succeeded but no session was ever created
    status = 'SUCCESS';
    hasSession = false;
  }

  const gamesCount = pick([1, 2, 3, 5]);
  return {
    id: `txn-${String(10000 + i)}`,
    referenceUuid: `7b${String(i).padStart(2, '0')}9a4f-42d1-4c8e-9b3a-${String(100000000000 + i).padStart(12, '0')}`,
    referenceNumber: `ARV-${String(10000 + i)}`,
    timestamp: isoMinutesAgo(randInt(1, 60 * 24 * 14)),
    organizationId: device.organizationId,
    organizationName: device.organizationName,
    deviceId: device.id,
    tableName: device.tableName,
    amount: gamesCount * 400,
    method: pick(METHODS),
    status,
    gamesCount,
    customerPhone: randomPhone(),
    hasSession,
  };
}).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

export function getTransactionsByDevice(deviceId: string): Transaction[] {
  return transactions.filter((t) => t.deviceId === deviceId);
}

export function getTransactionById(id: string): Transaction | undefined {
  return transactions.find((t) => t.id === id);
}

export const stuckPayments = transactions.filter((t) => t.status === 'SUCCESS' && !t.hasSession);
