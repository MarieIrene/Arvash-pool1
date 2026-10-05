import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Activity as ActivityIcon,
  Building2,
  CircleHelp,
  Command,
  Cpu,
  CreditCard,
  MapPin,
  MonitorSmartphone,
  Search,
  Ticket as TicketIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { platformActivity } from '../../mocks/activity';
import { devices } from '../../mocks/devices';
import { firmwareVersions } from '../../mocks/firmware';
import { organizations } from '../../mocks/organizations';
import { tickets } from '../../mocks/tickets';
import { transactions } from '../../mocks/transactions';
import { vouchers } from '../../mocks/vouchers';

type SearchCategory = 'All' | 'Features' | 'Devices' | 'Payments' | 'Organizations' | 'Support' | 'Locations' | 'Vouchers' | 'Firmware' | 'Activity';
interface SearchResult {
  id: string;
  category: Exclude<SearchCategory, 'All'>;
  title: string;
  detail: string;
  searchable: string;
  to: string;
}

const CATEGORIES: SearchCategory[] = ['All', 'Features', 'Devices', 'Payments', 'Organizations', 'Support', 'Locations', 'Vouchers', 'Firmware', 'Activity'];
const PAGES = [
  { title: 'Dashboard', detail: 'Fleet overview and activity', admin: '/admin/dashboard', owner: '/owner/dashboard' },
  { title: 'Devices', detail: 'Monitor tables and device health', admin: '/admin/devices', owner: '/owner/devices' },
  { title: 'Transactions', detail: 'Review payments and reconciliation', admin: '/admin/transactions', owner: '/owner/transactions' },
  { title: 'Organizations', detail: 'Manage pool operators', admin: '/admin/organizations' },
  { title: 'Payments', detail: 'Payment reconciliation', admin: '/admin/payments' },
  { title: 'Reports', detail: 'Revenue and fleet reports', admin: '/admin/reports' },
  { title: 'Support', detail: 'Support tickets and issue queue', admin: '/admin/support' },
  { title: 'Live locations', detail: 'View connected locations', owner: '/owner/locations' },
  { title: 'Revenue', detail: 'Revenue performance', owner: '/owner/revenue' },
  { title: 'Settings', detail: 'Profile and preferences', admin: '/admin/settings', owner: '/owner/settings' },
];
const FEATURES = [
  { title: 'Device search and filters', detail: 'Find devices by name, status, organization, and location', admin: '/admin/devices#device-filters', owner: '/owner/devices#device-filters' },
  { title: 'Transaction search and filters', detail: 'Find payments by organization, table, phone, status, or provider', admin: '/admin/transactions#transaction-filters', owner: '/owner/transactions#transaction-filters' },
  { title: 'Review stuck payments', detail: 'Reconcile successful payments with no recorded device session', admin: '/admin/transactions#stuck-payments', owner: '/owner/transactions#stuck-payments' },
  { title: 'Filter organizations', detail: 'Search organizations by name, device health, or region', admin: '/admin/organizations#organization-filters' },
  { title: 'Onboard a new owner', detail: 'Open the owner onboarding action', admin: '/admin/organizations#onboard-owner' },
  { title: 'Register a device', detail: 'Add a device serial number and table name to the provisioning queue', admin: '/admin/provisioning#register-device' },
  { title: 'Import devices from CSV', detail: 'Batch register pool tables from a CSV file', admin: '/admin/provisioning#device-batch-import' },
  { title: 'Choose firmware rollout targets', detail: 'Select a device, organization, or fleet for a firmware update', admin: '/admin/flasher#firmware-rollout' },
  { title: 'Filter support tickets', detail: 'Narrow the support queue by type, status, or organization', admin: '/admin/support#support-filters' },
  { title: 'Export platform reports', detail: 'Download reports as PDF or CSV', admin: '/admin/reports#report-exports' },
];

export function GlobalSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('All');
  const isAdmin = user?.role === 'SUPERADMIN';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else {
      setQuery('');
      setCategory('All');
    }
  }, [open]);

  const matchingRecords = useMemo(() => {
    const ownerOrgId = user?.organizationId;
    const scopedDevices = devices.filter((device) => isAdmin || device.organizationId === ownerOrgId);
    const scopedDeviceIds = new Set(scopedDevices.map((device) => device.id));
    const records: SearchResult[] = [
      ...scopedDevices.map((device) => ({
          id: device.id,
          category: 'Devices' as const,
          title: `${device.tableName} · ${device.organizationName}`,
          detail: `${device.status} · ${device.serial} · ${device.locationName}`,
          searchable: Object.values(device).join(' '),
          to: `${isAdmin ? '/admin' : '/owner'}/devices/${device.id}`,
        })),
      ...Array.from(new Map(scopedDevices.map((device) => [device.locationId, device])).values()).map((device) => ({
        id: device.locationId,
        category: 'Locations' as const,
        title: device.locationName,
        detail: `${device.district}, ${device.sector} · ${device.organizationName}`,
        searchable: `${device.locationName} ${device.district} ${device.sector} ${device.province} ${device.organizationName}`,
        to: isAdmin ? `/admin/organizations/${device.organizationId}` : '/owner/locations',
      })),
      ...transactions
        .filter((transaction) => isAdmin || transaction.organizationId === ownerOrgId)
        .map((transaction) => ({
          id: transaction.id,
          category: 'Payments' as const,
          title: `${transaction.referenceNumber} · ${transaction.amount.toLocaleString()} RWF`,
          detail: `${transaction.organizationName} · ${transaction.tableName} · ${transaction.status}`,
          searchable: Object.values(transaction).join(' '),
          to: isAdmin ? '/admin/transactions' : '/owner/transactions',
        })),
      ...vouchers
        .filter((voucher) => scopedDeviceIds.has(voucher.deviceId))
        .map((voucher) => ({
          id: voucher.code,
          category: 'Vouchers' as const,
          title: voucher.code,
          detail: `${voucher.deviceName} · ${voucher.redeemed ? 'Redeemed' : 'Unused'}`,
          searchable: Object.values(voucher).join(' '),
          to: `${isAdmin ? '/admin' : '/owner'}/devices/${voucher.deviceId}`,
        })),
      ...platformActivity
        .filter((item) => isAdmin || (item.deviceId ? scopedDeviceIds.has(item.deviceId) : false))
        .map((item) => ({
          id: item.id,
          category: 'Activity' as const,
          title: item.message,
          detail: `${item.severity} · ${new Date(item.timestamp).toLocaleString()}`,
          searchable: Object.values(item).join(' '),
          to: item.deviceId ? `${isAdmin ? '/admin' : '/owner'}/devices/${item.deviceId}` : isAdmin ? '/admin/dashboard' : '/owner/dashboard',
        })),
      ...(isAdmin
        ? organizations.map((organization) => ({
            id: organization.id,
            category: 'Organizations' as const,
            title: organization.name,
            detail: `${organization.ownerName} · ${organization.region} · ${organization.status}`,
            searchable: Object.values(organization).join(' '),
            to: `/admin/organizations/${organization.id}`,
          }))
        : []),
      ...(isAdmin
        ? tickets.map((ticket) => ({
            id: ticket.id,
            category: 'Support' as const,
            title: ticket.subject,
            detail: `${ticket.organizationName} · ${ticket.status}`,
            searchable: `${ticket.subject} ${ticket.status} ${ticket.type} ${ticket.organizationName} ${ticket.deviceName ?? ''} ${ticket.id}`,
            to: `/admin/support/${ticket.id}`,
          }))
        : []),
      ...(isAdmin
        ? firmwareVersions.map((firmware) => ({
            id: firmware.id,
            category: 'Firmware' as const,
            title: `Version ${firmware.version}`,
            detail: `${firmware.rolloutPercent}% rollout · ${firmware.compatibleModels.join(', ')}`,
            searchable: Object.values(firmware).join(' '),
            to: '/admin/flasher',
          }))
        : []),
      ...FEATURES.flatMap((feature) => {
        const to = isAdmin ? feature.admin : feature.owner;
        return to ? [{
          id: to,
          category: 'Features' as const,
          title: feature.title,
          detail: feature.detail,
          searchable: `${feature.title} ${feature.detail}`,
          to,
        }] : [];
      }),
    ];
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return records.filter((result) => {
      const text = `${result.title} ${result.detail} ${result.searchable}`.toLocaleLowerCase();
      return terms.every((term) => text.includes(term));
    });
  }, [isAdmin, query, user?.organizationId]);

  const results = useMemo(
    () => matchingRecords.filter((result) => (category === 'All' && (query.trim() || result.category !== 'Features')) || result.category === category),
    [category, matchingRecords, query]
  );

  const pageResults = useMemo(
    () => PAGES.flatMap((page) => {
      const to = isAdmin ? page.admin : page.owner;
      if (!to) return [];
      return [{ ...page, to }].filter((item) => {
        const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        return category === 'All' && terms.every((term) => `${item.title} ${item.detail}`.toLocaleLowerCase().includes(term));
      });
    }),
    [category, isAdmin, query]
  );

  const counts = useMemo(() => {
    const categoryCounts = new Map<SearchCategory, number>([['All', matchingRecords.length + pageResults.length]]);
    for (const item of matchingRecords) categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
    return categoryCounts;
  }, [matchingRecords, pageResults.length]);

  const openResult = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <>
      <button type="button" className="global-search-trigger" onClick={() => setOpen(true)} aria-label="Search Arvash Pool">
        <Search size={16} strokeWidth={1.75} />
        <span>Search</span>
        <kbd><Command size={11} /> K</kbd>
      </button>

      {open && (
        <div className="global-search-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="global-search-panel" role="dialog" aria-modal="true" aria-label="Search Arvash Pool">
            <div className="global-search-input-wrap">
              <Search size={19} strokeWidth={1.75} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search devices, payments, organizations..."
                aria-label="Search all records"
              />
              <button type="button" className="global-search-close" onClick={() => setOpen(false)} aria-label="Close search">
                <X size={18} />
              </button>
            </div>

            <div className="global-search-filters" aria-label="Filter search results">
              {CATEGORIES.map((item) => {
                const available = item === 'All' || item === 'Features' || isAdmin || ['Devices', 'Payments', 'Locations', 'Vouchers', 'Activity'].includes(item);
                if (!available) return null;
                return (
                  <button
                    key={item}
                    type="button"
                    className={category === item ? 'active' : ''}
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                  >
                    {item}<span>{counts.get(item) ?? 0}</span>
                  </button>
                );
              })}
            </div>

            <div className="global-search-results" aria-live="polite">
              {!query.trim() && category === 'All' && (
                <div className="global-search-section">
                  <div className="global-search-heading">Go to</div>
                  {pageResults.map((page) => (
                    <button key={page.to} type="button" className="global-search-result" onClick={() => openResult(page.to)}>
                      <span className="global-search-result-icon"><ArrowRight size={16} /></span>
                      <span className="global-search-result-copy"><strong>{page.title}</strong><small>{page.detail}</small></span>
                      <ArrowRight className="global-search-result-arrow" size={15} />
                    </button>
                  ))}
                </div>
              )}
              {query.trim() && category === 'All' && pageResults.length > 0 && (
                <div className="global-search-section">
                  <div className="global-search-heading">Pages</div>
                  {pageResults.map((page) => (
                    <button key={page.to} type="button" className="global-search-result" onClick={() => openResult(page.to)}>
                      <span className="global-search-result-icon"><ArrowRight size={16} /></span>
                      <span className="global-search-result-copy"><strong>{page.title}</strong><small>{page.detail}</small></span>
                      <ArrowRight className="global-search-result-arrow" size={15} />
                    </button>
                  ))}
                </div>
              )}
              {results.length > 0 && (
                <div className="global-search-section">
                  <div className="global-search-heading">{category === 'Features' ? 'Page features' : query.trim() ? 'Matching records' : 'Recent records'}</div>
                  {results.slice(0, 30).map((result) => {
                    const Icon = result.category === 'Devices' ? MonitorSmartphone
                      : result.category === 'Payments' ? CreditCard
                        : result.category === 'Organizations' ? Building2 : CircleHelp;
                    const ResultIcon = result.category === 'Locations' ? MapPin
                      : result.category === 'Vouchers' ? TicketIcon
                        : result.category === 'Firmware' ? Cpu
                          : result.category === 'Activity' ? ActivityIcon : Icon;
                    return (
                      <button key={`${result.category}-${result.id}`} type="button" className="global-search-result" onClick={() => openResult(result.to)}>
                        <span className="global-search-result-icon"><ResultIcon size={16} /></span>
                        <span className="global-search-result-copy"><strong>{result.title}</strong><small>{result.category} · {result.detail}</small></span>
                        <ArrowRight className="global-search-result-arrow" size={15} />
                      </button>
                    );
                  })}
                  {results.length > 30 && <div className="global-search-more">Showing 30 of {results.length} matches. Refine your search to narrow results.</div>}
                </div>
              )}
              {query.trim() && results.length === 0 && pageResults.length === 0 && (
                <div className="global-search-empty">
                  <Search size={21} />
                  <strong>No matches found</strong>
                  <span>Try another name, ID, phone number, status, or category.</span>
                </div>
              )}
            </div>
            <div className="global-search-footer"><span><kbd>Esc</kbd> close</span><span>Search across your Arvash Pool workspace</span></div>
          </section>
        </div>
      )}
    </>
  );
}
