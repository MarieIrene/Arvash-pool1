import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ segments, centerLabel, centerValue }: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={76}
              paddingAngle={total > 0 ? 3 : 0}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {segments.map((seg, i) => (
                <Cell key={i} fill={seg.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)' }}>{centerValue}</span>
          <span className="caption">{centerLabel}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: seg.color }} />
            <span className="text-secondary" style={{ minWidth: 64 }}>
              {seg.label}
            </span>
            <span style={{ fontWeight: 600 }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
