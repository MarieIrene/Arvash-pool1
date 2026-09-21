import { Organization } from '../types';
import { RWANDA_GEO } from './geo';
import { randInt, isoDaysAgo } from './rng';

const NAMES = [
  'Kigali Cue Club',
  'Remera Rack & Roll',
  'Huye Billiards House',
  'Musanze Table Sports',
  'Gisenyi Lakeside Pool',
  'Nyamirambo Break Room',
  'Rwamagana Pool Lounge',
  'Muhanga Cue Corner',
  'Kimironko Pocket Bar',
];

const OWNERS = [
  'Jean-Paul Habimana',
  'Diane Uwase',
  'Eric Mugisha',
  'Claudine Ingabire',
  'Patrick Niyonzima',
  'Aline Mukamana',
  'Robert Nsengimana',
  'Josiane Umutoni',
  'Emmanuel Twagirayezu',
];

export const organizations: Organization[] = NAMES.map((name, i) => {
  const region = RWANDA_GEO[i % RWANDA_GEO.length].name;
  const deviceCount = randInt(2, 12);
  const errorCount = i === 1 ? 2 : randInt(0, 1);
  const offlineCount = i === 4 ? 3 : randInt(0, 2);
  const onlineCount = Math.max(deviceCount - errorCount - offlineCount, 0);
  return {
    id: `org-${i + 1}`,
    name,
    ownerName: OWNERS[i],
    ownerContact: `+250 7${randInt(2, 9)}${randInt(100, 999)}${randInt(1000, 9999)}`,
    pricePerGame: [300, 400, 500][i % 3],
    locationCount: randInt(1, 3),
    deviceCount,
    onlineCount,
    offlineCount,
    errorCount,
    revenueThisMonth: randInt(180_000, 2_400_000),
    status: i === 7 ? 'SUSPENDED' : 'ACTIVE',
    region,
    createdAt: isoDaysAgo(randInt(30, 540)),
  };
});

export function getOrganizationById(id: string): Organization | undefined {
  return organizations.find((o) => o.id === id);
}
