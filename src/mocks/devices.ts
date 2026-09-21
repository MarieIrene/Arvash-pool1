import { Device, DeviceStatus } from '../types';
import { organizations } from './organizations';
import { RWANDA_GEO } from './geo';
import { randInt, pick, isoMinutesAgo } from './rng';

const FIRMWARE_VERSIONS = ['2.4.1', '2.4.0', '2.3.6', '2.3.5'];
const CAUSES = [
  'no heartbeat for 47 minutes',
  'no heartbeat for 3 hours',
  'motor stall detected on last cycle',
  'coin/mobile-money validator fault',
  'lost network after power cycle',
];

let deviceCounter = 1;
export const devices: Device[] = [];

organizations.forEach((org, orgIdx) => {
  const geo = RWANDA_GEO[orgIdx % RWANDA_GEO.length];
  const district = pick(geo.districts);
  const sector = pick(district.sectors);
  const locationId = `loc-${org.id}`;
  const locationName = `${org.name.split(' ')[0]} Main Hall`;

  let onlineLeft = org.onlineCount;
  let offlineLeft = org.offlineCount;
  let errorLeft = org.errorCount;

  for (let t = 1; t <= org.deviceCount; t++) {
    let status: DeviceStatus;
    if (errorLeft > 0) {
      status = 'ERROR';
      errorLeft--;
    } else if (offlineLeft > 0) {
      status = 'OFFLINE';
      offlineLeft--;
    } else if (onlineLeft > 0) {
      status = 'ONLINE';
      onlineLeft--;
    } else {
      status = 'ONLINE';
    }

    const isProvisioned = org.status === 'ACTIVE' && orgIdx === 2 && t === org.deviceCount;
    const finalStatus: DeviceStatus = isProvisioned ? 'PROVISIONED' : status;

    devices.push({
      id: `dev-${String(deviceCounter).padStart(4, '0')}`,
      serial: `APV-${String(2400 + deviceCounter)}`,
      tableName: `Table ${t}`,
      organizationId: org.id,
      organizationName: org.name,
      locationId,
      locationName,
      province: geo.name,
      district: district.name,
      sector,
      status: finalStatus,
      battery: finalStatus === 'OFFLINE' ? randInt(0, 25) : randInt(35, 100),
      signal: finalStatus === 'OFFLINE' ? 0 : randInt(1, 4),
      firmwareVersion: pick(FIRMWARE_VERSIONS),
      firmwareUpdateAvailable: Math.random() > 0.6,
      lastSeen:
        finalStatus === 'ONLINE'
          ? isoMinutesAgo(randInt(0, 8))
          : finalStatus === 'OFFLINE'
            ? isoMinutesAgo(randInt(30, 400))
            : isoMinutesAgo(randInt(5, 90)),
      offlineCredits: finalStatus === 'OFFLINE' ? randInt(0, 6) : 0,
      likelyCause: finalStatus === 'ERROR' || finalStatus === 'OFFLINE' ? pick(CAUSES) : undefined,
    });
    deviceCounter++;
  }
});

export function getDeviceById(id: string): Device | undefined {
  return devices.find((d) => d.id === id);
}

export function getDevicesByOrg(orgId: string): Device[] {
  return devices.filter((d) => d.organizationId === orgId);
}
