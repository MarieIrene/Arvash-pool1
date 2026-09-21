import { ActivityItem } from '../types';
import { devices } from './devices';
import { pick, isoMinutesAgo } from './rng';

const errorDevices = devices.filter((d) => d.status === 'ERROR');
const offlineDevices = devices.filter((d) => d.status === 'OFFLINE');

function activityFor(devicePool = devices, count = 14): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (let i = 0; i < count; i++) {
    const device = pick(devicePool.length ? devicePool : devices);
    const roll = Math.random();
    if (roll < 0.45) {
      items.push({
        id: `act-${i}-pay`,
        type: 'payment',
        message: `${device.tableName} at ${device.organizationName} received a payment of 400 RWF`,
        timestamp: isoMinutesAgo(i * 7 + 2),
        deviceId: device.id,
        organizationName: device.organizationName,
        severity: 'success',
      });
    } else if (roll < 0.65 && errorDevices.length) {
      const d = pick(errorDevices);
      items.push({
        id: `act-${i}-motor`,
        type: 'motor_error',
        message: `${d.tableName} at ${d.organizationName} reported a motor error`,
        timestamp: isoMinutesAgo(i * 11 + 5),
        deviceId: d.id,
        organizationName: d.organizationName,
        severity: 'danger',
      });
    } else if (roll < 0.82 && offlineDevices.length) {
      const d = pick(offlineDevices);
      items.push({
        id: `act-${i}-off`,
        type: 'device_offline',
        message: `${d.tableName} at ${d.organizationName} went offline`,
        timestamp: isoMinutesAgo(i * 13 + 9),
        deviceId: d.id,
        organizationName: d.organizationName,
        severity: 'warning',
      });
    } else {
      items.push({
        id: `act-${i}-tamper`,
        type: 'tamper',
        message: `Tamper alert triggered on ${device.tableName} at ${device.organizationName}`,
        timestamp: isoMinutesAgo(i * 17 + 3),
        deviceId: device.id,
        organizationName: device.organizationName,
        severity: 'warning',
      });
    }
  }
  return items.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export const platformActivity: ActivityItem[] = activityFor(devices, 16);
