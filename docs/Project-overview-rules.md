# Arvash Pool Device Management Platform
### Frontend Design & Implementation Analysis

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Proposed Solution](#2-proposed-solution)
3. [Application Structure & Roles](#3-application-structure--roles)
4. [Platform Administrator — Dashboards & Pages](#4-platform-administrator--dashboards--pages)
   - 4.1 [Dashboard (Fleet Overview)](#41-dashboard-fleet-overview)
   - 4.2 [Organizations (List)](#42-organizations-list)
   - 4.3 [Organization Details](#43-organization-details)
   - 4.4 [Devices (Fleet-wide)](#44-devices-fleet-wide)
   - 4.5 [Device Details](#45-device-details)
   - 4.6 [Transactions](#46-transactions)
   - 4.7 [Payments](#47-payments)
   - 4.8 [Reports](#48-reports)
   - 4.9 [Manufacturing (Provisioning)](#49-manufacturing-provisioning)
   - 4.10 [Flasher (Firmware)](#410-flasher-firmware)
   - 4.11 [Support](#411-support)
   - 4.12 [Profile & Settings](#412-profile--settings)
5. [Pool Owner — Dashboards & Pages](#5-pool-owner--dashboards--pages)
   - 5.1 [Dashboard (Business Overview)](#51-dashboard-business-overview)
   - 5.2 [Live Locations](#52-live-locations)
   - 5.3 [Devices](#53-devices)
   - 5.4 [Device Details](#54-device-details)
   - 5.5 [Transactions](#55-transactions)
   - 5.6 [Revenue](#56-revenue)
   - 5.7 [Profile & Settings](#57-profile--settings)
6. [Customer — Touchpoints](#6-customer--touchpoints)
   - 6.1 [On-Device Flow (Reference, Non-Web)](#61-on-device-flow-reference-non-web)
   - 6.2 [Recommended Web Touchpoints](#62-recommended-web-touchpoints)
7. [Shared Authentication Screens](#7-shared-authentication-screens)
8. [Shared UI Components Library](#8-shared-ui-components-library)
9. [Recommended (Beyond-Spec) Additions](#9-recommended-beyond-spec-additions)
10. [Priority Matrix — Required vs Recommended](#10-priority-matrix--required-vs-recommended)

---

## 1. Problem Statement

Arvash Pool operates a fleet of IoT-enabled pool/billiards tables that replace human attendants with automated, payment-gated access. A customer pays via mobile money (MoMo/Airtel), the device unlocks a motorized ball compartment for a set number of games, and the device reports status, events, and payments back to the cloud in real time (with offline fallback).

There is currently no web management console for this hardware fleet. Two very different audiences need one:

- **Platform Administrators** who must operate and monitor the *entire* fleet across many independent pool-hall businesses — onboarding new owners, provisioning hardware, flashing firmware, reconciling payments, and resolving support escalations.
- **Pool Owners** who only need to run *their own* business — see their tables' health, their revenue, their transactions, and issue vouchers to customers — without any visibility into other owners' data.

The core design challenge is building **one coherent design system** that serves two roles with sharply different scopes (platform-wide vs. tenant-scoped), while gracefully handling the realities of IoT hardware in the field: devices going offline, erroring out, running low on battery, or receiving payments that never make it into a completed game session.

---

## 2. Proposed Solution

A single React application with **role-based routing and data-scoping**, built around a shared design system and a shared data layer, so the two dashboards feel like one product rather than two disconnected apps.

**Key architectural decisions:**

- **Single codebase, role-aware shell.** One `AppShell` renders a different sidebar/nav set depending on `role: SUPERADMIN | OWNER`; the same page components (e.g., `DevicesTable`, `DeviceDetails`) are reused by both roles, with data-fetching scoped by an `organizationId` filter that is implicit for Owners and explicit/optional for Admins.
- **Mock service layer, not hardcoded data.** A `services/` abstraction (e.g., `deviceService.list()`, `paymentService.list()`) returns mock data shaped exactly like the real API would, so swapping in real endpoints later is a one-line change. This also makes it trivial to simulate loading, empty, and error states.
- **State-first UI, not happy-path-only.** Every list/detail view is designed for four states up front: **loading (skeleton)**, **empty**, **error/retry**, and **populated** — because a fleet-monitoring tool is only trustworthy if it's honest about degraded states (offline devices, failed payments, stale data).
- **Status is a first-class visual language.** A single, consistent status-badge system (color + icon + label) is used everywhere a device, payment, or session state appears, so a Pool Owner and a Super Admin read "ERROR" or "OFFLINE" identically.
- **Progressive disclosure for two audiences.** Admin screens default to platform-wide aggregates with drill-down filters (by organization); Owner screens skip the "whose data is this" question entirely and go straight to their own fleet.
- **Geography-aware location model.** Rwanda's Province → District → Sector hierarchy is modeled as cascading selects/filters wherever locations are chosen or displayed, rather than a flat free-text field.

---

## 3. Application Structure & Roles

| Role | Scope | Primary Job |
|---|---|---|
| **SUPERADMIN** | All organizations, all devices, all payments | Operate the platform: onboard owners, provision hardware, monitor fleet health, resolve support escalations |
| **OWNER** | Only their own organization(s)/locations/devices | Run their business: monitor tables, track revenue, issue vouchers |
| **Customer** (non-web) | Their own session on one device | Pay, play, and (recommended) verify a payment or redeem a voucher |

Global navigation shell (both roles): logo, role-aware sidebar, top bar with org switcher (Admin only), notifications bell (device errors / failed payments), and profile menu.

---

## 4. Platform Administrator — Dashboards & Pages

### 4.1 Dashboard (Fleet Overview)
The Super Admin's landing page — must answer "is the platform healthy, and is it making money?" in under 5 seconds.

- **Top KPI strip**: total devices, online/offline/error counts (as a segmented donut or stacked bar, not just numbers), today/week/month revenue (RWF), active sessions.
- **Fleet health widget**: color-coded status breakdown (green/gray/red) with a "X devices need attention" call-to-action linking straight to a pre-filtered Devices list.
- **Revenue trend chart**: line/area chart, day/week/month toggle.
- **Recent activity feed**: latest payments, tamper alerts, and motor/sensor errors, each clickable to its device.
- **Top organizations table**: ranked by revenue or device count, links to Organization Details.
- **Empty/loading/error states**: skeleton cards on load; a friendly empty state only applies pre-launch (no orgs yet) with a "create your first organization" CTA.

### 4.2 Organizations (List)
- **Data table** with search-by-name, columns: name, # locations, # devices, online/offline ratio, revenue (this month), status.
- **Filters**: by device-health tier ("has devices in error"), by region.
- Row click → Organization Details. "Onboard New Owner" primary button top-right.
- Pagination + column sort.

### 4.3 Organization Details
- **Header card**: org name, price-per-game, owner contact, "Suspend/Activate" toggle (admin-only power action, behind a confirm modal).
- **Tabs**: Overview (KPIs scoped to this org) · Locations · Devices · Transactions.
- **Locations sub-tab**: cards or table per location (Province/District/Sector), device count per location.
- **Devices sub-tab**: same `DevicesTable` component as global Devices page, pre-filtered.
- Danger-zone actions (deactivate org) are visually separated and require typed confirmation.

### 4.4 Devices (Fleet-wide)
- **Filter bar**: organization, location (cascading Province→District→Sector), status (ONLINE/OFFLINE/ERROR/PROVISIONED), firmware version, search by UUID/serial/table name.
- **Table columns**: table name, org, location, status badge, battery (icon + %), signal strength (bars icon), firmware version, last-seen (relative time, e.g. "3m ago").
- **Bulk actions**: select multiple devices → bulk firmware update or bulk export.
- **Status legend** always visible so colors are unambiguous.
- Row click → Device Details.

### 4.5 Device Details
- **Header**: device UUID, serial number, table name, org/location breadcrumb, live status badge, "last seen" timestamp.
- **Vitals row**: battery gauge, signal strength gauge, firmware version with "update available" flag.
- **Tabs**: Events (timeline: boot, tamper_alert, motor_error, payment_success — each with icon + timestamp + payload viewer) · Sessions (game history) · Payments (linked to this device).
- **Actions panel**: remote restart/ping (mock), generate voucher for this device, mark for firmware flash, flag for support ticket.
- **Offline/error banner**: prominent, non-dismissible alert bar when device is OFFLINE or ERROR, with likely-cause hint (e.g., "no heartbeat for 47 minutes").

### 4.6 Transactions
- **Platform-wide table**: date/time, org, device, amount, method (MoMo/Airtel), status (PENDING/SUCCESS/FAILED), games count.
- **Filters**: date range, organization, status, payment provider.
- **Export** (CSV) button.
- Failed/pending rows visually flagged (amber/red) and clickable into a reconciliation view.

### 4.7 Payments
- Similar to Transactions but focused on **payment-provider health**: success rate by provider (MTN vs Airtel), retry/failure trends, a chart of payment volume over time.
- **"Stuck payments" panel**: payments marked SUCCESS but with no corresponding session — this is the exact failure mode called out in the brief ("payment succeeded but device didn't process") and deserves its own surfaced widget here, not just in Support.

### 4.8 Reports
- **Report builder**: date range + org + metric selectors (revenue, sessions, device uptime).
- **Chart gallery**: revenue by organization (bar), device uptime % (bar), games played over time (line).
- **Export/schedule**: download PDF/CSV, optional "email me weekly" toggle.

### 4.9 Manufacturing (Provisioning)
- **"Register New Device" form**: serial number, generate/scan UUID, initial firmware version — with inline validation (duplicate serial detection).
- **Provisioning queue table**: devices in PROVISIONED status awaiting assignment.
- **Assign-to-organization** step: searchable org/location picker, confirm → device moves to fleet.
- **Batch import**: CSV upload for bulk hardware registration, with a preview/validation step before commit.

### 4.10 Flasher (Firmware)
- **Firmware version list**: version, release notes, compatible device models, rollout %.
- **Flash workflow**: select target devices (single, by org, or fleet-wide) → select firmware version → confirm (impact warning: "affects 42 devices, ~3 min offline each") → progress view.
- **Live progress table**: per-device flash status (queued/flashing/success/failed) with retry-on-failure action.

### 4.11 Support
- **Ticket queue**: filter by type (payment mismatch, voucher issue, hardware fault), status (open/investigating/resolved), org.
- **Payment reconciliation view**: side-by-side of payment record vs. device session record to spot the mismatch at a glance (this directly serves "payment succeeded but device didn't process").
- **Ticket detail**: timeline of the issue, linked device/payment/org, internal notes, resolve/escalate actions.

### 4.12 Profile & Settings
- Account info, password change, notification preferences (which alerts trigger email/SMS), platform-level settings (default currency display, session timeout) — admin-only settings section separated from personal profile fields.

---

## 5. Pool Owner — Dashboards & Pages

### 5.1 Dashboard (Business Overview)
- Same visual language as Admin dashboard but **scoped and simplified**: no organization switcher, no platform-wide comparisons.
- KPI strip: my devices online/offline/error, today/week/month revenue, active sessions.
- "Devices needing attention" widget — identical component to Admin's, just pre-filtered.
- Revenue trend chart, recent activity feed (their devices only).
- **Empty state matters most here**: a brand-new owner with one device should see a clear, encouraging "getting started" state, not a blank chart.

### 5.2 Live Locations
- **Map or card-grid view** of the owner's physical venues, each showing: location name, address (Province/District/Sector), device count, online ratio at that location.
- Click a location → filtered Devices view for that venue.
- This screen exists specifically to answer "what's happening at each of my venues right now" — a map pin with a colored status ring per location is a strong pattern if a map library is available; otherwise a card grid with a mini status bar works well.

### 5.3 Devices
- Same `DevicesTable` component as Admin's, but with the organization column removed (redundant) and location as the primary grouping/filter instead.
- **On/off / lock control**: per the brief's "devices management (on/off)" requirement — an explicit action (with confirm dialog) to remotely disable a device (e.g., for maintenance), distinct from its live connectivity status.
- Search by table name, filter by location and status.

### 5.4 Device Details
- Same component as Admin's Device Details, permission-trimmed: no "flag for firmware flash" or platform-level actions — owner-relevant actions only (generate voucher, view events/sessions/payments, remote disable for maintenance).

### 5.5 Transactions
- Owner-scoped transaction table: date, device, amount, method, status, games.
- Same filter pattern as Admin's Transactions page, minus the organization filter.
- Voucher-redemption transactions visually distinguished from mobile-money transactions (different icon/tag).

### 5.6 Revenue
- Dedicated analytics page (separate from Dashboard) for deeper business insight: revenue by device (which tables earn the most), by location, by day-of-week/hour-of-day (useful for staffing/pricing decisions), and a simple "games played vs. revenue" correlation chart.
- Date-range picker and CSV export.

### 5.7 Profile & Settings
- Personal account fields, password management, plus **business settings**: price-per-game, business/organization name, contact info — settings an Admin would edit for them but an Owner edits for themselves.

---

## 6. Customer — Touchpoints

The brief scopes the *web platform* to Admins and Owners only — customers interact purely through the physical device (keypad, display, mobile money). No customer web dashboard is required. However, two lightweight customer-facing web touchpoints are worth including as high-value, low-cost additions.

### 6.1 On-Device Flow (Reference, Non-Web)
For context, this is the flow the web platform's data model must support, even though it isn't rendered in a browser: select games → see price → pay via MoMo/Airtel → device validates → press Play → compartment unlocks → games tracked → compartment relocks.

### 6.2 Recommended Web Touchpoints
- **Payment confirmation / receipt page** — a simple, unauthenticated page reachable via an SMS link after payment, showing amount paid, games purchased, device/table, and organization name. Mobile-first, single column, large confirmation checkmark, no navigation chrome.
- **Voucher redemption / status check page** — customer enters a voucher code and device UUID to confirm it's valid/unredeemed, addressing the brief's "voucher code redemption problems" pain point directly from the customer's side, reducing Support ticket volume.
- Both pages should be deliberately minimal — no login, no branding clutter — since they're viewed on a customer's phone in a noisy pool hall for a few seconds.

---

## 7. Shared Authentication Screens

- **Landing page**: brief product explainer + "Log in" CTA (marketing-lite, not a full site).
- **Login**: email/username + password, role is resolved server-side (no role picker shown to the user), inline validation, "forgot password" link.
- **Password reset (optional)**: email-entry step → "check your email" confirmation state → new-password form with strength indicator.
- **Logout**: confirm-on-click from the profile menu, not a standalone page.

---

## 8. Shared UI Components Library

These components are used across *both* dashboards and should be built once:

| Component | Used In |
|---|---|
| `StatusBadge` (ONLINE/OFFLINE/ERROR/PROVISIONED, PENDING/SUCCESS/FAILED) | Devices, Payments, Transactions everywhere |
| `KpiCard` (label, value, trend delta) | Both dashboards |
| `DataTable` (sort, filter, paginate, empty/loading/error slots) | Devices, Organizations, Transactions, Payments |
| `LocationCascadeSelect` (Province → District → Sector) | Device provisioning, location filters, forms |
| `DeviceVitals` (battery, signal, firmware) | Device Details (both roles) |
| `TrendChart` (line/area, range toggle) | Dashboards, Revenue, Reports |
| `EventTimeline` | Device Details |
| `EmptyState` (icon, message, CTA) | Every list view |
| `ConfirmDialog` (typed confirmation for destructive/admin actions) | Suspend org, flash firmware, disable device |
| `Toast/Notification` | Global feedback on async actions |

---

## 9. Recommended (Beyond-Spec) Additions

- **Offline-credit indicator**: since devices can operate offline with pre-authorized "offline credits," surface this explicitly on Device Details so an Owner isn't confused by a device that's "offline" but still legitimately dispensing games.
- **Audit log** for Admin: who provisioned/flashed/suspended what and when — important once more than one admin uses the platform.
- **Role-based route guards** with a friendly "you don't have access to this organization" page rather than a silent redirect.
- **Dark mode / low-light theme**: pool halls are often dim; a Pool Owner checking the dashboard on a phone in a dark venue benefits from this more than most B2B tools.
- **Mobile-responsive Owner dashboard**: Owners are more likely than Admins to check status from a phone on the floor of their venue — this should be a first-class breakpoint, not an afterthought.

---

## 10. Priority Matrix — Required vs Recommended

| Priority | Pages |
|---|---|
| **Required (explicit in brief)** | Landing, Login, Password Reset; Admin: Dashboard, Organizations, Org Details, Devices, Device Details, Transactions, Payments, Reports, Manufacturing, Flasher, Support, Profile; Owner: Dashboard, Live Locations, Devices, Device Details, Transactions, Revenue, Profile |
| **Recommended (adds strong value, low cost)** | Customer payment-confirmation page, Customer voucher-status page, Admin audit log, Route-guard "no access" page |
| **Nice-to-have (polish/differentiation)** | Dark mode, weekly emailed reports, map view for Live Locations, offline-credit visualization |