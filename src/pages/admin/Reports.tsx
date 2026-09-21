import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Download, Mail } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { reportService, OrgMetric } from '../../services/reportService';
import { CountPoint } from '../../mocks/reports';

type Metric = 'revenue' | 'sessions' | 'uptime';

export function Reports() {
  const toast = useToast();
  const [metric, setMetric] = useState<Metric>('revenue');
  const [range, setRange] = useState<'7d' | '30d'>('30d');
  const [revenueByOrg, setRevenueByOrg] = useState<OrgMetric[]>([]);
  const [uptimeByOrg, setUptimeByOrg] = useState<OrgMetric[]>([]);
  const [gamesPlayed, setGamesPlayed] = useState<CountPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailWeekly, setEmailWeekly] = useState(false);

  useEffect(() => {
    Promise.all([reportService.revenueByOrganization(), reportService.uptimeByOrganization(), reportService.gamesPlayedTrend()]).then(
      ([revenue, uptime, games]) => {
        setRevenueByOrg(revenue);
        setUptimeByOrg(uptime);
        setGamesPlayed(games);
        setLoading(false);
      }
    );
  }, []);

  const days = range === '7d' ? 7 : 30;
  const slicedGames = gamesPlayed.slice(-days);

  return (
    <AppShell title="Reports">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Card style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
              Metric
            </label>
            <select value={metric} onChange={(e) => setMetric(e.target.value as Metric)} style={selectStyle}>
              <option value="revenue">Revenue by organization</option>
              <option value="sessions">Games played over time</option>
              <option value="uptime">Device uptime %</option>
            </select>
          </div>
          <div>
            <label className="label" style={{ display: 'block', marginBottom: 6 }}>
              Range
            </label>
            <select value={range} onChange={(e) => setRange(e.target.value as '7d' | '30d')} style={selectStyle}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </Card>

        {metric === 'revenue' && (
          <Card>
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Revenue by organization</h3>
            {loading ? (
              <Skeleton height={260} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByOrg} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="organizationName"
                    tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v.toLocaleString()} RWF`, 'Revenue']}
                  />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}

        {metric === 'sessions' && (
          <Card>
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Games played over time</h3>
            {loading ? (
              <Skeleton height={220} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={slicedGames} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gamesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    tickFormatter={(v: string) => v.slice(5)}
                    axisLine={{ stroke: 'var(--color-border)' }}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [v, 'Games played']}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--color-secondary)" strokeWidth={2} fill="url(#gamesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}

        {metric === 'uptime' && (
          <Card>
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Device uptime % by organization</h3>
            {loading ? (
              <Skeleton height={260} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={uptimeByOrg} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="organizationName"
                    tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`, 'Uptime']}
                  />
                  <Bar dataKey="value" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}

        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={emailWeekly} onChange={(e) => setEmailWeekly(e.target.checked)} />
            Email me this report weekly
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="outline" size="sm" onClick={() => toast.show('Report downloaded as PDF.', 'success')}>
              <Download size={14} strokeWidth={1.75} /> Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.show('Report downloaded as CSV.', 'success')}>
              <Download size={14} strokeWidth={1.75} /> Download CSV
            </Button>
            {emailWeekly && (
              <Button variant="outline" size="sm" onClick={() => toast.show('Weekly email report scheduled.', 'success')}>
                <Mail size={14} strokeWidth={1.75} /> Confirm schedule
              </Button>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontSize: 13,
  fontFamily: 'inherit',
  cursor: 'pointer',
};
