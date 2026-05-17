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

  const activeAccounts = accounts.filter((a) => a.isActive).length;
  const thisMonthEntries = entries.filter((e) => e.date >= startOfMonth);
  const totalVolume = thisMonthEntries.reduce((s, e) => s + e.totalAmount, 0);

  const plan = billing?.plan ?? "free_org";

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
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
                      View all {entries.length} entries &rarr;
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
