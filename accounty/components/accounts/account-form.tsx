"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
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

// ── Zod schema ────────────────────────────────────────────────────────────────

const accountSchema = z.object({
  number: z
    .string()
    .min(1, "Account number is required.")
    .max(20, "Account number must be 20 characters or fewer.")
    .regex(/^\d+$/, "Account number must contain digits only."),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or fewer."),
  type: z.enum(["asset", "liability", "equity", "income", "expense"], {
    errorMap: () => ({ message: "Please select an account type." }),
  }),
  description: z
    .string()
    .max(250, "Description must be 250 characters or fewer.")
    .optional()
    .or(z.literal("")),
});

type AccountFormValues = z.infer<typeof accountSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────

const ACCOUNT_TYPES = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
] as const;

interface Account {
  _id: Id<"accounts">;
  number: string;
  name: string;
  type: AccountFormValues["type"];
  description?: string;
}

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Account | null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AccountForm({ open, onClose, editing }: AccountFormProps) {
  const create = useMutation(api.accounts.create);
  const update = useMutation(api.accounts.update);
  const isEditing = !!editing;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      number: "",
      name: "",
      type: "asset",
      description: "",
    },
  });

  // Reset form values whenever the sheet opens or the editing target changes
  useEffect(() => {
    if (open) {
      reset({
        number: editing?.number ?? "",
        name: editing?.name ?? "",
        type: editing?.type ?? "asset",
        description: editing?.description ?? "",
      });
    }
  }, [open, editing, reset]);

  async function onSubmit(values: AccountFormValues) {
    try {
      const description = values.description || undefined;
      if (isEditing) {
        await update({ id: editing._id, ...values, description });
      } else {
        await create({ ...values, description });
      }
      onClose();
    } catch (err) {
      // Surface server errors (e.g. duplicate account number) on the field
      const message = err instanceof Error ? err.message : "Something went wrong.";
      if (message.toLowerCase().includes("number")) {
        setError("number", { message });
      } else {
        setError("root", { message });
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Account" : "New Account"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 px-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Account number */}
            <div className="space-y-1.5">
              <Label htmlFor="number">Account No.</Label>
              <Input
                id="number"
                placeholder="1000"
                {...register("number")}
              />
              {errors.number && (
                <p className="text-xs text-destructive">{errors.number.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Cash and Cash Equivalents"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="description"
              placeholder="Short description"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Root / server error */}
          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? "Saving…"
                : isEditing
                  ? "Save Changes"
                  : "Create Account"}
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
