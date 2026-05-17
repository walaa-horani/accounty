# Accounty MVP Design

**Date:** 2026-05-17
**Scope:** Chart of Accounts (completion) → Journal Entries → Core Reports
**Stack:** Next.js 16 + Convex + Clerk + Tailwind + shadcn/ui

---

## 1. Chart of Accounts — Close Parent Account Gap

### What exists
- Convex schema: `accounts` table with `parentId?: Id<"accounts">` ✓
- Backend: `list`, `create`, `update`, `archive`, `restore` — all handle `parentId` ✓
- UI: grouped table, sheet form, search, RBAC ✓

### What's missing
- Form has no parent account field — users cannot set `parentId`
- Table shows flat list — no indentation for child accounts

### Changes

**`components/accounts/account-form.tsx`**
- Add optional `Parent Account` select field
- Loads active accounts via `api.accounts.list`
- Filters out the account being edited (no self-parenting)
- Sends `parentId` on create and update (undefined = top-level)

**`app/dashboard/accounts/page.tsx`**
- Extend `Account` interface with `parentId?: Id<"accounts">`
- Within each type group, sort by account number and indent child rows (padding-left) under their parent

### No schema or backend changes required

---

## 2. Journal Entries

### Schema additions (`convex/schema.ts`)

```ts
journalEntries: defineTable({
  orgId: v.string(),
  date: v.string(),           // ISO date "YYYY-MM-DD"
  description: v.string(),
  reference: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("posted")),
  createdBy: v.string(),      // clerkId
})
  .index("by_org", ["orgId"])
  .index("by_org_date", ["orgId", "date"]),

journalLines: defineTable({
  entryId: v.id("journalEntries"),
  accountId: v.id("accounts"),
  type: v.union(v.literal("debit"), v.literal("credit")),
  amount: v.number(),         // integer cents, always positive
  description: v.optional(v.string()),
})
  .index("by_entry", ["entryId"])
  .index("by_account", ["accountId"]),
```

### Backend (`convex/journal.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `list` | query | Entries by org, date desc, includes debit total |
| `get` | query | Single entry with lines + resolved account names |
| `create` | mutation | Insert header + lines; validates balance and min 2 lines |
| `post` | mutation | Draft → posted; posted entries are immutable |
| `remove` | mutation | Draft entries only |

**Balance validation rule:** sum of debit amounts must equal sum of credit amounts. Enforced in `create` — throws if unbalanced.

### UI

**`app/dashboard/transactions/page.tsx`**
- Table: date, description, reference, total amount, status badge (draft/posted)
- "New Entry" button (editors only)
- Click row → detail page

**`app/dashboard/transactions/[id]/page.tsx`**
- Entry header fields (read-only when posted)
- Lines table: account name, debit column, credit column
- Post button (editors, draft only) — confirmation required
- Delete button (editors, draft only)

**`components/journal/entry-form.tsx`**
- Sheet: date picker, description, optional reference
- Dynamic line rows: account select, debit/credit amount inputs
- Add/remove line buttons (min 2 lines)
- Running balance indicator — green when balanced, red with difference when not
- Submits only when balanced

### RBAC
Same as accounts: `org:admin` and `org:accountant` can create/post/delete. `org:viewer` is read-only.

---

## 3. Core Reports

### Backend (`convex/reports.ts`)

All reports query posted journal lines only. Computed on-demand — no aggregation tables at MVP scale.

| Function | Args | Returns |
|----------|------|---------|
| `trialBalance` | `{ asOf: string }` | Per-account: number, name, type, totalDebits, totalCredits, netBalance |
| `balanceSheet` | `{ asOf: string }` | Assets, Liabilities, Equity sections with totals; validates Assets = Liabilities + Equity |
| `incomeStatement` | `{ from: string, to: string }` | Income accounts, Expense accounts, net income |

**Net balance rule:**
- Debit-normal accounts (asset, expense): netBalance = totalDebits - totalCredits
- Credit-normal accounts (liability, equity, income): netBalance = totalCredits - totalDebits

### UI (`app/dashboard/reports/page.tsx`)

- Tab bar: Trial Balance | Balance Sheet | Income Statement
- Date/range pickers per tab (default: current month/year-to-date)
- Formatted currency columns (`$12,345.67`), red text for deficits
- Client-side CSV export per report
- Empty state when no posted entries exist

---

## Workflow Rules (apply to every task)

1. After every set of changes: `pnpm lint && pnpm typecheck` must pass before committing
2. After every commit: graphify map updates automatically via post-commit hook — verify it ran
3. Each feature branch merges to main only when lint + typecheck + CI are green

---

## Implementation Order

1. **Close CoA parent field** (this session, ~30 min)
2. **Journal Entries schema + backend** — `convex/schema.ts`, `convex/journal.ts`
3. **Journal Entries UI** — list page, detail page, entry form
4. **Reports backend** — `convex/reports.ts`
5. **Reports UI** — tabbed reports page
