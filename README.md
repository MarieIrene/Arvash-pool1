# Arvash Pool — Fleet Management Dashboard

A React + TypeScript UI for Arvash Pool's IoT pool-table fleet, built to the
supplied design system (light/dark themes, Inter type scale, muted low-glare
palette) and the product brief in `arvash-pool-frontend-analysis`.

## Getting started

```bash
npm install
npm run dev       # start the dev server (Vite)
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build
```

Open the dev server URL, then log in with one of the demo accounts (any
password with 4+ characters):

- `admin@arvashpool.rw` — Platform Administrator
- `owner@arvashpool.rw` — Pool Owner

## What's built

Six screens, all wired to mock data:

1. **Login** — email/password, inline validation, forgot-password link, role
   resolved server-side (no role picker).
2. **Platform Admin Dashboard** — KPI strip, fleet health donut, revenue
   trend (7d/30d toggle), top organizations, recent activity feed.
3. **Devices (fleet-wide)** — filterable/sortable table: organization,
   cascading Province→District→Sector, status, firmware, search; bulk
   select; always-visible status legend.
4. **Device Details** — offline/error banner with likely-cause hint, vitals
   row (battery/signal/firmware/last-seen), tabs for Events / Sessions /
   Payments, and a remote actions panel (ping, restart, generate voucher,
   flag for support — all mocked).
5. **Pool Owner Dashboard** — same visual language, scoped to one
   organization, no org switcher, "getting started" empty state for new
   owners with few devices.
6. **Transactions** — SUCCESS/PENDING/FAILED status badges, a surfaced
   "stuck payments" banner (payment succeeded but no session was recorded),
   filters, and CSV export (mocked toast).

Every list/detail view is designed for four states: **loading** (skeleton),
**empty**, **error/retry**, and **populated**.

## Architecture

- `src/theme/tokens.css` — the full design-token system as CSS variables,
  switched via `data-theme="light" | "dark"` on `<html>`.
- `src/types/` — the shared domain model (Device, Organization, Transaction,
  etc.), designed to match what a real API would return.
- `src/mocks/` — deterministic mock data generators (devices, orgs,
  transactions, activity, revenue trends, Rwanda's Province→District→Sector
  geography).
- `src/services/` — an async service layer (`deviceService`,
  `orgService`, `transactionService`, `authService`) with simulated
  network latency. Swapping in real endpoints later is a one-line change
  per function.
- `src/components/ui/` — the shared component library used by both roles:
  `StatusBadge`, `KpiCard`, `DataTable`, `LocationCascadeSelect`,
  `DeviceVitals`, `TrendChart`, `DonutChart`, `EventTimeline`,
  `EmptyState`/`ErrorState`, `Skeleton`, `ConfirmDialog`, `Tabs`, `Toast`.
- `src/components/layout/` — `AppShell`, role-aware `Sidebar`, `Topbar`
  (org switcher for admins, theme toggle, notifications, profile menu),
  and `ProtectedRoute` (role guard with a friendly access-denied page
  instead of a silent redirect).
- `src/pages/admin/` and `src/pages/owner/` — the two dashboards. Owner
  pages for devices, device details, and transactions are thin wrappers
  around the same admin components, pre-scoped to the owner's
  `organizationId` — the "one coherent design system, two roles" pattern
  from the brief.

Routes outside today's six-screen scope (Organizations, Payments, Reports,
Manufacturing, Flasher, Support, Settings) are wired up as lightweight
placeholders so the navigation is fully clickable, ready to be filled in
with the same shared components.
