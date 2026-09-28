import { NavLink, useLocation } from 'react-router-dom';
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
  MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';
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
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const items = user?.role === 'SUPERADMIN' ? ADMIN_NAV : OWNER_NAV;
  const mobilePrimary = user?.role === 'SUPERADMIN'
    ? items.filter((item) => ['/admin/dashboard', '/admin/devices', '/admin/transactions'].includes(item.to))
    : items.filter((item) => ['/owner/dashboard', '/owner/devices', '/owner/transactions'].includes(item.to));
  const mobileMore = items.filter((item) => !mobilePrimary.includes(item));
  const settingsPath = user?.role === 'SUPERADMIN' ? '/admin/settings' : '/owner/settings';
  const isMoreActive = location.pathname === settingsPath
    || mobileMore.some((item) => location.pathname.startsWith(item.to));

  return (
    <>
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
          to={settingsPath}
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

      <>
        {moreOpen && <button className="mobile-nav-backdrop" aria-label="Close more navigation" onClick={() => setMoreOpen(false)} />}
        {moreOpen && (
          <nav className="mobile-nav-sheet" aria-label="More navigation">
            {mobileMore.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMoreOpen(false)}>
                <item.icon size={18} strokeWidth={1.75} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <NavLink to={settingsPath} onClick={() => setMoreOpen(false)}>
              <Settings size={18} strokeWidth={1.75} />
              <span>Settings</span>
            </NavLink>
          </nav>
        )}
        <nav className="mobile-nav" aria-label="Primary navigation">
          {mobilePrimary.map((item) => (
            <NavLink key={item.to} to={item.to} aria-label={item.label}>
              <item.icon size={20} strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className={moreOpen || isMoreActive ? 'active' : ''}
            aria-label="More navigation"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
          >
            <MoreHorizontal size={20} strokeWidth={1.75} />
            <span>More</span>
          </button>
        </nav>
      </>
    </>
  );
}
