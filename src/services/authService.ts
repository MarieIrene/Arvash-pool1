import { User } from '../types';

const LATENCY = 550;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const MOCK_USERS: Record<string, User> = {
  'admin@arvashpool.rw': {
    id: 'user-admin-1',
    name: 'Sandrine Uwimana',
    email: 'admin@arvashpool.rw',
    role: 'SUPERADMIN',
    avatarInitials: 'SU',
  },
  'owner@arvashpool.rw': {
    id: 'user-owner-1',
    name: 'Jean-Paul Habimana',
    email: 'owner@arvashpool.rw',
    role: 'OWNER',
    organizationId: 'org-1',
    avatarInitials: 'JH',
  },
};

export interface LoginResult {
  ok: boolean;
  user?: User;
  error?: string;
}

export interface DemoAccount {
  email: string;
  label: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = Object.values(MOCK_USERS).map((u) => ({
  email: u.email,
  label: `${u.name} — ${u.role === 'SUPERADMIN' ? 'Platform Administrator' : 'Pool Owner'}`,
}));

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const user = MOCK_USERS[email.trim().toLowerCase()];
    if (!user) {
      return delay({ ok: false, error: 'No account found with that email.' });
    }
    if (password.length < 4) {
      return delay({ ok: false, error: 'Incorrect password. Try again.' });
    }
    return delay({ ok: true, user });
  },
};
