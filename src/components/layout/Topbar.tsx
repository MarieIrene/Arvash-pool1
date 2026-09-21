import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
import { organizations } from '../../mocks/organizations';
import { platformActivity } from '../../mocks/activity';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const navigate = useNavigate();
  const [orgOpen, setOrgOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(organizations[0].name);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const alerts = platformActivity.filter((a) => a.severity === 'danger' || a.severity === 'warning').slice(0, 5);

  return (
    <header
      className="app-topbar"
      style={{
        height: 64,
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-5)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="app-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 20 }}>{title}</h2>
      </div>

      <div className="app-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {user?.role === 'SUPERADMIN' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOrgOpen((o) => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              {selectedOrg}
              <ChevronDown size={14} strokeWidth={1.75} />
            </button>
            {orgOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: 220,
                  padding: 6,
                  zIndex: 30,
                  maxHeight: 280,
                  overflowY: 'auto',
                }}
              >
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setSelectedOrg(org.name);
                      setOrgOpen(false);
                      navigate(`/admin/organizations/${org.id}`);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: 'transparent',
                      fontSize: 13,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-sunken)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {org.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
          }}
        >
          {mode === 'light' ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              position: 'relative',
            }}
          >
            <Bell size={16} strokeWidth={1.75} />
            {alerts.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  width: 8,
                  height: 8,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-danger)',
                  border: '2px solid var(--color-surface)',
                }}
              />
            )}
          </button>
          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                width: 320,
                padding: 6,
                zIndex: 30,
              }}
            >
              <div className="label" style={{ padding: '6px 10px' }}>
                Needs attention
              </div>
              {alerts.length === 0 && (
                <div style={{ padding: '10px', fontSize: 13, color: 'var(--color-text-muted)' }}>All clear.</div>
              )}
              {alerts.map((a) => (
                <div key={a.id} style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                  <div style={{ color: 'var(--color-text-primary)' }}>{a.message}</div>
                  <div className="caption">{new Date(a.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 2,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-secondary-tint)',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {user?.avatarInitials}
            </div>
          </button>
          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                minWidth: 200,
                padding: 6,
                zIndex: 30,
              }}
            >
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                <div className="caption">{user?.email}</div>
              </div>
              <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
              <button
                onClick={() => navigate(user?.role === 'SUPERADMIN' ? '/admin/settings' : '/owner/settings')}
                style={menuBtnStyle}
              >
                <UserIcon size={14} strokeWidth={1.75} /> Profile &amp; settings
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setLogoutOpen(true);
                }}
                style={{ ...menuBtnStyle, color: 'var(--color-danger)' }}
              >
                <LogOut size={14} strokeWidth={1.75} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Log out of Arvash Pool?"
        description="You'll need to log in again to access your dashboard."
        confirmLabel="Log out"
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
          navigate('/login');
        }}
      />
    </header>
  );
}

const menuBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  textAlign: 'left',
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'transparent',
  fontSize: 13,
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
