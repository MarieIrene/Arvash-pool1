import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { firmwareService } from '../../services/firmwareService';
import { deviceService } from '../../services/deviceService';
import { organizations } from '../../mocks/organizations';
import { Device, DeviceStatus, FirmwareVersion } from '../../types';

type TargetMode = 'single' | 'org' | 'fleet';
type FlashStatus = 'QUEUED' | 'FLASHING' | 'SUCCESS' | 'FAILED';
interface FlashJob {
  deviceId: string;
  tableName: string;
  status: FlashStatus;
}

const FLASHABLE_STATUSES: DeviceStatus[] = ['ONLINE', 'OFFLINE', 'ERROR'];

export function Flasher() {
  const toast = useToast();
  const [versions, setVersions] = useState<FirmwareVersion[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'targets' | 'firmware' | 'confirm' | 'progress'>('targets');
  const [mode, setMode] = useState<TargetMode>('single');
  const [singleId, setSingleId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [selectedFirmware, setSelectedFirmware] = useState('');
  const [jobs, setJobs] = useState<FlashJob[]>([]);

  useEffect(() => {
    Promise.all([firmwareService.list(), deviceService.list()]).then(([fw, d]) => {
      setVersions(fw);
      setDevices(d.filter((dev) => FLASHABLE_STATUSES.includes(dev.status)));
      setSelectedFirmware(fw[0]?.version ?? '');
      setLoading(false);
    });
  }, []);

  const targets: Device[] = useMemo(() => {
    if (mode === 'fleet') return devices;
    if (mode === 'org') return devices.filter((d) => d.organizationId === orgId);
    return devices.filter((d) => d.id === singleId);
  }, [mode, devices, orgId, singleId]);

  const startFlash = () => {
    const initialJobs: FlashJob[] = targets.map((d) => ({ deviceId: d.id, tableName: d.tableName, status: 'QUEUED' }));
    setJobs(initialJobs);
    setStep('progress');

    initialJobs.forEach((job, i) => {
      setTimeout(() => {
        setJobs((prev) => prev.map((j) => (j.deviceId === job.deviceId ? { ...j, status: 'FLASHING' } : j)));
      }, 300 + i * 180);
      setTimeout(() => {
        const succeeded = Math.random() > 0.12;
        setJobs((prev) => prev.map((j) => (j.deviceId === job.deviceId ? { ...j, status: succeeded ? 'SUCCESS' : 'FAILED' } : j)));
      }, 1200 + i * 180);
    });
  };

  const retry = (deviceId: string) => {
    setJobs((prev) => prev.map((j) => (j.deviceId === deviceId ? { ...j, status: 'FLASHING' } : j)));
    setTimeout(() => {
      setJobs((prev) => prev.map((j) => (j.deviceId === deviceId ? { ...j, status: Math.random() > 0.25 ? 'SUCCESS' : 'FAILED' } : j)));
    }, 900);
  };

  const reset = () => {
    setStep('targets');
    setMode('single');
    setSingleId('');
    setOrgId('');
    setJobs([]);
  };

  const jobColumns: Column<FlashJob>[] = [
    { key: 'device', header: 'Device', render: (j) => j.tableName },
    { key: 'status', header: 'Status', render: (j) => <StatusBadge status={j.status} size="sm" /> },
    {
      key: 'retry',
      header: '',
      render: (j) =>
        j.status === 'FAILED' ? (
          <Button variant="outline" size="sm" onClick={() => retry(j.deviceId)}>
            <RotateCw size={13} strokeWidth={1.75} /> Retry
          </Button>
        ) : null,
    },
  ];

  return (
    <AppShell title="Flasher">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Card padding={0}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
            <h3>Firmware versions</h3>
          </div>
          {loading ? (
            <div style={{ padding: 'var(--space-5)' }}>
              <Skeleton height={80} />
            </div>
          ) : (
            versions.map((v) => (
              <div key={v.id} style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600 }}>
                    v{v.version} <span className="caption">· {v.compatibleModels.join(', ')}</span>
                  </div>
                  <span className="caption">{v.rolloutPercent}% rolled out</span>
                </div>
                <div className="text-secondary" style={{ fontSize: 13, marginBottom: 8 }}>
                  {v.releaseNotes}
                </div>
                <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-sunken)', overflow: 'hidden' }}>
                  <div style={{ width: `${v.rolloutPercent}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Flash devices</h3>

          {step === 'targets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(['single', 'org', 'fleet'] as TargetMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: mode === m ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                      color: mode === m ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {m === 'single' ? 'Single device' : m === 'org' ? 'By organization' : 'Fleet-wide'}
                  </button>
                ))}
              </div>

              {mode === 'single' && (
                <select value={singleId} onChange={(e) => setSingleId(e.target.value)} style={selectStyle}>
                  <option value="">Select a device…</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.tableName} · {d.organizationName}
                    </option>
                  ))}
                </select>
              )}
              {mode === 'org' && (
                <select value={orgId} onChange={(e) => setOrgId(e.target.value)} style={selectStyle}>
                  <option value="">Select an organization…</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="text-secondary" style={{ fontSize: 13 }}>
                {targets.length} device{targets.length === 1 ? '' : 's'} selected
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" size="sm" disabled={targets.length === 0} onClick={() => setStep('firmware')}>
                  Next: choose firmware
                </Button>
              </div>
            </div>
          )}

          {step === 'firmware' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <select value={selectedFirmware} onChange={(e) => setSelectedFirmware(e.target.value)} style={selectStyle}>
                {versions.map((v) => (
                  <option key={v.id} value={v.version}>
                    v{v.version}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outline" size="sm" onClick={() => setStep('targets')}>
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={() => setStep('confirm')}>
                  Next: review
                </Button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-warning-tint)',
                  border: '1px solid var(--color-warning)',
                }}
              >
                <AlertTriangle size={20} strokeWidth={1.75} color="var(--color-warning)" />
                <div style={{ fontSize: 14 }}>
                  This will flash firmware v{selectedFirmware} to <strong>{targets.length}</strong> device
                  {targets.length === 1 ? '' : 's'}, each offline for roughly 3 minutes during the update.
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outline" size="sm" onClick={() => setStep('firmware')}>
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={startFlash}>
                  Start flash
                </Button>
              </div>
            </div>
          )}

          {step === 'progress' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <DataTable columns={jobColumns} rows={jobs} rowKey={(j) => j.deviceId} pageSize={20} />
              {jobs.length > 0 && jobs.every((j) => j.status === 'SUCCESS' || j.status === 'FAILED') && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.show('Flash job complete.', 'success');
                      reset();
                    }}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          )}
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
