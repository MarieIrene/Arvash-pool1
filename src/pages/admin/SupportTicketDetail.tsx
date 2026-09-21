import { FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { PaymentReconciliationCard } from '../../components/ui/PaymentReconciliationCard';
import { useToast } from '../../components/ui/Toast';
import { ticketService } from '../../services/ticketService';
import { getTransactionById } from '../../mocks/transactions';
import { Ticket, TicketStatus } from '../../types';

const TYPE_LABEL: Record<Ticket['type'], string> = {
  payment_mismatch: 'Payment mismatch',
  voucher_issue: 'Voucher issue',
  hardware_fault: 'Hardware fault',
};

export function SupportTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ticketService.get(id).then((data) => {
      setTicket(data ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell title="Ticket details">
        <Skeleton height={220} />
      </AppShell>
    );
  }

  if (!ticket) {
    return (
      <AppShell title="Ticket details">
        <Card>
          <EmptyState title="Ticket not found" message="This ticket may have been resolved and archived." />
        </Card>
      </AppShell>
    );
  }

  const setStatus = (status: TicketStatus) => {
    setTicket((t) => (t ? { ...t, status } : t));
    toast.show(`Ticket marked as ${status.toLowerCase()}.`, status === 'RESOLVED' ? 'success' : 'info');
  };

  const addNote = (e: FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setTicket((t) =>
      t
        ? {
            ...t,
            notes: [
              ...t.notes,
              { id: `note-local-${Date.now()}`, author: 'You', text: noteText.trim(), timestamp: new Date().toISOString() },
            ],
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    setNoteText('');
  };

  const linkedTransaction = ticket.paymentId ? getTransactionById(ticket.paymentId) : undefined;

  return (
    <AppShell title={ticket.subject}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)' }}>
          <Link to="/admin/support" style={{ color: 'var(--color-text-muted)' }}>
            Support
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--color-text-primary)' }}>{ticket.subject}</span>
        </div>

        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: 20 }}>{ticket.subject}</h2>
              <StatusBadge status={ticket.status} />
            </div>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              {TYPE_LABEL[ticket.type]} ·{' '}
              <Link to={`/admin/organizations/${ticket.organizationId}`}>{ticket.organizationName}</Link>
              {ticket.deviceId && (
                <>
                  {' '}
                  · <Link to={`/admin/devices/${ticket.deviceId}`}>{ticket.deviceName}</Link>
                </>
              )}
            </div>
            <div className="caption" style={{ marginTop: 4 }}>
              Opened {new Date(ticket.createdAt).toLocaleString()} · Updated {new Date(ticket.updatedAt).toLocaleString()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {ticket.status !== 'INVESTIGATING' && (
              <Button variant="outline" size="sm" onClick={() => setStatus('INVESTIGATING')}>
                Escalate
              </Button>
            )}
            {ticket.status !== 'RESOLVED' && (
              <Button variant="primary" size="sm" onClick={() => setStatus('RESOLVED')}>
                Mark resolved
              </Button>
            )}
          </div>
        </Card>

        {ticket.type === 'payment_mismatch' && linkedTransaction && (
          <PaymentReconciliationCard
            transaction={linkedTransaction}
            title="Payment reconciliation"
            onViewDevice={ticket.deviceId ? () => navigate(`/admin/devices/${ticket.deviceId}`) : undefined}
          />
        )}

        <Card>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Timeline &amp; notes</h3>
          {ticket.notes.length === 0 ? (
            <EmptyState title="No notes yet" message="Add the first internal note below." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              {ticket.notes.map((note) => (
                <div key={note.id} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-surface-sunken)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare size={14} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {note.author} <span className="caption" style={{ fontWeight: 400 }}>· {new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-secondary" style={{ fontSize: 14 }}>
                      {note.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={addNote} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add an internal note…"
              rows={3}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontFamily: 'inherit',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="outline" size="sm" disabled={!noteText.trim()}>
                Add note
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
