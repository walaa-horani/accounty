"use client";

import { usePreloadedQuery, useMutation } from "convex/react";
import type { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TopBar } from "@/components/layout/top-bar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/journal-entries";
import { useOrganization } from "@clerk/nextjs";
import { useState } from "react";

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
    month: "long",
    day: "numeric",
  });
}

interface Props {
  preloaded: Preloaded<typeof api.invoices.get>;
}

export function InvoiceDetailClient({ preloaded }: Props) {
  const invoice = usePreloadedQuery(preloaded);
  const cancel = useMutation(api.invoices.cancel);
  const { membership } = useOrganization();
  const [canceling, setCanceling] = useState(false);

  const canEdit =
    membership?.role === "org:admin" || membership?.role === "org:accountant";

  if (!invoice) {
    return (
      <>
        <TopBar title="Invoice" />
        <main className="flex-1 p-4 md:p-6">
          <p className="text-muted-foreground text-sm">Invoice not found.</p>
        </main>
      </>
    );
  }

  async function handleCancel() {
    if (!confirm("Cancel this invoice? This cannot be undone.")) return;
    setCanceling(true);
    try {
      await cancel({ id: invoice!._id });
    } finally {
      setCanceling(false);
    }
  }

  return (
    <>
      <TopBar title="Invoice" />
      <main className="flex-1 p-4 md:p-6 max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/invoices"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="size-3.5" />
            All invoices
          </Link>
        </div>

        {/* Header card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{invoice.customerName}</CardTitle>
                {invoice.customerEmail && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {invoice.customerEmail}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_VARIANT[invoice.status] ?? "outline"}>
                  {invoice.status}
                </Badge>
                {invoice.isRecurring && invoice.frequency && (
                  <Badge variant="outline" className="gap-1">
                    <RefreshCw className="size-3" />
                    {FREQUENCY_LABELS[invoice.frequency]}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{invoice.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Start date</p>
                <p>{formatDate(invoice.startDate)}</p>
              </div>
              {invoice.endDate && (
                <div>
                  <p className="text-muted-foreground text-xs">End date</p>
                  <p>{formatDate(invoice.endDate)}</p>
                </div>
              )}
              {invoice.nextGenerationDate && (
                <div>
                  <p className="text-muted-foreground text-xs">Next generation</p>
                  <p>{formatDate(invoice.nextGenerationDate)}</p>
                </div>
              )}
              {invoice.lastGeneratedAt && (
                <div>
                  <p className="text-muted-foreground text-xs">Last generated</p>
                  <p>{formatDate(invoice.lastGeneratedAt)}</p>
                </div>
              )}
              {invoice.parentInvoiceId && (
                <div>
                  <p className="text-muted-foreground text-xs">Generated from</p>
                  <Link
                    href={`/dashboard/invoices/${invoice.parentInvoiceId}`}
                    className="underline hover:no-underline text-sm"
                  >
                    Recurring template
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right w-20">Qty</TableHead>
                  <TableHead className="text-right w-28">Unit price</TableHead>
                  <TableHead className="text-right w-28">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lines.map((line) => (
                  <TableRow key={line._id}>
                    <TableCell className="text-sm">{line.description}</TableCell>
                    <TableCell className="text-right text-sm">{line.quantity}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(line.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(line.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 bg-muted/50 font-semibold">
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(invoice.totalAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Actions */}
        {canEdit && invoice.status !== "canceled" && (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={canceling}
            >
              {canceling ? "Canceling…" : "Cancel Invoice"}
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
