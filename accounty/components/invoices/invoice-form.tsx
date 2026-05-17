"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { formatCurrency } from "@/lib/journal-entries";

const lineSchema = z.object({
  description: z.string().min(1, "Required."),
  quantity: z.number().min(0.01, "Must be > 0."),
  unitPrice: z.number().min(0.01, "Must be > 0."),
});

const formSchema = z.object({
  customerName: z.string().min(1, "Customer name is required."),
  customerEmail: z.string().email("Invalid email.").optional().or(z.literal("")),
  description: z.string().min(1, "Description is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional(),
  isRecurring: z.boolean(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  lines: z.array(lineSchema).min(1, "At least one line is required."),
}).refine(
  (d) => !d.isRecurring || !!d.frequency,
  { message: "Frequency is required for recurring invoices.", path: ["frequency"] },
);

type FormValues = z.infer<typeof formSchema>;

const BLANK_LINE = { description: "", quantity: 1, unitPrice: 0 };

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InvoiceForm({ open, onClose }: Props) {
  const create = useMutation(api.invoices.create);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      description: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      isRecurring: false,
      lines: [{ ...BLANK_LINE }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });
  const watchedLines = watch("lines");
  const isRecurring = watch("isRecurring");
  const total = watchedLines.reduce(
    (s, l) => s + (l.quantity ?? 0) * (l.unitPrice ?? 0),
    0,
  );

  useEffect(() => {
    if (open) reset({
      customerName: "",
      customerEmail: "",
      description: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      isRecurring: false,
      lines: [{ ...BLANK_LINE }],
    });
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    try {
      await create({
        customerName: values.customerName,
        customerEmail: values.customerEmail || undefined,
        description: values.description,
        startDate: new Date(values.startDate).getTime(),
        endDate: values.endDate ? new Date(values.endDate).getTime() : undefined,
        isRecurring: values.isRecurring,
        frequency: values.isRecurring ? values.frequency : undefined,
        lines: values.lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      });
      onClose();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Something went wrong.";
      const clean = raw.match(/Uncaught Error: (.+?) at handler/)?.[1]?.trim() ?? raw;
      setError("root", { message: clean });
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Invoice</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 px-1">
          {/* Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Customer name</Label>
              <Input id="customerName" {...register("customerName")} />
              {errors.customerName && (
                <p className="text-xs text-destructive">{errors.customerName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail">Email (optional)</Label>
              <Input id="customerEmail" type="email" {...register("customerEmail")} />
              {errors.customerEmail && (
                <p className="text-xs text-destructive">{errors.customerEmail.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End date (optional)</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center gap-3 rounded-md border px-3 py-2.5">
            <input
              id="isRecurring"
              type="checkbox"
              className="size-4"
              {...register("isRecurring")}
            />
            <Label htmlFor="isRecurring" className="cursor-pointer mb-0">
              Recurring invoice
            </Label>
          </div>

          {isRecurring && (
            <div className="space-y-1.5">
              <Label htmlFor="frequency">Frequency</Label>
              <Controller
                name="frequency"
                control={control}
                render={({ field: f }) => (
                  <Select value={f.value ?? ""} onValueChange={(v) => v && f.onChange(v)}>
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.frequency && (
                <p className="text-xs text-destructive">{errors.frequency.message}</p>
              )}
            </div>
          )}

          {/* Line items */}
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_70px_90px_32px] gap-2 px-1 text-xs text-muted-foreground">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit price</span>
              <span />
            </div>
            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-[1fr_70px_90px_32px] gap-2 items-start">
                <div>
                  <Input
                    className="h-8 text-sm"
                    placeholder="Item description"
                    {...register(`lines.${i}.description`)}
                  />
                  {errors.lines?.[i]?.description && (
                    <p className="text-xs text-destructive mt-0.5">
                      {errors.lines[i].description?.message}
                    </p>
                  )}
                </div>
                <Input
                  type="number"
                  min={0.01}
                  step="0.01"
                  className="h-8 text-sm text-right"
                  {...register(`lines.${i}.quantity`, { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  min={0.01}
                  step="0.01"
                  className="h-8 text-sm text-right"
                  placeholder="0.00"
                  {...register(`lines.${i}.unitPrice`, { valueAsNumber: true })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  onClick={() => remove(i)}
                  disabled={fields.length <= 1}
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

          {/* Total */}
          <div className="flex justify-between rounded-md bg-muted px-3 py-2 text-sm font-medium">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>

          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving…" : "Save Invoice"}
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
