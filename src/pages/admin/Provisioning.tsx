import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, XCircle } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LocationCascadeSelect } from '../../components/ui/LocationCascadeSelect';
import { useToast } from '../../components/ui/Toast';
import { provisioningService } from '../../services/provisioningService';
import { firmwareVersions } from '../../mocks/firmware';
import { organizations } from '../../mocks/organizations';
import { Device } from '../../types';

interface CsvRow {
  serial: string;
  tableName: string;
  firmwareVersion: string;
  error?: string;
}

export function Provisioning() {
  const toast = useToast();
  const [queue, setQueue] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [serial, setSerial] = useState('');
  const [tableName, setTableName] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState(firmwareVersions[0]?.version ?? '');
  const [serialError, setSerialError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<Device | null>(null);
  const [csvRows, setCsvRows] = useState<CsvRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    provisioningService.queue().then((data) => {
      setQueue(data);
      setLoading(false);
    });
  }, []);

  const localSerials = useMemo(() => new Set(queue.map((d) => d.serial.toLowerCase())), [queue]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setSerialError(null);
    if (!serial.trim() || !tableName.trim()) return;
    if (provisioningService.isDuplicateSerial(serial) || localSerials.has(serial.trim().toLowerCase())) {
      setSerialError('A device with this serial number is already registered.');
      return;
    }
    const device = await provisioningService.register({ serial, tableName, firmwareVersion });
    setQueue((q) => [device, ...q]);
    setSerial('');
    setTableName('');
    toast.show(`${device.tableName} registered and added to the provisioning queue.`, 'success');
  };

  const handleCsvFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const dataLines = lines[0]?.toLowerCase().startsWith('serial') ? lines.slice(1) : lines;
      const seen = new Set(localSerials);
      const rows: CsvRow[] = dataLines.map((line) => {
        const [rawSerial = '', rawTable = '', rawFirmware = ''] = line.split(',').map((v) => v.trim());
        let error: string | undefined;
        if (!rawSerial || !rawTable) error = 'Missing serial or table name';
        else if (seen.has(rawSerial.toLowerCase())) error = 'Duplicate serial number';
        if (!error) seen.add(rawSerial.toLowerCase());
        return { serial: rawSerial, tableName: rawTable, firmwareVersion: rawFirmware || firmwareVersions[0]?.version, error };
      });
      setCsvRows(rows);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!csvRows) return;
    const valid = csvRows.filter((r) => !r.error);
    const registered = await Promise.all(valid.map((r) => provisioningService.register(r)));
    setQueue((q) => [...registered, ...q]);
    toast.show(`Imported ${registered.length} device${registered.length === 1 ? '' : 's'} into the provisioning queue.`, 'success');
    setCsvRows(null);
  };

  const columns: Column<Device>[] = [
    {
      key: 'tableName',
      header: 'Device',
      render: (d) => (
        <div>
          <div style={{ fontWeight: 600 }}>{d.tableName}</div>
          <div className="caption">{d.serial}</div>
        </div>
      ),
    },
    { key: 'firmware', header: 'Firmware', render: (d) => d.firmwareVersion },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} size="sm" /> },
    {
      key: 'assign',
      header: '',
      render: (d) => (
        <Button variant="outline" size="sm" onClick={() => setAssigning(d)}>
          Assign to organization
        </Button>
      ),
    },
  ];

  return (
    <AppShell title="Manufacturing">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Card>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Register new device</h3>
          <form onSubmit={handleRegister} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ minWidth: 180 }}>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                Serial number
              </label>
              <input value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="APV-2500" style={inputStyle} />
            </div>
            <div style={{ minWidth: 160 }}>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                Table name
              </label>
              <input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="Table 5" style={inputStyle} />
            </div>
            <div style={{ minWidth: 140 }}>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                Firmware version
              </label>
              <select value={firmwareVersion} onChange={(e) => setFirmwareVersion(e.target.value)} style={inputStyle}>
                {firmwareVersions.map((f) => (
                  <option key={f.id} value={f.version}>
                    {f.version}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: 220 }}>
              <label className="label" style={{ display: 'block', marginBottom: 6 }}>
                Device UUID (generated)
              </label>
              <div className="caption" style={{ padding: '8px 0' }}>
                Assigned automatically on registration
              </div>
            </div>
            <Button type="submit" variant="primary" size="sm">
              Register device
            </Button>
          </form>
          {serialError && (
            <div style={{ marginTop: 'var(--space-3)', color: 'var(--color-danger)', fontSize: 13 }}>{serialError}</div>
          )}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <div>
              <h3>Batch import</h3>
              <div className="text-secondary" style={{ fontSize: 13 }}>
                CSV columns: serial, tableName, firmwareVersion
              </div>
            </div>
            <>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvFile} style={{ display: 'none' }} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={14} strokeWidth={1.75} /> Choose CSV file
              </Button>
            </>
          </div>

          {csvRows && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto' }}>
                {csvRows.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      background: row.error ? 'var(--color-danger-tint)' : 'var(--color-surface-sunken)',
                      fontSize: 13,
                    }}
                  >
                    {row.error ? (
                      <XCircle size={14} strokeWidth={1.75} color="var(--color-danger)" />
                    ) : (
                      <CheckCircle2 size={14} strokeWidth={1.75} color="var(--color-success)" />
                    )}
                    <span style={{ fontWeight: 600 }}>{row.serial || '(missing serial)'}</span>
                    <span className="text-secondary">{row.tableName}</span>
                    {row.error && <span style={{ color: 'var(--color-danger)', marginLeft: 'auto' }}>{row.error}</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <Button variant="outline" size="sm" onClick={() => setCsvRows(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={csvRows.every((r) => r.error)}
                  onClick={confirmImport}
                >
                  Confirm import ({csvRows.filter((r) => !r.error).length})
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card padding={0}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
            <h3>Provisioning queue</h3>
          </div>
          <DataTable
            columns={columns}
            rows={queue}
            rowKey={(d) => d.id}
            loading={loading}
            emptyTitle="No devices awaiting assignment"
            emptyMessage="Register a device above or import a batch to fill the queue."
          />
        </Card>
      </div>

      {assigning && (
        <AssignModal
          device={assigning}
          onClose={() => setAssigning(null)}
          onConfirm={async (orgId) => {
            await provisioningService.assign(assigning.id, orgId);
            setQueue((q) => q.filter((d) => d.id !== assigning.id));
            setAssigning(null);
            toast.show(`${assigning.tableName} moved to the fleet.`, 'success');
          }}
        />
      )}
    </AppShell>
  );
}

function AssignModal({
  device,
  onClose,
  onConfirm,
}: {
  device: Device;
  onClose: () => void;
  onConfirm: (organizationId: string) => void;
}) {
  const [orgId, setOrgId] = useState('');
  const [geo, setGeo] = useState<{ province?: string; district?: string; sector?: string }>({});

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(20, 22, 26, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 'var(--space-4)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 420, padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        <h3>Assign {device.tableName}</h3>
        <div>
          <label className="label" style={{ display: 'block', marginBottom: 6 }}>
            Organization
          </label>
          <select value={orgId} onChange={(e) => setOrgId(e.target.value)} style={inputStyle}>
            <option value="">Select an organization…</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" style={{ display: 'block', marginBottom: 6 }}>
            Location
          </label>
          <LocationCascadeSelect value={geo} onChange={setGeo} size="sm" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" disabled={!orgId} onClick={() => onConfirm(orgId)}>
            Confirm assignment
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  fontFamily: 'inherit',
  fontSize: 14,
};
