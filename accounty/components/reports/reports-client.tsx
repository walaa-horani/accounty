"use client";

import { useState } from "react";
import { usePreloadedQuery, useQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TopBar } from "@/components/layout/top-bar";
import { UpgradeBanner } from "@/components/billing/upgrade-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/journal-entries";

type Plan = "free_org" | "pro" | "business";
const PLAN_PRIORITY: Record<Plan, number> = { free_org: 0, pro: 1, business: 2 };

type AccountRow = {
  _id: Id<"accounts">;
  number: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  normalBalance: "debit" | "credit";
  totalDebit: number;
  totalCredit: number;
  balance: number;
};

type Tab = "trial-balance" | "income-statement" | "balance-sheet";

const TABS: { id: Tab; label: string }[] = [
  { id: "trial-balance", label: "Trial Balance" },
  { id: "income-statement", label: "Income Statement" },
  { id: "balance-sheet", label: "Balance Sheet" },
];

interface Props {
  preloadedBilling: Preloaded<typeof api.billing.getOrgBilling>;
}

export function ReportsClient({ preloadedBilling }: Props) {
  const billing = usePreloadedQuery(preloadedBilling);
  const plan = (billing?.plan ?? "free_org") as Plan;

  if (PLAN_PRIORITY[plan] < PLAN_PRIORITY["pro"]) {
    return (
      <>
        <TopBar title="Reports" />
        <main className="flex-1 p-4 md:p-6">
          <UpgradeBanner requiredPlan="pro" currentPlan={plan} />
        </main>
      </>
    );
  }

  return <ReportsContent />;
}

function ReportsContent() {
  const [tab, setTab] = useState<Tab>("trial-balance");
  const data = useQuery(api.reports.trialBalance) as AccountRow[] | undefined;

  return (
    <>
      <TopBar title="Reports" />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex gap-1 border-b">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!data && <p className="text-sm text-muted-foreground">Loading…</p>}
        {data && tab === "trial-balance" && <TrialBalanceTab data={data} />}
        {data && tab === "income-statement" && <IncomeStatementTab data={data} />}
        {data && tab === "balance-sheet" && <BalanceSheetTab data={data} />}
      </main>
    </>
  );
}

function TrialBalanceTab({ data }: { data: AccountRow[] }) {
  const totalDebit = data.reduce((s, a) => s + a.totalDebit, 0);
  const totalCredit = data.reduce((s, a) => s + a.totalCredit, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trial Balance</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Acct #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
            {data.map((row) => (
              <TableRow key={row._id}>
                <TableCell className="font-mono text-xs">{row.number}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {row.totalDebit > 0 ? formatCurrency(row.totalDebit) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {row.totalCredit > 0 ? formatCurrency(row.totalCredit) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-medium">
                  {formatCurrency(row.balance)}
                </TableCell>
              </TableRow>
            ))}
            {data.length > 0 && (
              <TableRow className="border-t-2 font-semibold bg-muted/50">
                <TableCell colSpan={2}>Totals</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(totalDebit)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(totalCredit)}
                </TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function IncomeStatementTab({ data }: { data: AccountRow[] }) {
  const revenues = data.filter((a) => a.type === "income");
  const expenses = data.filter((a) => a.type === "expense");
  const totalRevenue = revenues.reduce((s, a) => s + a.balance, 0);
  const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-4">
      <ReportSection title="Revenue" rows={revenues} total={totalRevenue} totalLabel="Total Revenue" />
      <ReportSection title="Expenses" rows={expenses} total={totalExpenses} totalLabel="Total Expenses" />
      <Card>
        <CardContent className="py-4 flex justify-between items-center">
          <span className="font-semibold">Net Income</span>
          <span className={cn("font-mono font-bold text-lg", netIncome >= 0 ? "text-emerald-600" : "text-destructive")}>
            {formatCurrency(netIncome)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

function BalanceSheetTab({ data }: { data: AccountRow[] }) {
  const netIncome =
    data.filter((a) => a.type === "income").reduce((s, a) => s + a.balance, 0) -
    data.filter((a) => a.type === "expense").reduce((s, a) => s + a.balance, 0);

  const assets = data.filter((a) => a.type === "asset");
  const liabilities = data.filter((a) => a.type === "liability");
  const equityAccounts = data.filter((a) => a.type === "equity");

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
  const totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0) + netIncome;

  return (
    <div className="space-y-4">
      <ReportSection title="Assets" rows={assets} total={totalAssets} totalLabel="Total Assets" />
      <ReportSection title="Liabilities" rows={liabilities} total={totalLiabilities} totalLabel="Total Liabilities" />
      <ReportSection
        title="Equity"
        rows={equityAccounts}
        total={totalEquity}
        totalLabel="Total Equity"
        extra={{ label: "Net Income", value: netIncome }}
      />
      <Card>
        <CardContent className="py-4 flex justify-between items-center">
          <span className="font-semibold">Total Liabilities + Equity</span>
          <span className="font-mono font-bold text-lg">
            {formatCurrency(totalLiabilities + totalEquity)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportSection({
  title,
  rows,
  total,
  totalLabel,
  extra,
}: {
  title: string;
  rows: AccountRow[];
  total: number;
  totalLabel: string;
  extra?: { label: string; value: number };
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground text-sm italic py-3 px-4">
                  No {title.toLowerCase()} accounts.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell className="font-mono text-xs w-20">{row.number}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(row.balance)}
                </TableCell>
              </TableRow>
            ))}
            {extra && (
              <TableRow className="text-muted-foreground">
                <TableCell colSpan={2} className="italic">{extra.label}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(extra.value)}
                </TableCell>
              </TableRow>
            )}
            <TableRow className="border-t-2 font-semibold bg-muted/50">
              <TableCell colSpan={2}>{totalLabel}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(total)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
