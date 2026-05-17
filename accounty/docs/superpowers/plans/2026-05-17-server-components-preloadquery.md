# Server Components + preloadQuery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert all four dashboard `page.tsx` files from `"use client"` to async Server Components that preload Convex data, eliminating the loading flash on first paint while preserving real-time updates.

**Architecture:** Each `page.tsx` becomes an async RSC that fetches the Clerk JWT, calls `preloadQuery` in parallel where possible, then renders a co-located `*-client.tsx` that swaps `useQuery` → `usePreloadedQuery`. All state, mutations, and event handlers stay in the client component unchanged.

**Tech Stack:** Next.js 15 App Router, Convex v1.36.1 (`convex/nextjs`, `convex/react`), Clerk (`@clerk/nextjs/server`)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `app/dashboard/page.tsx` | RSC shell — preloads 3 queries in parallel |
| Create | `components/dashboard/dashboard-client.tsx` | Client component for dashboard stats + quick actions |
| Modify | `app/dashboard/accounts/page.tsx` | RSC shell — preloads accounts.list |
| Create | `components/accounts/accounts-client.tsx` | Client component for accounts table + form |
| Modify | `app/dashboard/transactions/page.tsx` | RSC shell — preloads journalEntries.list |
| Create | `components/journal-entries/transactions-client.tsx` | Client component for entries table + dialogs |
| Modify | `app/dashboard/transactions/[id]/page.tsx` | RSC shell — preloads journalEntries.get with id param |
| Create | `components/journal-entries/transaction-detail-client.tsx` | Client component for entry detail + delete dialog |

---

## Task 1: Dashboard page

**Files:**
- Create: `components/dashboard/dashboard-client.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Create `dashboard-client.tsx`**

  Copy all logic from the current `app/dashboard/page.tsx` into a new client component, replacing the three `useQuery` calls with `usePreloadedQuery`.

  Create `components/dashboard/dashboard-client.tsx`:

  ```tsx
  "use client";

  import { usePreloadedQuery } from "convex/react";
  import type { Preloaded } from "convex/react";
  import { api } from "@/convex/_generated/api";
  import { TopBar } from "@/components/layout/top-bar";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import {
    ArrowLeftRight,
    BookOpen,
    CreditCard,
    BarChart3,
  } from "lucide-react";
  import Link from "next/link";
  import { formatCurrency } from "@/lib/journal-entries";

  const PLAN_LABELS: Record<string, string> = {
    free_org: "Free",
    pro: "Pro",
    business: "Business",
  };

  interface Props {
    preloadedAccounts: Preloaded<typeof api.accounts.list>;
    preloadedEntries: Preloaded<typeof api.journalEntries.list>;
    preloadedBilling: Preloaded<typeof api.billing.getOrgBilling>;
  }

  export function DashboardClient({
    preloadedAccounts,
    preloadedEntries,
    preloadedBilling,
  }: Props) {
    const accounts = usePreloadedQuery(preloadedAccounts);
    const entries = usePreloadedQuery(preloadedEntries);
    const billing = usePreloadedQuery(preloadedBilling);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const activeAccounts = accounts?.filter((a) => a.isActive).length ?? 0;
    const thisMonthEntries = entries?.filter((e) => e.date >= startOfMonth) ?? [];
    const totalVolume = thisMonthEntries.reduce((s, e) => s + e.totalAmount, 0);

    const plan = billing?.plan ?? "free_org";

    return (
      <>
        <TopBar title="Dashboard" />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Accounts
                </CardTitle>
                <BookOpen className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAccounts}</div>
                <CardDescription>Chart of accounts</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Transactions
                </CardTitle>
                <ArrowLeftRight className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{thisMonthEntries.length}</div>
                <CardDescription>This month</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Transaction Volume
                </CardTitle>
                <BarChart3 className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalVolume)}</div>
                <CardDescription>This month</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Plan
                </CardTitle>
                <CreditCard className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant="outline" className="text-base px-2 py-0.5">
                    {PLAN_LABELS[plan] ?? plan}
                  </Badge>
                </div>
                <CardDescription>
                  <Link
                    href="/dashboard/settings/billing"
                    className="underline hover:no-underline"
                  >
                    View plans & billing
                  </Link>
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Recent transactions + Quick actions */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest journal entries</CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No transactions yet.{" "}
                    <Link
                      href="/dashboard/transactions"
                      className="underline hover:no-underline"
                    >
                      Create your first entry.
                    </Link>
                  </p>
                )}
                {entries.length > 0 && (
                  <div className="space-y-1">
                    {entries.slice(0, 5).map((entry) => (
                      <Link
                        key={entry._id}
                        href={`/dashboard/transactions/${entry._id}`}
                        className="flex items-center justify-between py-1.5 border-b last:border-0 hover:opacity-70 transition-opacity"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-mono">{entry.reference}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.description}
                          </p>
                        </div>
                        <p className="text-sm font-mono ml-4 shrink-0">
                          {formatCurrency(entry.totalAmount)}
                        </p>
                      </Link>
                    ))}
                    {entries.length > 5 && (
                      <Link
                        href="/dashboard/transactions"
                        className="block pt-2 text-xs text-muted-foreground underline hover:no-underline"
                      >
                        View all {entries.length} entries →
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  render={<Link href="/dashboard/accounts" />}
                >
                  <BookOpen className="size-4" />
                  Chart of Accounts
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  render={<Link href="/dashboard/transactions" />}
                >
                  <ArrowLeftRight className="size-4" />
                  Journal Entries
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  render={<Link href="/dashboard/settings/billing" />}
                >
                  <CreditCard className="size-4" />
                  Plans &amp; Billing
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }
  ```

- [ ] **Step 2: Replace `app/dashboard/page.tsx` with RSC shell**

  Overwrite the entire file:

  ```tsx
  import { auth } from "@clerk/nextjs/server";
  import { preloadQuery } from "convex/nextjs";
  import { api } from "@/convex/_generated/api";
  import { DashboardClient } from "@/components/dashboard/dashboard-client";

  export default async function DashboardPage() {
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });

    const [preloadedAccounts, preloadedEntries, preloadedBilling] =
      await Promise.all([
        preloadQuery(api.accounts.list, {}, { token }),
        preloadQuery(api.journalEntries.list, {}, { token }),
        preloadQuery(api.billing.getOrgBilling, {}, { token }),
      ]);

    return (
      <DashboardClient
        preloadedAccounts={preloadedAccounts}
        preloadedEntries={preloadedEntries}
        preloadedBilling={preloadedBilling}
      />
    );
  }
  ```

- [ ] **Step 3: Lint + typecheck**

  ```bash
  pnpm lint && pnpm typecheck
  ```

  Expected: no errors (pre-existing React Compiler warnings are fine).

- [ ] **Step 4: Manual smoke test**

  Start dev server (`pnpm dev` + `npx convex dev`). Navigate to `/dashboard`. The stats cards should render with real numbers immediately — no "—" flash.

- [ ] **Step 5: Commit**

  ```bash
  git add app/dashboard/page.tsx components/dashboard/dashboard-client.tsx
  git commit -m "refactor(dashboard): convert page to RSC with preloadQuery"
  ```

---

## Task 2: Accounts page

**Files:**
- Create: `components/accounts/accounts-client.tsx`
- Modify: `app/dashboard/accounts/page.tsx`

- [ ] **Step 1: Create `accounts-client.tsx`**

  Create `components/accounts/accounts-client.tsx` — full content of the current `app/dashboard/accounts/page.tsx`, converted to a named export client component that receives `preloaded` as a prop:

  ```tsx
  "use client";

  import { useState, useMemo } from "react";
  import { usePreloadedQuery, useMutation } from "convex/react";
  import type { Preloaded } from "convex/react";
  import { api } from "@/convex/_generated/api";
  import { Id } from "@/convex/_generated/dataModel";
  import { TopBar } from "@/components/layout/top-bar";
  import { AccountForm } from "@/components/accounts/account-form";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Badge } from "@/components/ui/badge";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Archive,
    RotateCcw,
  } from "lucide-react";
  import { useOrganization } from "@clerk/nextjs";
  import { buildHierarchy } from "@/lib/accounts";

  type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

  const TYPE_ORDER: AccountType[] = [
    "asset",
    "liability",
    "equity",
    "income",
    "expense",
  ];

  const TYPE_LABELS: Record<AccountType, string> = {
    asset: "Assets",
    liability: "Liabilities",
    equity: "Equity",
    income: "Income",
    expense: "Expenses",
  };

  const TYPE_COLORS: Record<AccountType, string> = {
    asset: "bg-blue-50 text-blue-700 border-blue-200",
    liability: "bg-red-50 text-red-700 border-red-200",
    equity: "bg-purple-50 text-purple-700 border-purple-200",
    income: "bg-green-50 text-green-700 border-green-200",
    expense: "bg-orange-50 text-orange-700 border-orange-200",
  };

  interface Account {
    _id: Id<"accounts">;
    number: string;
    name: string;
    type: AccountType;
    normalBalance: "debit" | "credit";
    description?: string;
    isActive: boolean;
    parentId?: string;
  }

  interface Props {
    preloaded: Preloaded<typeof api.accounts.list>;
  }

  export function AccountsClient({ preloaded }: Props) {
    const accounts = usePreloadedQuery(preloaded);
    const archive = useMutation(api.accounts.archive);
    const restore = useMutation(api.accounts.restore);
    const { membership } = useOrganization();

    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Account | null>(null);

    const isEditor =
      membership?.role === "org:admin" || membership?.role === "org:accountant";

    const filtered = useMemo(() => {
      return accounts.filter((a) => {
        if (!showInactive && !a.isActive) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.number.includes(q) ||
          a.type.includes(q)
        );
      });
    }, [accounts, search, showInactive]);

    const grouped = useMemo(() => {
      const map = new Map<AccountType, Account[]>();
      TYPE_ORDER.forEach((t) => map.set(t, []));
      filtered.forEach((a) => map.get(a.type as AccountType)?.push(a));
      return map;
    }, [filtered]);

    function openCreate() {
      setEditing(null);
      setFormOpen(true);
    }

    function openEdit(account: Account) {
      setEditing(account);
      setFormOpen(true);
    }

    return (
      <>
        <TopBar title="Chart of Accounts" />
        <main className="flex-1 p-4 md:p-6 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInactive((v) => !v)}
              >
                {showInactive ? "Hide Inactive" : "Show Inactive"}
              </Button>
              {isEditor && (
                <Button size="sm" onClick={openCreate} className="gap-1.5">
                  <Plus className="size-4" />
                  New Account
                </Button>
              )}
            </div>
          </div>

          {/* Grouped tables */}
          {TYPE_ORDER.map((type) => {
            const rows = grouped.get(type) ?? [];
            if (rows.length === 0) return null;
            return (
              <div key={type} className="rounded-md border">
                <div
                  className={`flex items-center gap-2 px-4 py-2 border-b text-sm font-semibold ${TYPE_COLORS[type]} rounded-t-md`}
                >
                  {TYPE_LABELS[type]}
                  <span className="ml-auto font-normal text-xs opacity-70">
                    {rows.length} account{rows.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Normal Balance
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Description
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildHierarchy(rows).map(({ account, depth }) => (
                      <TableRow
                        key={account._id}
                        className={!account.isActive ? "opacity-50" : ""}
                      >
                        <TableCell className="font-mono text-sm">
                          {account.number}
                        </TableCell>
                        <TableCell>
                          <span
                            className="font-medium"
                            style={{ paddingLeft: depth * 16 }}
                          >
                            {depth > 0 && (
                              <span className="text-muted-foreground mr-1">
                                ↳
                              </span>
                            )}
                            {account.name}
                          </span>
                          {!account.isActive && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize text-muted-foreground text-sm">
                          {account.normalBalance}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm truncate max-w-xs">
                          {account.description ?? "—"}
                        </TableCell>
                        <TableCell>
                          {isEditor && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                  />
                                }
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEdit(account)}
                                >
                                  <Pencil className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {account.isActive ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void archive({ id: account._id })
                                    }
                                    className="text-destructive"
                                  >
                                    <Archive className="size-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      void restore({ id: account._id })
                                    }
                                  >
                                    <RotateCcw className="size-4 mr-2" />
                                    Restore
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}

          {Array.from(grouped.values()).every((r) => r.length === 0) && (
            <div className="rounded-md border border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No accounts yet.{" "}
                {isEditor && (
                  <button
                    onClick={openCreate}
                    className="underline hover:no-underline"
                  >
                    Create your first account.
                  </button>
                )}
              </p>
            </div>
          )}
        </main>

        <AccountForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          editing={editing}
        />
      </>
    );
  }
  ```

  Note: `accounts` from `usePreloadedQuery` is never `undefined` (it's always the latest snapshot), so the `accounts === undefined` loading guard is removed and the `useMemo` callbacks no longer need null checks.

- [ ] **Step 2: Replace `app/dashboard/accounts/page.tsx` with RSC shell**

  ```tsx
  import { auth } from "@clerk/nextjs/server";
  import { preloadQuery } from "convex/nextjs";
  import { api } from "@/convex/_generated/api";
  import { AccountsClient } from "@/components/accounts/accounts-client";

  export default async function AccountsPage() {
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });
    const preloaded = await preloadQuery(api.accounts.list, {}, { token });
    return <AccountsClient preloaded={preloaded} />;
  }
  ```

- [ ] **Step 3: Lint + typecheck**

  ```bash
  pnpm lint && pnpm typecheck
  ```

  Expected: no errors.

- [ ] **Step 4: Manual smoke test**

  Navigate to `/dashboard/accounts`. Accounts table should render immediately with no "Loading…" text. Search, archive, and restore should still work.

- [ ] **Step 5: Commit**

  ```bash
  git add app/dashboard/accounts/page.tsx components/accounts/accounts-client.tsx
  git commit -m "refactor(accounts): convert page to RSC with preloadQuery"
  ```

---

## Task 3: Transactions list page

**Files:**
- Create: `components/journal-entries/transactions-client.tsx`
- Modify: `app/dashboard/transactions/page.tsx`

- [ ] **Step 1: Create `transactions-client.tsx`**

  Create `components/journal-entries/transactions-client.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";
  import { usePreloadedQuery, useMutation } from "convex/react";
  import type { Preloaded } from "convex/react";
  import { useRouter } from "next/navigation";
  import { api } from "@/convex/_generated/api";
  import { Id } from "@/convex/_generated/dataModel";
  import { TopBar } from "@/components/layout/top-bar";
  import { JournalEntryForm } from "@/components/journal-entries/journal-entry-form";
  import { Button } from "@/components/ui/button";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Plus, Trash2 } from "lucide-react";
  import { useOrganization } from "@clerk/nextjs";
  import { formatCurrency } from "@/lib/journal-entries";

  interface Props {
    preloaded: Preloaded<typeof api.journalEntries.list>;
  }

  export function TransactionsClient({ preloaded }: Props) {
    const entries = usePreloadedQuery(preloaded);
    const remove = useMutation(api.journalEntries.remove);
    const { membership } = useOrganization();
    const router = useRouter();

    const [formOpen, setFormOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<Id<"journalEntries"> | null>(null);

    const isEditor =
      membership?.role === "org:admin" || membership?.role === "org:accountant";
    const isAdmin = membership?.role === "org:admin";

    async function handleDelete() {
      if (!deleteId) return;
      await remove({ id: deleteId });
      setDeleteId(null);
    }

    return (
      <>
        <TopBar title="Transactions" />
        <main className="flex-1 p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-end">
            {isEditor && (
              <Button
                size="sm"
                onClick={() => setFormOpen(true)}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                New Entry
              </Button>
            )}
          </div>

          {entries.length === 0 && (
            <div className="rounded-md border border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No journal entries yet.{" "}
                {isEditor && (
                  <button
                    onClick={() => setFormOpen(true)}
                    className="underline hover:no-underline"
                  >
                    Create your first entry.
                  </button>
                )}
              </p>
            </div>
          )}

          {entries.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Reference</TableHead>
                    <TableHead className="w-36">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-32">Amount</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow
                      key={entry._id}
                      className="cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/transactions/${entry._id}`)
                      }
                    >
                      <TableCell className="font-mono text-sm">
                        {entry.reference}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.description}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(entry.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(entry._id);
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>

        <JournalEntryForm open={formOpen} onClose={() => setFormOpen(false)} />

        <Dialog
          open={!!deleteId}
          onOpenChange={(o) => !o && setDeleteId(null)}
        >
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Delete this entry?</DialogTitle>
              <DialogDescription>
                This permanently deletes the journal entry and all its lines.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  ```

- [ ] **Step 2: Replace `app/dashboard/transactions/page.tsx` with RSC shell**

  ```tsx
  import { auth } from "@clerk/nextjs/server";
  import { preloadQuery } from "convex/nextjs";
  import { api } from "@/convex/_generated/api";
  import { TransactionsClient } from "@/components/journal-entries/transactions-client";

  export default async function TransactionsPage() {
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });
    const preloaded = await preloadQuery(api.journalEntries.list, {}, { token });
    return <TransactionsClient preloaded={preloaded} />;
  }
  ```

- [ ] **Step 3: Lint + typecheck**

  ```bash
  pnpm lint && pnpm typecheck
  ```

  Expected: no errors.

- [ ] **Step 4: Manual smoke test**

  Navigate to `/dashboard/transactions`. Entries table renders immediately. New Entry form opens; delete dialog works and removes the row after confirmation.

- [ ] **Step 5: Commit**

  ```bash
  git add app/dashboard/transactions/page.tsx components/journal-entries/transactions-client.tsx
  git commit -m "refactor(transactions): convert page to RSC with preloadQuery"
  ```

---

## Task 4: Transaction detail page

**Files:**
- Create: `components/journal-entries/transaction-detail-client.tsx`
- Modify: `app/dashboard/transactions/[id]/page.tsx`

- [ ] **Step 1: Create `transaction-detail-client.tsx`**

  Create `components/journal-entries/transaction-detail-client.tsx`.

  Key changes from current `[id]/page.tsx`:
  - `useParams` removed — `id` is now injected via props
  - `useQuery` replaced with `usePreloadedQuery`
  - Loading/not-found states remain but are now handled differently: `usePreloadedQuery` never returns `undefined`, so only the `null` (not-found) case needs handling

  ```tsx
  "use client";

  import { useState } from "react";
  import { usePreloadedQuery, useMutation } from "convex/react";
  import type { Preloaded } from "convex/react";
  import { useRouter } from "next/navigation";
  import { api } from "@/convex/_generated/api";
  import { Id } from "@/convex/_generated/dataModel";
  import { TopBar } from "@/components/layout/top-bar";
  import { Button } from "@/components/ui/button";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { ArrowLeft, Trash2 } from "lucide-react";
  import Link from "next/link";
  import { useOrganization } from "@clerk/nextjs";
  import { formatCurrency } from "@/lib/journal-entries";

  interface Props {
    id: string;
    preloaded: Preloaded<typeof api.journalEntries.get>;
  }

  export function TransactionDetailClient({ id, preloaded }: Props) {
    const entry = usePreloadedQuery(preloaded);
    const remove = useMutation(api.journalEntries.remove);
    const { membership } = useOrganization();
    const router = useRouter();

    const [showDelete, setShowDelete] = useState(false);
    const isAdmin = membership?.role === "org:admin";

    async function handleDelete() {
      await remove({ id: id as Id<"journalEntries"> });
      router.push("/dashboard/transactions");
    }

    if (entry === null) {
      return (
        <>
          <TopBar title="Transaction" />
          <main className="flex-1 p-4 md:p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Entry not found.</p>
            <Link
              href="/dashboard/transactions"
              className="text-sm underline hover:no-underline"
            >
              ← Back to Transactions
            </Link>
          </main>
        </>
      );
    }

    const total = entry.lines.reduce((s, l) => s + l.debit, 0);

    return (
      <>
        <TopBar title={entry.reference} />
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Back + Delete */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/transactions"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Transactions
            </Link>
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDelete(true)}
                className="gap-1.5"
              >
                <Trash2 className="size-4" />
                Delete Entry
              </Button>
            )}
          </div>

          {/* Header card */}
          <div className="rounded-md border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Reference
                </p>
                <p className="font-mono font-medium">{entry.reference}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Date
                </p>
                <p>
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Description
                </p>
                <p>{entry.description}</p>
              </div>
            </div>
          </div>

          {/* Lines table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right w-36">Debit</TableHead>
                  <TableHead className="text-right w-36">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.lines.map((line, i) => (
                  <TableRow key={line._id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-muted-foreground mr-2">
                        {line.accountNumber}
                      </span>
                      {line.accountName}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {line.debit > 0 ? formatCurrency(line.debit) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {line.credit > 0 ? formatCurrency(line.credit) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold border-t-2">
                  <TableCell />
                  <TableCell className="text-muted-foreground">Total</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(total)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </main>

        <Dialog
          open={showDelete}
          onOpenChange={(o) => !o && setShowDelete(false)}
        >
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Delete {entry.reference}?</DialogTitle>
              <DialogDescription>
                This permanently deletes the journal entry and all its lines.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  ```

- [ ] **Step 2: Replace `app/dashboard/transactions/[id]/page.tsx` with RSC shell**

  ```tsx
  import { auth } from "@clerk/nextjs/server";
  import { preloadQuery } from "convex/nextjs";
  import { api } from "@/convex/_generated/api";
  import { Id } from "@/convex/_generated/dataModel";
  import { TransactionDetailClient } from "@/components/journal-entries/transaction-detail-client";

  export default async function TransactionDetailPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });
    const preloaded = await preloadQuery(
      api.journalEntries.get,
      { id: id as Id<"journalEntries"> },
      { token },
    );
    return <TransactionDetailClient id={id} preloaded={preloaded} />;
  }
  ```

- [ ] **Step 3: Lint + typecheck**

  ```bash
  pnpm lint && pnpm typecheck
  ```

  Expected: no errors.

- [ ] **Step 4: Manual smoke test**

  Click any transaction row from `/dashboard/transactions`. The detail page should render the reference, date, description, and lines immediately with no "Loading…" state. Delete button (admin only) should open the confirm dialog and navigate back on confirm.

- [ ] **Step 5: Commit**

  ```bash
  git add "app/dashboard/transactions/[id]/page.tsx" components/journal-entries/transaction-detail-client.tsx
  git commit -m "refactor(transaction-detail): convert page to RSC with preloadQuery"
  ```

---

## Task 5: Final verification

- [ ] **Step 1: Full lint + typecheck**

  ```bash
  pnpm lint && pnpm typecheck
  ```

  Expected: no errors.

- [ ] **Step 2: Confirm no page.tsx has `"use client"`**

  ```bash
  grep -r '"use client"' app/dashboard --include="*.tsx"
  ```

  Expected: no output.

- [ ] **Step 3: Update graphify**

  ```bash
  graphify update .
  ```

  Expected: graph rebuilt and `graphify-out/GRAPH_REPORT.md` updated.
