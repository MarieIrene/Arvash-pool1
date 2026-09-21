import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { RevenuePoint } from '../../types';

interface TrendChartProps {
  data: RevenuePoint[];
  currency?: string;
}

type Range = '7d' | '30d';

export function TrendChart({ data, currency = 'RWF' }: TrendChartProps) {
  const [range, setRange] = useState<Range>('30d');

  const sliced = useMemo(() => {
    const days = range === '7d' ? 7 : 30;
    return data.slice(-days);
  }, [data, range]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginBottom: 'var(--space-3)' }}>
        {(['7d', '30d'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: range === r ? 'var(--color-primary-tint)' : 'var(--color-surface)',
              color: range === r ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {r === '7d' ? 'Last 7 days' : 'Last 30 days'}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={sliced} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
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
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v.toLocaleString()} ${currency}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
