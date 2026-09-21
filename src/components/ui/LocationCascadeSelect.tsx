import { RWANDA_GEO } from '../../mocks/geo';

interface LocationValue {
  province?: string;
  district?: string;
  sector?: string;
}

interface LocationCascadeSelectProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  size?: 'sm' | 'md';
}

const selectStyle = (size: 'sm' | 'md'): React.CSSProperties => ({
  padding: size === 'sm' ? '5px 8px' : '8px 10px',
  fontSize: size === 'sm' ? 13 : 14,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontFamily: 'inherit',
  cursor: 'pointer',
});

export function LocationCascadeSelect({ value, onChange, size = 'md' }: LocationCascadeSelectProps) {
  const provinceNode = RWANDA_GEO.find((p) => p.name === value.province);
  const districtNode = provinceNode?.districts.find((d) => d.name === value.district);

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      <select
        style={selectStyle(size)}
        value={value.province ?? ''}
        onChange={(e) => onChange({ province: e.target.value || undefined })}
      >
        <option value="">All provinces</option>
        {RWANDA_GEO.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        style={selectStyle(size)}
        value={value.district ?? ''}
        disabled={!provinceNode}
        onChange={(e) => onChange({ ...value, district: e.target.value || undefined, sector: undefined })}
      >
        <option value="">All districts</option>
        {provinceNode?.districts.map((d) => (
          <option key={d.name} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>
      <select
        style={selectStyle(size)}
        value={value.sector ?? ''}
        disabled={!districtNode}
        onChange={(e) => onChange({ ...value, sector: e.target.value || undefined })}
      >
        <option value="">All sectors</option>
        {districtNode?.sectors.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
