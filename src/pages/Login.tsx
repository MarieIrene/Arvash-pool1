import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CircleDot, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { authService, DEMO_ACCOUNTS } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const DEMO_PASSWORD = 'demo1234';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoSelection, setDemoSelection] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoSelect = (selectedEmail: string) => {
    setDemoSelection(selectedEmail);
    if (!selectedEmail) return;
    setEmail(selectedEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    const result = await authService.login(email, password);
    setLoading(false);

    if (!result.ok || !result.user) {
      setError(result.error ?? 'Something went wrong. Try again.');
      return;
    }

    login(result.user);
    navigate(result.user.role === 'SUPERADMIN' ? '/admin/dashboard' : '/owner/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: 'var(--space-5)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginBottom: 'var(--space-3)',
            }}
          >
            <CircleDot size={24} strokeWidth={1.75} />
          </div>
          <h1 style={{ fontSize: 24 }}>Arvash Pool</h1>
          <p className="text-secondary" style={{ fontSize: 14, marginTop: 4 }}>
            Fleet management console
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setDemoSelection('');
              }}
              placeholder="you@arvashpool.rw"
              style={inputStyle}
              autoComplete="username"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12 }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setDemoSelection('');
                }}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 36 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
              Log in as (demo)
            </label>
            <select
              value={demoSelection}
              onChange={(e) => handleDemoSelect(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Select a demo account…</option>
              {DEMO_ACCOUNTS.map((account) => (
                <option key={account.email} value={account.email}>
                  {account.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--color-danger-tint)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '10px 16px' }}>
            {loading ? 'Signing in…' : 'Log in'}
          </Button>

          <div className="caption" style={{ textAlign: 'center' }}>
            Pick a demo account above to auto-fill, or use any email/password (4+ chars).
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontFamily: 'inherit',
  fontSize: 14,
};
