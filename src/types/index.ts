export type Role = 'SUPERADMIN' | 'OWNER';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'ERROR' | 'PROVISIONED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type PaymentMethod = 'MoMo' | 'Airtel';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string;
  avatarInitials: string;
}

export interface Location {
  id: string;
  name: string;
  province: string;
  district: string;
  sector: string;
  address: string;
  deviceCount: number;
  onlineRatio: number; // 0-1
}

export interface Organization {
  id: string;
  name: string;
  ownerName: string;
  ownerContact: string;
  pricePerGame: number; // RWF
  locationCount: number;
  deviceCount: number;
  onlineCount: number;
  offlineCount: number;
  errorCount: number;
  revenueThisMonth: number; // RWF
  status: 'ACTIVE' | 'SUSPENDED';
  region: string;
  createdAt: string;
}

export interface Device {
  id: string; // UUID
  serial: string;
  tableName: string;
  organizationId: string;
  organizationName: string;
  locationId: string;
  locationName: string;
  province: string;
  district: string;
  sector: string;
  status: DeviceStatus;
  battery: number; // 0-100
  signal: number; // 0-4 bars
  firmwareVersion: string;
  firmwareUpdateAvailable: boolean;
  lastSeen: string; // ISO date
  offlineCredits: number;
  likelyCause?: string;
}

export interface DeviceEvent {
  id: string;
  deviceId: string;
  type: 'boot' | 'tamper_alert' | 'motor_error' | 'payment_success' | 'heartbeat';
  timestamp: string;
  payload: Record<string, string | number>;
}

export interface GameSession {
  id: string;
  deviceId: string;
  startedAt: string;
  endedAt: string | null;
  gamesPlayed: number;
  gamesPurchased: number;
  paymentId: string;
}

export interface Transaction {
  id: string;
  referenceUuid: string;
  referenceNumber: string;
  timestamp: string;
  organizationId: string;
  organizationName: string;
  deviceId: string;
  tableName: string;
  amount: number; // RWF
  method: PaymentMethod;
  status: PaymentStatus;
  gamesCount: number;
  customerPhone: string;
  hasSession: boolean; // false + SUCCESS = "stuck payment"
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface ActivityItem {
  id: string;
  type: 'payment' | 'tamper' | 'motor_error' | 'device_offline';
  message: string;
  timestamp: string;
  deviceId?: string;
  organizationName?: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
}

export type TicketType = 'payment_mismatch' | 'voucher_issue' | 'hardware_fault';
export type TicketStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export interface TicketNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  type: TicketType;
  status: TicketStatus;
  subject: string;
  organizationId: string;
  organizationName: string;
  deviceId?: string;
  deviceName?: string;
  paymentId?: string;
  notes: TicketNote[];
  createdAt: string;
  updatedAt: string;
}

export interface FirmwareVersion {
  id: string;
  version: string;
  releaseNotes: string;
  compatibleModels: string[];
  rolloutPercent: number;
  releasedAt: string;
}

export interface Voucher {
  code: string;
  deviceId: string;
  deviceName: string;
  redeemed: boolean;
  expiresAt: string;
}
