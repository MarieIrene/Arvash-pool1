# Arvash Pool — Fleet Management Dashboard

Project report — what was built, and how it works.

## Table of contents

1. [Overview](#1-overview)
2. [Getting started](#2-getting-started)
3. [Architecture](#3-architecture)
   - 3.1 [No backend, by design](#31-no-backend-by-design)
   - 3.2 [Roles and route scoping](#32-roles-and-route-scoping)
   - 3.3 [Layered structure](#33-layered-structure)
   - 3.4 [The "one design system, two roles" pattern](#34-the-one-design-system-two-roles-pattern)
   - 3.5 [Design system & theming](#35-design-system--theming)
4. [What's done — screen by screen](#4-whats-done--screen-by-screen)
   - 4.1 [Shared authentication](#41-shared-authentication)
   - 4.2 [Platform Administrator](#42-platform-administrator)
   - 4.3 [Pool Owner](#43-pool-owner)
   - 4.4 [Customer touchpoints](#44-customer-touchpoints)
5. [Shared component library](#5-shared-component-library)
6. [Data model](#6-data-model)
7. [Mock data & services layer](#7-mock-data--services-layer)
8. [Design conventions enforced throughout](#8-design-conventions-enforced-throughout)
9. [Known limitations](#9-known-limitations)
10. [Verification performed](#10-verification-performed)

---

## 1. Overview

Arvash Pool is a frontend-only React + TypeScript dashboard for managing a fleet of
IoT-enabled pool tables. A customer pays via mobile money at a physical device, the
device unlocks a ball compartment, and the device reports status/events/payments back
to the cloud. This project is the **web management console** for that fleet, serving two
roles with different scopes:

- **Platform Administrator (`SUPERADMIN`)** — operates the entire fleet across every
  pool-hall business: onboarding owners, provisioning hardware, flashing firmware,
  reconciling payments, resolving support tickets.
- **Pool Owner (`OWNER`)** — runs their own business only: their tables, their revenue,
  their transactions, their support needs.

Every screen from the product brief (`docs/Project-overview-rules.md`) is implemented
and wired into routing — there are no remaining `ComingSoon` placeholders.

## 2. Getting started

```bash
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # tsc -b (type-check) then production build to dist/
npm run preview   # preview the production build
```

There's no backend and no test suite; `npm run build` (via `tsc -b`) is the project's
one automated check.

Log in with either mock account (any password, 4+ characters), or use the **"Log in as
(demo)"** dropdown on the login screen to auto-fill one:

| Email | Role |
|---|---|
| `admin@arvashpool.rw` | Platform Administrator (`SUPERADMIN`) |
| `owner@arvashpool.rw` | Pool Owner (`OWNER`) |

## 3. Architecture

### 3.1 No backend, by design

Everything is mock data and simulated services. `src/services/` is the boundary that
stands in for a real API — every function returns a `Promise` wrapped in a `delay()`
helper (~380–550ms) to simulate network latency, so loading states are real, not faked.
When a real backend exists, only the files in `src/services/` should need to change.

### 3.2 Roles and route scoping

`src/types/index.ts` defines `Role = 'SUPERADMIN' | 'OWNER'`. All authenticated routes
live under `/admin/*` or `/owner/*` in `src/App.tsx`, each wrapped in
`<ProtectedRoute role="...">` (`src/components/layout/ProtectedRoute.tsx`), which checks
the logged-in user's role and renders a friendly "you don't have access" page — not a
silent redirect — on mismatch.

Two route groups sit outside this scoping entirely:
- `/`, `/login`, `/forgot-password` — unauthenticated, pre-login.
- `/pay/receipt/:transactionId`, `/voucher/check` — customer-facing, no login at all
  (see [4.4](#44-customer-touchpoints)).

### 3.3 Layered structure

```
src/
├── types/index.ts        # shared domain model (Device, Organization, Transaction, ...)
├── mocks/                 # deterministic mock data generators
├── services/               # async API-shaped boundary over the mocks
├── context/                # AuthContext (sessionStorage) 
├── theme/                   # ThemeContext (localStorage) + tokens.css
├── components/ui/            # shared, role-agnostic component library
├── components/layout/         # AppShell, Sidebar, Topbar, ProtectedRoute
└── pages/
    ├── admin/                    # platform-wide screens
    ├── owner/                     # org-scoped screens (thin wrappers over admin/*)
    └── customer/                   # unauthenticated, chrome-free touchpoints
```

Determinism in the mock layer comes from `mocks/rng.ts`, a small seeded PRNG (not
`Math.random()` — with a couple of pre-existing exceptions inside `devices.ts` and
`transactions.ts`), so the same fleet of devices/orgs/transactions renders on every
reload. `mocks/geo.ts` encodes a representative subset of Rwanda's
Province → District → Sector hierarchy, used by `LocationCascadeSelect` and every
location filter/field in the app.

### 3.4 The "one design system, two roles" pattern

Rather than building two separate apps, owner screens are thin, pre-scoped wrappers
around the same admin components:

```tsx
// src/pages/owner/OwnerDeviceDetails.tsx
export function OwnerDeviceDetails() {
  return <DeviceDetails basePath="/owner" />;
}

// src/pages/owner/OwnerTransactions.tsx
export function OwnerTransactions() {
  const { user } = useAuth();
  return <TransactionsPage organizationId={user?.organizationId ?? 'org-1'} title="My transactions" />;
}
```

`DevicesList`/`DeviceDetails`/`TransactionsPage` all accept an optional
`organizationId`/`basePath` prop; when present, org-only UI (org column, org switcher
links) is hidden and every query is pre-filtered. This is also how
`OrganizationDetails`' tabs work: `TransactionsPage` was split into
`TransactionsPage` (full page, wraps `AppShell`) and an exported `TransactionsTable`
(no shell) so the same filtering/table logic can be embedded inside a tab without
nesting two sidebars.

### 3.5 Design system & theming

`src/theme/tokens.css` defines the entire visual language as CSS variables — color,
spacing, radius, shadows — switched by `data-theme="light" | "dark"` on `<html>`
(`ThemeContext`, persisted to `localStorage`). Every component in this project styles
itself exclusively with `var(--...)` tokens, so dark mode requires zero extra code per
screen.

## 4. What's done — screen by screen

### 4.1 Shared authentication

| Screen | Route | Notes |
|---|---|---|
| Landing | `/` | Shown to logged-out visitors instead of an immediate redirect; brief product explainer + "Log in" CTA. Logged-in visitors still redirect straight to their dashboard. |
| Login | `/login` | Email/password, inline validation, show/hide password, and a **"Log in as (demo)"** dropdown that auto-fills a valid demo account (`authService.DEMO_ACCOUNTS`). |
| Forgot password | `/forgot-password` | Three states in one page: email entry → "check your email" → new-password form with a 4-segment strength meter. Fully mocked. |
| Logout | via Topbar profile menu | Confirm-on-click through `ConfirmDialog`, not instant. |

### 4.2 Platform Administrator

All under `/admin/*`, role `SUPERADMIN`:

| Screen | Route | Summary |
|---|---|---|
| Dashboard | `/admin/dashboard` | KPI strip, fleet-health donut, revenue trend, top organizations, recent activity feed. |
| Devices | `/admin/devices` | Fleet-wide filterable/sortable table (org, location cascade, status, firmware, search), bulk select, always-visible status legend. |
| Device details | `/admin/devices/:id` | Offline/error banner with likely-cause hint, vitals row, Events/Sessions/Payments tabs, mocked remote actions (ping, restart, generate voucher, flag for support). |
| Organizations | `/admin/organizations` | Table of every org, health-tier/region filters, "Onboard new owner" modal. |
| Organization details | `/admin/organizations/:id` | Suspend/Activate (typed-confirmation `ConfirmDialog`), Overview/Locations/Devices/Transactions tabs, danger zone. |
| Transactions | `/admin/transactions` | Platform-wide payments table, stuck-payments banner, CSV export (mocked). |
| Payments | `/admin/payments` | Success-rate-by-provider KPIs, payment-volume chart, dedicated **stuck payments** panel with a payment ↔ session reconciliation view. |
| Reports | `/admin/reports` | Metric/range selector driving revenue-by-org, device-uptime-%, and games-played charts; PDF/CSV export + weekly-email toggle (mocked). |
| Manufacturing | `/admin/provisioning` | Register-device form (duplicate-serial validation), provisioning queue, CSV batch import with a validated preview, assign-to-organization flow. |
| Flasher | `/admin/flasher` | Firmware version list with rollout bars; 4-step flash workflow (targets → firmware → impact-warning confirm → live per-device progress with retry). |
| Support | `/admin/support`, `/admin/support/:id` | Ticket queue (filter by type/status/org) and a detail page with internal notes, resolve/escalate, and the shared reconciliation card for payment-mismatch tickets. |
| Settings | `/admin/settings` | Account info, notification preferences, admin-only "Platform settings" section. |

### 4.3 Pool Owner

All under `/owner/*`, role `OWNER`, always pre-scoped to the logged-in user's
`organizationId`:

| Screen | Route | Summary |
|---|---|---|
| Dashboard | `/owner/dashboard` | Same widgets as admin, scoped to one org; a "getting started" empty state for brand-new owners. |
| Live locations | `/owner/locations` | Card grid of the owner's venues, device count + online ratio per location. |
| Devices | `/owner/devices` | `DevicesList`, org column/filter removed. |
| Device details | `/owner/devices/:id` | `DeviceDetails` with `basePath="/owner"`, same component as admin. |
| Transactions | `/owner/transactions` | `TransactionsPage` pre-filtered to the owner's org. |
| Revenue | `/owner/revenue` | Revenue trend + a ranked "revenue by table" breakdown. |
| Settings | `/owner/settings` | Same shared `Settings` page, owner-only "Business settings" section instead of platform settings. |

### 4.4 Customer touchpoints

The product brief scopes the *web platform* to Admins and Owners — customers interact
with the physical device directly (keypad, mobile-money payment, motorized lock), which
is out of scope for this web app. Two lightweight, **unauthenticated** web pages exist
for the customer-facing moments that do make sense on the web, reachable only via a
direct link (e.g. an SMS after payment) — no `AppShell`, no sidebar, mobile-first,
single column:

| Screen | Route | Summary |
|---|---|---|
| Payment receipt | `/pay/receipt/:transactionId` | Looks up one transaction by id; shows amount paid, games purchased, table/org name. |
| Voucher check | `/voucher/check` | Form (voucher code + device UUID) → valid / already-redeemed / expired / not-found result. |

There is intentionally no simulated on-device UI in this app (an earlier iteration
prototyped one; it was removed — that flow belongs to the physical device firmware, not
this web console) and no customer login/account area — customers aren't platform users,
so there's no "my history" view for them.

## 5. Shared component library

`src/components/ui/` — used by both roles, so a fix or restyle in one place propagates
everywhere:

| Component | Purpose |
|---|---|
| `Button` | 4 variants (`primary`/`outline`/`text`/`danger-outline`) × 2 sizes. |
| `Card` | The one surface/border/shadow container used everywhere. |
| `StatusBadge` | Colored dot + label for every status in the app — device, payment, org, ticket, flash-job. Never color alone. |
| `KpiCard` | Label/value/delta tile for dashboards. |
| `DataTable` | Sort, paginate, loading/empty/error slots — the one table implementation in the app. |
| `LocationCascadeSelect` | Province → District → Sector cascading select. |
| `DeviceVitals` / `DeviceIndicators` | Battery/signal/firmware gauges and inline table indicators. |
| `TrendChart` / `DonutChart` | Recharts wrappers styled to the token system. |
| `EventTimeline` | Expandable device-event timeline with payload viewer. |
| `EmptyState` / `ErrorState` | The two non-happy-path states every list/detail view uses. |
| `Skeleton` / `SkeletonRow` / `KpiCardSkeleton` | Loading placeholders. |
| `ConfirmDialog` | Confirmation modal, with an optional `requireTypedText` for irreversible actions. |
| `Tabs` | Simple controlled tab strip. |
| `Toast` (`useToast`) | Global async-feedback notifications. |
| `PaymentReconciliationCard` | Payment-vs-session side-by-side view, shared by Payments and Support ticket detail. |

## 6. Data model

`src/types/index.ts` — shaped to match what a real API would return:

- **Core:** `User`, `Role`, `Location`, `Organization`, `Device`, `DeviceStatus`
- **Activity:** `DeviceEvent`, `GameSession`, `Transaction`, `PaymentStatus`,
  `PaymentMethod`, `RevenuePoint`, `ActivityItem`
- **Added for this pass:** `Ticket`/`TicketNote`/`TicketType`/`TicketStatus` (Support),
  `FirmwareVersion` (Flasher), `Voucher` (voucher check)

`StatusBadge`'s status union was extended to cover every new status kind so nothing in
the app ever renders a bare color: `ACTIVE`/`SUSPENDED` (orgs), `QUEUED`/`FLASHING`
(flash jobs), `OPEN`/`INVESTIGATING`/`RESOLVED` (tickets), alongside the original device
and payment statuses.

## 7. Mock data & services layer

| Mock file | Generates | Consumed by service |
|---|---|---|
| `organizations.ts` | Organizations, deterministic health/revenue mix | `orgService` |
| `devices.ts` | Devices per org, status/battery/signal/firmware | `deviceService` |
| `deviceHistory.ts` | Per-device events + game sessions | `deviceService` |
| `transactions.ts` | 90 transactions incl. "stuck payment" cases | `transactionService` |
| `activity.ts` | Platform activity feed | (read directly by dashboards) |
| `revenue.ts` | Revenue + payment-volume trend lines | `reportService` |
| `reports.ts` | Games-played trend | `reportService` |
| `firmware.ts` | Firmware versions + rollout % | `firmwareService` |
| `tickets.ts` | Support tickets (linked to stuck payments/devices) | `ticketService` |
| `vouchers.ts` | Voucher codes | `voucherService` |
| `geo.ts` | Rwanda Province → District → Sector | `LocationCascadeSelect`, device filters |
| `rng.ts` | Seeded PRNG (`rand`/`randInt`/`pick`) + date helpers | every generator above |

Every service function (`deviceService.list()`, `transactionService.stuckPayments()`,
`reportService.revenueByOrganization()`, etc.) returns a `Promise` via the shared
`delay()` helper, so every list/detail screen has a real loading state to show — not a
synthetic one.

## 8. Design conventions enforced throughout

Carried over from the product brief and followed on every screen added in this pass,
not just the original six:

- **Four states, always:** loading (skeleton), empty, error/retry, populated.
- **Status is never color alone** — always `StatusBadge`'s dot + icon + label.
- **One filled primary button per screen** at most; everything else is
  `outline`/`text`/`danger-outline`.
- **Destructive or platform-level actions** (suspend org, flash firmware fleet-wide)
  go through `ConfirmDialog`, with `requireTypedText` for anything irreversible.
- **Any location field** uses `LocationCascadeSelect` — never flat text.
- **Admin = platform-wide + drill-down filters; Owner = pre-scoped, no "whose data"
  question** — via the same underlying component, not a duplicated one.
- **Dark mode is free** — every color is a `var(--...)` token.

## 9. Known limitations

- No backend, no persistence beyond `sessionStorage` (auth) and `localStorage`
  (theme) — reloading resets any in-memory mutation (e.g. a newly provisioned device).
- No automated test suite; `tsc -b` (type-check) is the only automated gate.
- No customer accounts/history — by design (see [4.4](#44-customer-touchpoints)).
- The production JS bundle is a single ~750KB chunk (recharts + the full app); not yet
  code-split. Not addressed here since it wasn't part of the requested scope.

## 10. Verification performed

- `npx tsc -b` — clean, no errors.
- `npx vite build` — clean production build.
- Dev server route resolution spot-checked via `curl` for new and existing routes.
- **Not performed:** interactive/visual browser testing — this environment has no
  browser-automation tooling available (no Playwright/chromium-cli). A manual click
  -through is recommended before treating any of the multi-step flows (Flasher,
  Provisioning, Forgot password) as fully verified.
