"use client";

import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { calcBalance, formatCurrency } from "@/lib/journal-entries";

const lineSchema = z.object({
  accountId: z.string().min(1, "Select an account."),
  debit: z.number().min(0),
  credit: z.number().min(0),
});

const entrySchema = z.object({
  date: z.string().min(1, "Date is required."),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters.")
    .max(250, "Description must be 250 characters or fewer."),
  lines: z
    .array(lineSchema)
    .min(2, "At least 2 lines required.")
    .superRefine((lines, ctx) => {
      const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
      const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        ctx.addIssue({
          code: "custom",
          path: [],
          message: "Debits must equal credits.",
        });
      }
    }),
});

type EntryFormValues = z.infer<typeof entrySchema>;

const BLANK_LINE = { accountId: "", debit: 0, credit: 0 };

interface JournalEntryFormProps {
  open: boolean;
  onClose: () => void;
}

export function JournalEntryForm({ open, onClose }: JournalEntryFormProps) {
  const create = useMutation(api.journalEntries.create);
  const accounts = useQuery(api.accounts.list);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      description: "",
      lines: [{ ...BLANK_LINE }, { ...BLANK_LINE }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watchedLines = watch("lines");
  const balance = calcBalance(watchedLines ?? []);

  useEffect(() => {
    if (open) {
      reset({
        date: new Date().toISOString().slice(0, 10),
        description: "",
        lines: [{ ...BLANK_LINE }, { ...BLANK_LINE }],
      });
    }
  }, [open, reset]);

  async function onSubmit(values: EntryFormValues) {
    try {
      await create({
        date: new Date(values.date).getTime(),
        description: values.description,
        lines: values.lines.map((l) => ({
          accountId: l.accountId as Id<"accounts">,
          debit: l.debit,
          credit: l.credit,
        })),
      });
      onClose();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Something went wrong.";
      const clean =
        raw.match(/Uncaught Error: (.+?) at handler/)?.[1]?.trim() ?? raw;
      setError("root", { message: clean });
    }
  }

  const activeAccounts = (accounts ?? []).filter((a) => a.isActive);
  const canSave =
    balance.isBalanced && balance.totalDebit > 0 && !isSubmitting;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Journal Entry</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4 px-1"
        >
          {/* Date + Description */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g. Office supplies"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Lines grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_80px_80px_32px] gap-2 px-1 text-xs text-muted-foreground">
              <span>Account</span>
              <span>Debit</span>
              <span>Credit</span>
              <span />
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_80px_80px_32px] gap-2 items-center"
              >
                <div className="min-w-0">
                  <Controller
                    name={`lines.${index}.accountId`}
                    control={control}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className="h-8 text-sm" aria-label={`Account for line ${index + 1}`}>
                          <SelectValue placeholder="Select account">
                            {(() => {
                              const acct = activeAccounts.find((a) => a._id === f.value);
                              return acct ? `${acct.number} — ${acct.name}` : undefined;
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {activeAccounts.map((a) => (
                            <SelectItem key={a._id} value={a._id}>
                              {a.number} — {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.lines?.[index]?.accountId && (
                    <p className="text-xs text-destructive mt-0.5">
                      {errors.lines[index].accountId.message}
                    </p>
                  )}
                </div>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-8 text-sm text-right"
                  placeholder="0.00"
                  {...register(`lines.${index}.debit`, {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-8 text-sm text-right"
                  placeholder="0.00"
                  {...register(`lines.${index}.credit`, {
                    valueAsNumber: true,
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  aria-label={`Remove line ${index + 1}`}
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => append({ ...BLANK_LINE })}
            >
              <Plus className="size-3.5" />
              Add Line
            </Button>
          </div>

          {/* Balance banner */}
          {balance.isBalanced && balance.totalDebit > 0 ? (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 flex justify-between">
              <span>✓ Balanced</span>
              <span className="font-medium">
                Debits {formatCurrency(balance.totalDebit)} · Credits{" "}
                {formatCurrency(balance.totalCredit)}
              </span>
            </div>
          ) : (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex justify-between">
              <span>
                {balance.totalDebit === 0 && balance.totalCredit === 0
                  ? "Enter amounts"
                  : `⚠ Off by ${formatCurrency(balance.difference)}`}
              </span>
              <span className="font-medium">
                Debits {formatCurrency(balance.totalDebit)} · Credits{" "}
                {formatCurrency(balance.totalCredit)}
              </span>
            </div>
          )}

          {errors.root &&
            (errors.root.message?.includes("Upgrade to create more") ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start gap-2">
                <Sparkles className="size-4 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-medium">Transaction limit reached</p>
                  <p className="text-amber-700">{errors.root.message}</p>
                  <Link
                    href="/dashboard/settings/billing"
                    className="font-medium underline hover:no-underline"
                  >
                    View plans &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            ))}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={!canSave} className="flex-1">
              {isSubmitting ? "Saving…" : "Save Entry"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
