import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleDot, MailCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

type Step = 'email' | 'sent' | 'reset';

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = [
  'var(--color-danger)',
  'var(--color-danger)',
  'var(--color-warning)',
  'var(--color-success)',
  'var(--color-success)',
];

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const strength = passwordStrength(password);

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStep('sent');
  };

  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 4 || password !== confirm) return;
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-5)' }}>
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
          <h1 style={{ fontSize: 24 }}>Reset your password</h1>
        </div>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p className="text-secondary" style={{ fontSize: 14 }}>
                Enter the email on your account and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@arvashpool.rw"
                  style={inputStyle}
                  autoComplete="username"
                />
              </div>
              <Button type="submit" variant="primary" style={{ width: '100%', padding: '10px 16px' }}>
                Send reset link
              </Button>
              <Link to="/login" style={{ textAlign: 'center', fontSize: 13 }}>
                Back to log in
              </Link>
            </form>
          )}

          {step === 'sent' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-success-tint)',
                  color: 'var(--color-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MailCheck size={22} strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: 16 }}>Check your email</h3>
              <p className="text-secondary" style={{ fontSize: 14 }}>
                We've sent password reset instructions to <strong>{email}</strong>.
              </p>
              <Button variant="outline" size="sm" onClick={() => setStep('reset')} style={{ marginTop: 'var(--space-2)' }}>
                I have a reset link — continue
              </Button>
            </div>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  autoComplete="new-password"
                />
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: 4,
                        flex: 1,
                        borderRadius: 'var(--radius-full)',
                        background: i < strength ? STRENGTH_COLOR[strength] : 'var(--color-surface-sunken)',
                      }}
                    />
                  ))}
                </div>
                {password.length > 0 && <div className="caption" style={{ marginTop: 4 }}>{STRENGTH_LABEL[strength]}</div>}
              </div>
              <div>
                <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" variant="primary" disabled={password.length < 4 || password !== confirm} style={{ width: '100%', padding: '10px 16px' }}>
                Set new password
              </Button>
            </form>
          )}
        </div>
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
