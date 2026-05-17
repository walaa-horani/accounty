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
