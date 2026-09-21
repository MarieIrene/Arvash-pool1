import { FirmwareVersion } from '../types';
import { isoDaysAgo } from './rng';

export const firmwareVersions: FirmwareVersion[] = [
  {
    id: 'fw-2.4.1',
    version: '2.4.1',
    releaseNotes: 'Improves coin/mobile-money validator reliability and fixes a rare motor-stall on cold boot.',
    compatibleModels: ['APV-2400', 'APV-2300'],
    rolloutPercent: 62,
    releasedAt: isoDaysAgo(6),
  },
  {
    id: 'fw-2.4.0',
    version: '2.4.0',
    releaseNotes: 'Adds offline-credit pre-authorization and improves heartbeat interval under weak signal.',
    compatibleModels: ['APV-2400', 'APV-2300'],
    rolloutPercent: 94,
    releasedAt: isoDaysAgo(34),
  },
  {
    id: 'fw-2.3.6',
    version: '2.3.6',
    releaseNotes: 'Security patch for the tamper sensor firmware bridge.',
    compatibleModels: ['APV-2300'],
    rolloutPercent: 100,
    releasedAt: isoDaysAgo(90),
  },
  {
    id: 'fw-2.3.5',
    version: '2.3.5',
    releaseNotes: 'Initial fleet-wide release: MoMo/Airtel payment gating and basic telemetry.',
    compatibleModels: ['APV-2300'],
    rolloutPercent: 100,
    releasedAt: isoDaysAgo(180),
  },
];

export function getFirmwareById(id: string): FirmwareVersion | undefined {
  return firmwareVersions.find((f) => f.id === id);
}
