import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          background: 'var(--color-bg)',
          padding: 'var(--space-5)',
          textAlign: 'center',
        }}
      >
        <ShieldAlert size={32} strokeWidth={1.5} color="var(--color-danger)" />
        <h2 style={{ fontSize: 20 }}>You don't have access to this organization</h2>
        <p className="text-secondary" style={{ maxWidth: 360, fontSize: 14 }}>
          This page is only available to {role === 'SUPERADMIN' ? 'platform administrators' : 'pool owners'}. Contact
          your admin if you think this is a mistake.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
