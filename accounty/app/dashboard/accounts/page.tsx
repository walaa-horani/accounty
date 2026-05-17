"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Plus, Search, MoreHorizontal, Pencil, Archive, RotateCcw } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";

type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

const TYPE_ORDER: AccountType[] = ["asset", "liability", "equity", "income", "expense"];

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
}

export default function AccountsPage() {
  const accounts = useQuery(api.accounts.list);
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
    if (!accounts) return null;
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
    if (!filtered) return null;
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
        {accounts === undefined && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {grouped &&
          TYPE_ORDER.map((type) => {
            const rows = grouped.get(type) ?? [];
            if (rows.length === 0) return null;
            return (
              <div key={type} className="rounded-md border">
                <div className={`flex items-center gap-2 px-4 py-2 border-b text-sm font-semibold ${TYPE_COLORS[type]} rounded-t-md`}>
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
                      <TableHead className="hidden md:table-cell">Normal Balance</TableHead>
                      <TableHead className="hidden sm:table-cell">Description</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((account) => (
                      <TableRow
                        key={account._id}
                        className={!account.isActive ? "opacity-50" : ""}
                      >
                        <TableCell className="font-mono text-sm">
                          {account.number}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{account.name}</span>
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
                                  <Button variant="ghost" size="icon" className="size-8" />
                                }
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(account as Account)}>
                                  <Pencil className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {account.isActive ? (
                                  <DropdownMenuItem
                                    onClick={() => void archive({ id: account._id })}
                                    className="text-destructive"
                                  >
                                    <Archive className="size-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => void restore({ id: account._id })}
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

        {grouped &&
          Array.from(grouped.values()).every((r) => r.length === 0) && (
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
