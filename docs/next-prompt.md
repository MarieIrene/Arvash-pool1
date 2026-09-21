You are continuing work on an existing React + TypeScript + Vite codebase
called "Arvash Pool" (an IoT pool-table fleet management dashboard). Six
screens already exist and work end-to-end: Login, Platform Admin Dashboard,
Devices List, Device Details, Pool Owner Dashboard, and Transactions.

Your job is to implement the remaining pages so the app fully matches the
product spec, WITHOUT breaking or restyling anything that already exists.
Before writing any code, read these files to learn the established
conventions — do not invent new patterns where an existing one already
covers the need:

- `src/theme/tokens.css` — every color/spacing/radius/shadow token. Never
  hardcode a hex value or px spacing; always reference a CSS variable.
- `src/types/index.ts` — the shared domain model. Extend it (don't
  duplicate types) if a new page needs a shape that isn't there yet
  (e.g. Ticket, FirmwareRelease, ProvisioningBatch, Voucher).
- `src/mocks/` — deterministic mock data generators using the seeded
  `rand()`/`randInt()`/`pick()` helpers from `mocks/rng.ts`. Follow this
  exact pattern for any new mock dataset instead of using `Math.random()`
  directly or hardcoding arrays inline in a page.
- `src/services/` — the async service layer (`deviceService`,
  `orgService`, `transactionService`, `authService`), each returning a
  `Promise` with a simulated `delay()`. Add new services
  (`ticketService`, `firmwareService`, `reportService`, `voucherService`)
  following this exact shape so swapping in a real API later is a
  one-line change per function.
- `src/components/ui/` — the shared component library: `StatusBadge`,
  `KpiCard`, `DataTable`, `Card`, `Button`, `Tabs`, `ConfirmDialog`,
  `EmptyState`/`ErrorState`, `Skeleton`/`KpiCardSkeleton`, `Toast`
  (`useToast`), `LocationCascadeSelect`, `DeviceVitals`, `EventTimeline`,
  `DonutChart`, `TrendChart`, `DeviceIndicators` (battery/signal). Reuse
  these everywhere; only add a new shared component if none of the
  existing ones fit, and put it in this same folder following the same
  prop-naming conventions.
- `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`,
  `ProtectedRoute.tsx` — every authenticated page is wrapped in
  `<AppShell title="...">`. Role-based route guarding uses
  `<ProtectedRoute role="SUPERADMIN">` / `role="OWNER"`.
- `src/pages/admin/DeviceDetails.tsx` and `src/pages/owner/*` — the
  pattern for reusing one admin component across both roles via a
  `basePath` / `organizationId` prop, rather than duplicating a whole
  page. Follow this same reuse pattern for every new page that exists in
  both an admin (platform-wide) and owner (org-scoped) variant.
- `src/App.tsx` — how routes are registered. Replace the relevant
  `<ComingSoon title="..."/>` placeholder routes with the real pages you
  build; don't add parallel routes.

## Non-negotiable design rules (already established, keep following them)

- Every list/detail view has four states: **loading** (skeleton),
  **empty**, **error/retry**, and **populated**. Never ship a
  happy-path-only view.
- Status is always a colored dot + icon + text label via `StatusBadge` —
  never color alone.
- One filled primary button (`variant="primary"`) per screen at most;
  everything else is `outline`, `text`, or `danger-outline`.
- Destructive or platform-level admin actions (suspend org, disable
  device, force-flash firmware fleet-wide) go through `ConfirmDialog`
  with `requireTypedText` set for anything irreversible.
- Any location field uses `LocationCascadeSelect` (Province → District →
  Sector) — never a flat text input.
- Admin pages default to platform-wide aggregates with drill-down
  filters (by organization); Owner pages skip the "whose data is this"
  question and go straight to their own scoped data — using the same
  underlying component, pre-filtered, per the reuse pattern already in
  the codebase.
- Dark mode must work with zero extra code — this falls out automatically
  as long as you only use the CSS variables from `tokens.css` and never a
  literal color.

## Pages to build

Build these in the order listed — later ones depend on data/services the
earlier ones introduce.

### 1. Organizations (List) — `/admin/organizations`
Replace the `ComingSoon` placeholder. `src/pages/admin/OrganizationsList.tsx`.
- `DataTable` of `organizations` (already in `mocks/organizations.ts`):
  columns name, # locations, # devices, online/offline ratio, revenue this
  month, status (`StatusBadge` — reuse `ACTIVE`/`SUSPENDED` as a new
  badge variant, or render suspended as a muted outline badge).
  - Filters: search by name, filter by device-health tier ("has devices
    in error"), filter by region.
- Add "Onboard New Owner" primary button, top-right, that opens a
  `ConfirmDialog`-style modal or dedicated form (your call) — mock the
  submit as a `useToast().show(...)` success message; no need for a real
  multi-step flow.
  - Row click → `/admin/organizations/:id` (Organization Details, below).
  - Pagination + column sort already come free from `DataTable`.

### 2. Organization Details — `/admin/organizations/:id`
`src/pages/admin/OrganizationDetails.tsx`.
- Header card: org name, price-per-game, owner contact, and a
  "Suspend/Activate" toggle that is admin-only and goes through
  `ConfirmDialog`.
- `Tabs`: **Overview** (reuse `KpiCard` + `TrendChart`, scoped to this
  org's data only), **Locations** (card or table per location — reuse
  the location-grouping pattern from `pages/owner/OwnerLocations.tsx`),
  **Devices** (reuse `DevicesList`'s table by extracting its `DataTable`
  columns into a shared function, or add an `organizationId` prop to
  `DevicesList` the same way `Transactions.tsx` already takes one, and
  pre-filter), **Transactions** (reuse `TransactionsPage` with
  `organizationId` prop — it already supports this).
- Danger-zone section (deactivate org) visually separated (e.g. a
  `danger-tint` bordered box at the bottom of the page) and requires
  typed confirmation via `ConfirmDialog`.

### 3. Payments — `/admin/payments`
`src/pages/admin/Payments.tsx`. Reuses `transactions` mock data but is
analysis-focused, not a raw list:
- Success-rate-by-provider comparison (MTN/MoMo vs Airtel) — a couple of
  `KpiCard`s or a small bar chart (recharts `BarChart`, same styling
  conventions as `TrendChart.tsx`).
- Payment volume over time chart (reuse `TrendChart` shape, but for
  transaction *count* per day rather than revenue — add a
  `getPaymentVolumeTrend()` mock generator alongside `revenue.ts`).
- A **"Stuck payments" panel**: full list (not just the count badge
  already in `Transactions.tsx`) of `transactions` where
  `status === 'SUCCESS' && !hasSession`, using `DataTable`, each row
  clickable into a lightweight reconciliation view — a side-by-side
  comparison of the payment record vs. "no session found," reusing
  `EmptyState` for the missing-session side. This is the single most
  important pain point in the brief ("payment succeeded but device
  didn't process") — don't bury it, give it its own clearly labeled
  section.

### 4. Reports — `/admin/reports`
`src/pages/admin/Reports.tsx`. Add `src/services/reportService.ts` and
whatever mock generators it needs (uptime %, games played over time —
follow the `revenue.ts` pattern).
- A small "report builder" bar: date range, organization filter, metric
  selector (revenue / sessions / device uptime) — plain `<select>`s and
  a date range pair styled like the filters already in `DevicesList.tsx`.
- Chart gallery: revenue by organization (bar chart), device uptime %
  (bar chart), games played over time (reuse `TrendChart`'s line/area
  pattern). Use recharts `BarChart` with the same `var(--color-primary)`
  fill and axis styling already established in `TrendChart.tsx`.
- Export/schedule row: "Download PDF" / "Download CSV" buttons and an
  "Email me weekly" toggle — all mocked via `useToast()`, no real
  file generation needed.

### 5. Manufacturing (Provisioning) — `/admin/provisioning`
`src/pages/admin/Provisioning.tsx`. Add `src/mocks/provisioning.ts`
(a `ProvisioningBatch`/device-in-queue shape in `types/index.ts`) and
`src/services/provisioningService.ts`.
- "Register New Device" form: serial number input, a generated/scannable
  UUID (just display a generated one, e.g. `crypto.randomUUID()`),
  initial firmware version select, with inline validation that flags a
  duplicate serial against existing `devices` mock data.
- Provisioning queue table (`DataTable`) of devices in `PROVISIONED`
  status awaiting assignment (filter `devices` by
  `status === 'PROVISIONED'`).
- "Assign to organization" flow: a searchable org/location picker (reuse
  `LocationCascadeSelect` + an org `<select>`) → confirm step → on
  confirm, mock-toast that the device moved to the fleet (no need to
  actually mutate the in-memory array across pages, though you may if
  you want the queue to visibly shrink — use React state at the page
  level for that, not a shared store).
- Batch import: a CSV file input with a preview table
  (parse client-side, e.g. with a simple `.split(',')`/`.split('\n')` or
  `papaparse` if you prefer) and a validation-errors list before a
  "Confirm import" button.

### 6. Flasher (Firmware) — `/admin/flasher`
`src/pages/admin/Flasher.tsx`. Add `src/mocks/firmware.ts` (a
`FirmwareVersion` type: version, release notes, compatible models,
rollout %) and `src/services/firmwareService.ts`.
- Firmware version list: table or card list, each with version, release
  notes (short text), compatible device models, current rollout %
  (a slim progress bar, same visual language as the battery/signal
  gauges in `DeviceVitals.tsx` — reuse that gauge-bar styling).
- Flash workflow (a multi-step `ConfirmDialog`-style flow, or a
  dedicated stepper): (1) select target devices — single device, by
  organization, or fleet-wide (reuse the org `<select>` and status
  filters from `DevicesList.tsx`); (2) select firmware version; (3)
  confirm step showing an impact warning ("affects 42 devices, ~3 min
  offline each" — compute the device count live from the current
  selection); (4) progress view.
- Live progress table: per-device flash status
  (queued/flashing/success/failed — reuse `StatusBadge` by adding these
  as new badge variants, or render as a small labeled progress row) with
  a "retry" action on failed rows.

### 7. Support — `/admin/support`
`src/pages/admin/Support.tsx` (list) +
`src/pages/admin/SupportTicketDetail.tsx` (detail, route
`/admin/support/:id`). Add `src/mocks/tickets.ts` (a `Ticket` type: id,
type, status, organizationId, linked device/payment ids, notes/timeline)
and `src/services/ticketService.ts`.
- Ticket queue: `DataTable` filterable by type (payment mismatch,
  voucher issue, hardware fault), status (open/investigating/resolved),
  organization.
- Payment reconciliation view: side-by-side of a payment record vs. its
  device session record, to spot a mismatch at a glance — this can share
  most of its layout with the stuck-payments reconciliation view you
  build in Payments (#3); consider extracting a shared
  `PaymentReconciliationCard` component into `components/ui/` if the two
  views end up needing the same layout, rather than writing it twice.
- Ticket detail: timeline of the issue (reuse the visual style of
  `EventTimeline.tsx` — you may need a more generic
  `Timeline`/`ActivityTimeline` component if the shape differs enough
  from `DeviceEvent`), linked device/payment/org (link out to their
  respective detail pages), internal notes (a simple textarea + list of
  past notes), and resolve/escalate actions.

### 8. Profile & Settings — `/admin/settings` and `/owner/settings`
Replace both `ComingSoon` placeholders.
`src/pages/Settings.tsx` (one shared component, rendered from both
routes with a `role` check inside — following the "one component, role-
aware" pattern already used for `AppShell`).
- Account info section: name, email, avatar initials (reuse the same
  circular-initials treatment from `Topbar.tsx`), password change form.
- Notification preferences: toggles for which alerts trigger
  email/SMS (device offline, error, failed payment, etc.) — simple
  checkbox/switch rows.
- Admin-only: a visually separated "Platform settings" section (default
  currency display, session timeout) — only rendered when
  `user.role === 'SUPERADMIN'`, using the same separation treatment as
  the danger-zone box in Organization Details (a bordered/tinted box),
  though this one should use a neutral tint, not the danger tint, since
  it isn't destructive.

### 9. Pool Owner — remaining page: Revenue — `/owner/revenue`
Replace the `ComingSoon` placeholder. `src/pages/owner/OwnerRevenue.tsx`.
- Reuse `TrendChart` with `ownerRevenueTrend` (already in
  `mocks/revenue.ts`) plus a breakdown by device/table (bar chart or
  simple ranked list, same pattern as the "Top organizations" list in
  `AdminDashboard.tsx` but scoped to the owner's own devices).
- Keep it simple — this is the owner-scoped counterpart to admin
  Reports, not a full report builder.

### 10. Shared Authentication — fill in the gaps
`src/pages/Landing.tsx`, and extend `src/pages/Login.tsx`'s flow:
- **Landing page** (`/`, shown when logged out instead of an immediate
  redirect to `/login`): a brief, honest product explainer — one
  screen's worth of copy about what Arvash Pool does — plus a "Log in"
  CTA. Marketing-lite, not a full site. Update the `RootRedirect` logic
  in `App.tsx` so logged-out visitors land here instead of `/login`
  directly, while logged-in visitors still redirect straight to their
  dashboard.
- **Password reset** (`/forgot-password`): three states in one page or a
  small internal stepper — (1) email-entry form, (2) "check your email"
  confirmation state, (3) a new-password form with a strength indicator
  (a simple 3-4 segment bar is fine, styled like the battery/signal
  gauges). Wire the "Forgot password?" link in `Login.tsx` to this
  route. Fully mocked — no real email is sent.
- **Logout confirmation**: currently `Topbar.tsx` logs out immediately
  on click. Change it to open a `ConfirmDialog` ("Log out of Arvash
  Pool?") before calling `logout()` — per the brief, logout should be a
  confirm-on-click from the profile menu, not a standalone page.

### 11. Customer touchpoints (non-web-app, but web-reachable pages)
These are deliberately outside the authenticated app shell — no sidebar,
no topbar, mobile-first, single column, reachable via a direct link (as
if opened from an SMS). Put them in `src/pages/customer/` and register
them in `App.tsx` as top-level routes with NO `ProtectedRoute` wrapper:
- **Payment confirmation / receipt** — `/pay/receipt/:transactionId`.
  `src/pages/customer/PaymentReceipt.tsx`. Look up the transaction from
  the existing `transactions` mock array. Show: a large success
  checkmark, amount paid, games purchased, device/table name,
  organization name. No navigation chrome at all — this is a page
  someone glances at for five seconds in a noisy pool hall.
- **Voucher redemption / status check** — `/voucher/check`.
  `src/pages/customer/VoucherCheck.tsx`. A form: voucher code + device
  UUID, "Check voucher" button. Add a small `mocks/vouchers.ts` (a
  `Voucher` type: code, deviceId, redeemed boolean, expiresAt) and
  `services/voucherService.ts` with a `check(code, deviceId)` method.
  Show a clear valid/already-redeemed/not-found result state — reuse
  `EmptyState`/`ErrorState` visual language but keep the page chrome-free
  like the receipt page.

Both customer pages should still use the design tokens (so dark mode and
the type scale carry over) but should NOT use `AppShell`, `Sidebar`, or
`Topbar` — write a minimal centered single-column wrapper local to
`src/pages/customer/`.

## When you're done

- Every `ComingSoon` placeholder route in `App.tsx` should be replaced
  with a real page, except any you and I explicitly decide to leave for
  a later pass — call those out explicitly rather than leaving them
  silently unfinished.
- Run `npx tsc -b` and `npx vite build` and fix everything until both are
  clean, exactly as the existing six screens already do.
- Don't change anything in `src/theme/tokens.css`, or the six existing
  pages' visual output, unless a genuine shared-component bug forces it
  — if it does, say so explicitly and explain why.