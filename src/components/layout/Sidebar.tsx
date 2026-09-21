import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  MonitorSmartphone,
  Receipt,
  CreditCard,
  FileBarChart,
  PackagePlus,
  UploadCloud,
  LifeBuoy,
  Settings,
  MapPin,
  CircleDot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
}

const ADMIN_NAV: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { to: '/admin/devices', label: 'Devices', icon: MonitorSmartphone },
  { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/provisioning', label: 'Manufacturing', icon: PackagePlus },
  { to: '/admin/flasher', label: 'Flasher', icon: UploadCloud },
  { to: '/admin/support', label: 'Support', icon: LifeBuoy },
];

const OWNER_NAV: NavItem[] = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/owner/locations', label: 'Live locations', icon: MapPin },
  { to: '/owner/devices', label: 'Devices', icon: MonitorSmartphone },
  { to: '/owner/transactions', label: 'Transactions', icon: Receipt },
  { to: '/owner/revenue', label: 'Revenue', icon: FileBarChart },
];

export function Sidebar() {
  const { user } = useAuth();
  const items = user?.role === 'SUPERADMIN' ? ADMIN_NAV : OWNER_NAV;

  return (
    <aside
      className="app-sidebar"
      style={{
        width: 232,
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-5) var(--space-4)' }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <CircleDot size={17} strokeWidth={1.75} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Arvash Pool</div>
          <div className="caption">Fleet management</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 var(--space-3)', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            title={item.label}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              background: isActive ? 'var(--color-primary-tint)' : 'transparent',
              textDecoration: 'none',
            })}
          >
            <item.icon size={20} strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
        <NavLink
          to={user?.role === 'SUPERADMIN' ? '/admin/settings' : '/owner/settings'}
          aria-label="Profile and settings"
          title="Profile and settings"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 500,
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: isActive ? 'var(--color-primary-tint)' : 'transparent',
            textDecoration: 'none',
          })}
        >
          <Settings size={20} strokeWidth={1.5} />
          Profile &amp; settings
        </NavLink>
      </div>
    </aside>
  );
}
