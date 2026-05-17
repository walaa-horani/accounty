"use client";

import { useState } from "react";
import { usePreloadedQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/journal-entries";
import { InvoiceForm } from "./invoice-form";
import { useOrganization } from "@clerk/nextjs";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  active: "default",
  paused: "outline",
  canceled: "destructive",
};

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  preloaded: Preloaded<typeof api.invoices.list>;
}

export function InvoicesClient({ preloaded }: Props) {
  const invoices = usePreloadedQuery(preloaded);
  const { membership } = useOrganization();
  const [formOpen, setFormOpen] = useState(false);

  const canEdit =
    membership?.role === "org:admin" || membership?.role === "org:accountant";

  return (
    <>
      <TopBar title="Invoices" />
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
          {canEdit && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="size-4" />
              New Invoice
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-10"
                    >
                      No invoices yet. Create your first one.
                    </TableCell>
                  </TableRow>
                )}
                {invoices.map((inv) => (
                  <TableRow key={inv._id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link
                        href={`/dashboard/invoices/${inv._id}`}
                        className="block"
                      >
                        <p className="font-medium text-sm">{inv.customerName}</p>
                        {inv.customerEmail && (
                          <p className="text-xs text-muted-foreground">
                            {inv.customerEmail}
                          </p>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm max-w-48 truncate">
                      <Link href={`/dashboard/invoices/${inv._id}`}>
                        {inv.description}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCurrency(inv.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[inv.status] ?? "outline"}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inv.isRecurring && inv.frequency ? (
                        <Badge variant="outline" className="gap-1">
                          <RefreshCw className="size-3" />
                          {FREQUENCY_LABELS[inv.frequency]}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">One-off</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inv.nextGenerationDate
                        ? formatDate(inv.nextGenerationDate)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(inv.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <InvoiceForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
