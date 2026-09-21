import { Ticket, TicketType, TicketStatus } from '../types';
import { devices } from './devices';
import { stuckPayments } from './transactions';
import { randInt, pick, isoDaysAgo, isoMinutesAgo } from './rng';

const STATUSES: TicketStatus[] = ['OPEN', 'INVESTIGATING', 'RESOLVED'];
const AGENTS = ['Sandrine Uwimana', 'Eric Nshuti', 'Aline Mukamana'];

const HARDWARE_SUBJECTS = [
  'Compartment motor jammed after payment',
  'Device rebooting in a loop',
  'Coin validator misreading mobile money confirmation',
  'Tamper sensor stuck in triggered state',
];

const VOUCHER_SUBJECTS = [
  'Customer says voucher code was rejected',
  'Voucher shows redeemed but customer never played',
  'Duplicate voucher code issued for two devices',
];

let counter = 1;
function nextId(): string {
  return `tkt-${String(1000 + counter++)}`;
}

function buildNotes(count: number): Ticket['notes'] {
  return Array.from({ length: count }, (_, i) => ({
    id: `note-${counter}-${i}`,
    author: pick(AGENTS),
    text: pick([
      'Reached out to the pool owner for more detail.',
      'Confirmed the device is still reporting heartbeats.',
      'Escalated to hardware team for a field visit.',
      'Waiting on the customer to confirm the phone number used.',
    ]),
    timestamp: isoDaysAgo(randInt(0, 5), randInt(0, 23)),
  }));
}

// Payment-mismatch tickets, one per stuck payment (capped for a readable queue).
const paymentMismatchTickets: Ticket[] = stuckPayments.slice(0, 10).map((t) => ({
  id: nextId(),
  type: 'payment_mismatch' as TicketType,
  status: pick(STATUSES),
  subject: `Payment succeeded but no session recorded — ${t.tableName}`,
  organizationId: t.organizationId,
  organizationName: t.organizationName,
  deviceId: t.deviceId,
  deviceName: t.tableName,
  paymentId: t.id,
  notes: buildNotes(randInt(0, 2)),
  createdAt: t.timestamp,
  updatedAt: isoMinutesAgo(randInt(0, 60 * 24 * 2)),
}));

const hardwareFaultTickets: Ticket[] = HARDWARE_SUBJECTS.map((subject) => {
  const device = pick(devices);
  return {
    id: nextId(),
    type: 'hardware_fault' as TicketType,
    status: pick(STATUSES),
    subject: `${subject} — ${device.tableName}`,
    organizationId: device.organizationId,
    organizationName: device.organizationName,
    deviceId: device.id,
    deviceName: device.tableName,
    notes: buildNotes(randInt(0, 3)),
    createdAt: isoDaysAgo(randInt(1, 20)),
    updatedAt: isoMinutesAgo(randInt(0, 60 * 24 * 5)),
  };
});

const voucherIssueTickets: Ticket[] = VOUCHER_SUBJECTS.map((subject) => {
  const device = pick(devices);
  return {
    id: nextId(),
    type: 'voucher_issue' as TicketType,
    status: pick(STATUSES),
    subject: `${subject} — ${device.organizationName}`,
    organizationId: device.organizationId,
    organizationName: device.organizationName,
    deviceId: device.id,
    deviceName: device.tableName,
    notes: buildNotes(randInt(0, 2)),
    createdAt: isoDaysAgo(randInt(1, 15)),
    updatedAt: isoMinutesAgo(randInt(0, 60 * 24 * 3)),
  };
});

export const tickets: Ticket[] = [...paymentMismatchTickets, ...hardwareFaultTickets, ...voucherIssueTickets].sort(
  (a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)
);

export function getTicketById(id: string): Ticket | undefined {
  return tickets.find((t) => t.id === id);
}
