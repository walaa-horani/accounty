"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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

export default function TransactionsPage() {
  const entries = useQuery(api.journalEntries.list);
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

        {entries === undefined && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {entries && entries.length === 0 && (
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

        {entries && entries.length > 0 && (
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
