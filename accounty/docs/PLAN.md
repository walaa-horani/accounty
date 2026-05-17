# Accounty — Master Project Plan

> Living document. Update status as features ship.
> Full spec: `docs/superpowers/specs/2026-05-17-accounty-mvp-design.md`

---

## Project Overview

Multi-tenant double-entry accounting SaaS.
**Stack:** Next.js 16 · Convex · Clerk (auth + orgs + billing) · Tailwind · shadcn/ui

---

## Workflow Rules (every task, no exceptions)

- `pnpm lint` must pass before committing
- `pnpm typecheck` must pass before committing
- After every commit, verify graphify post-commit hook rebuilt the graph
- Each branch merges to main only when CI is fully green

---

## Feature Roadmap

### ✅ Phase 0 — Foundation (merged to main)
- [x] App shell — collapsible sidebar, top bar, dashboard layout
- [x] Clerk auth — sign-in, sign-up, org selection
- [x] RBAC — Clerk Organizations, roles: `org:admin`, `org:accountant`, `org:viewer`
- [x] Billing — Clerk Billing sync, plan enforcement (free/pro/business), billing UI
- [x] CI pipeline — typecheck, lint, unit tests, build (GitHub Actions)

### 🔄 Phase 1 — Chart of Accounts (branch: `feature/chart-of-accounts`)
- [x] Convex schema — `accounts` table with hierarchy (`parentId`)
- [x] Backend — `list`, `create`, `update`, `archive`, `restore`
- [x] UI — grouped table by type, search, archive/restore, RBAC guards
- [x] Form — create/edit sheet with Zod validation
- [x] **Parent account field in form**
- [x] **Indented hierarchy in table**

### 📋 Phase 2 — Journal Entries (branch: `feature/journal-entries`)
- [ ] Schema — `journalEntries` + `journalLines` tables
- [ ] Backend — `list`, `get`, `create`, `post`, `remove`
- [ ] Balance validation — sum(debits) = sum(credits), min 2 lines
- [x] UI — entries list page (`/dashboard/transactions`)
- [x] UI — entry detail page (`/dashboard/transactions/[id]`)
- [x] Form — dynamic debit/credit line rows, live balance indicator
- [x] RBAC — editors create/post/delete, viewers read-only
- [x] **Performance — all dashboard pages converted to RSC with preloadQuery** (spec: `docs/superpowers/specs/2026-05-17-server-components-preloadquery-design.md`, plan: `docs/superpowers/plans/2026-05-17-server-components-preloadquery.md`)

### 📊 Phase 3 — Core Reports (branch: `feature/reports`)
- [ ] Backend — `trialBalance`, `balanceSheet`, `incomeStatement` queries
- [ ] UI — tabbed reports page (`/dashboard/reports`)
- [ ] Date/range pickers per report tab
- [ ] Currency formatting + deficit highlighting
- [ ] Client-side CSV export

---

## Data Model Summary

```
organizations   ← synced from Clerk via webhook
users           ← synced from Clerk via webhook
accounts        ← chart of accounts (hierarchical)
journalEntries  ← double-entry transaction headers
journalLines    ← debit/credit lines per entry
```

---

## Branch Strategy

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Stable, CI-green | Active |
| `feature/chart-of-accounts` | Phase 1 | In progress |
| `feature/journal-entries` | Phase 2 | Not started |
| `feature/reports` | Phase 3 | Not started |
| `feature/billing-plans` | Billing UI | Merged |
| `feature/org-rbac` | RBAC foundation | Merged |
| `feature/shadcn-layout` | App shell | Merged |

---

## Out of Scope (MVP)

- Bank reconciliation
- Invoicing / accounts receivable
- Multi-currency
- Recurring journal entries
- Audit log
