import { FormEvent, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { getOrganizationById } from '../mocks/organizations';

const NOTIF_ROWS = [
  { key: 'offline', label: 'Device goes offline' },
  { key: 'error', label: 'Device reports an error' },
  { key: 'failedPayment', label: 'Payment fails' },
];

export function Settings() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'SUPERADMIN';
  const org = user?.organizationId ? getOrganizationById(user.organizationId) : undefined;

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [notifs, setNotifs] = useState<Record<string, boolean>>({ offline: true, error: true, failedPayment: true });
  const [currency, setCurrency] = useState('RWF');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [pricePerGame, setPricePerGame] = useState(String(org?.pricePerGame ?? 400));
  const [businessName, setBusinessName] = useState(org?.name ?? '');

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    toast.show('Profile updated.', 'success');
  };

  const saveBusiness = (e: FormEvent) => {
    e.preventDefault();
    toast.show('Business settings updated.', 'success');
  };

  const savePlatform = (e: FormEvent) => {
    e.preventDefault();
    toast.show('Platform settings updated.', 'success');
  };

  return (
    <AppShell title="Profile & settings">
      <div className="settings-layout">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-secondary-tint)',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {user?.avatarInitials}
            </div>
            <div>
              <h3>Account</h3>
              <div className="caption">Your personal profile information</div>
            </div>
          </div>
          <form onSubmit={saveProfile} className="settings-form-grid">
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                Name
              </label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                New password
              </label>
              <input type="password" placeholder="••••••••" style={inputStyle} />
            </div>
            <div className="settings-form-actions">
              <Button type="submit" variant="primary" size="sm">
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Notification preferences</h3>
          <div className="notification-grid">
            {NOTIF_ROWS.map((row) => (
              <label key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifs[row.key]}
                  onChange={(e) => setNotifs((n) => ({ ...n, [row.key]: e.target.checked }))}
                />
                Email &amp; SMS me when a {row.label.toLowerCase()}
              </label>
            ))}
          </div>
        </Card>

        {!isAdmin && (
          <Card>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Business settings</h3>
            <form onSubmit={saveBusiness} className="settings-form-grid">
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                  Business name
                </label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                  Price per game (RWF)
                </label>
                <input type="number" value={pricePerGame} onChange={(e) => setPricePerGame(e.target.value)} style={inputStyle} />
              </div>
              <div className="settings-form-actions">
                <Button type="submit" variant="primary" size="sm">
                  Save business settings
                </Button>
              </div>
            </form>
          </Card>
        )}

        {isAdmin && (
          <Card style={{ background: 'var(--color-surface-sunken)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Platform settings</h3>
            <form onSubmit={savePlatform} className="settings-form-grid">
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                  Default currency display
                </label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle}>
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                  Session timeout (minutes)
                </label>
                <input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} style={inputStyle} />
              </div>
              <div className="settings-form-actions">
                <Button type="submit" variant="primary" size="sm">
                  Save platform settings
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontFamily: 'inherit',
  fontSize: 14,
};
