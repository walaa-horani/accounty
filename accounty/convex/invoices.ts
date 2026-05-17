import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAnyOrgMember, requireEditor } from "./lib/withAuth";

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeNextDate(
  from: number,
  frequency: "daily" | "weekly" | "monthly" | "yearly",
): number {
  const d = new Date(from);
  switch (frequency) {
    case "daily":
      d.setUTCDate(d.getUTCDate() + 1);
      break;
    case "weekly":
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case "monthly":
      d.setUTCMonth(d.getUTCMonth() + 1);
      break;
    case "yearly":
      d.setUTCFullYear(d.getUTCFullYear() + 1);
      break;
  }
  return d.getTime();
}

// ─── Public queries ──────────────────────────────────────────────────────────

export const list = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireAnyOrgMember(ctx);
    return ctx.db
      .query("invoices")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const { orgId } = await requireAnyOrgMember(ctx);
    const invoice = await ctx.db.get(args.id);
    if (!invoice || invoice.orgId !== orgId) return null;

    const lines = await ctx.db
      .query("invoiceLines")
      .withIndex("by_invoice", (q) => q.eq("invoiceId", args.id))
      .collect();

    return { ...invoice, lines };
  },
});

// ─── Public mutations ────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    description: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    isRecurring: v.boolean(),
    frequency: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("yearly"),
      ),
    ),
    lines: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { orgId, identity } = await requireEditor(ctx);

    if (args.lines.length === 0) throw new Error("At least one line is required.");
    if (args.isRecurring && !args.frequency) {
      throw new Error("Frequency is required for recurring invoices.");
    }

    const totalAmount = args.lines.reduce(
      (sum, l) => sum + l.quantity * l.unitPrice,
      0,
    );

    const nextGenerationDate =
      args.isRecurring && args.frequency
        ? computeNextDate(args.startDate, args.frequency)
        : undefined;

    const invoiceId = await ctx.db.insert("invoices", {
      orgId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      description: args.description,
      totalAmount,
      status: args.isRecurring ? "active" : "draft",
      isRecurring: args.isRecurring,
      frequency: args.frequency,
      startDate: args.startDate,
      endDate: args.endDate,
      nextGenerationDate,
      createdBy: identity.subject,
      createdAt: Date.now(),
    });

    for (const line of args.lines) {
      await ctx.db.insert("invoiceLines", {
        invoiceId,
        orgId,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        amount: line.quantity * line.unitPrice,
      });
    }

    return invoiceId;
  },
});

export const cancel = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const { orgId } = await requireEditor(ctx);
    const invoice = await ctx.db.get(args.id);
    if (!invoice || invoice.orgId !== orgId) throw new Error("Not found.");
    await ctx.db.patch(args.id, { status: "canceled" });
  },
});

// ─── Internal — called by cron ───────────────────────────────────────────────

export const generateDueRecurring = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const due = await ctx.db
      .query("invoices")
      .withIndex("by_isRecurring_nextGenerationDate", (q) =>
        q.eq("isRecurring", true).lte("nextGenerationDate", now),
      )
      .collect();

    const active = due.filter((inv) => inv.status === "active");

    for (const template of active) {
      if (!template.frequency || !template.nextGenerationDate) continue;

      if (template.endDate && now > template.endDate) {
        await ctx.db.patch(template._id, { status: "canceled" });
        continue;
      }

      const lines = await ctx.db
        .query("invoiceLines")
        .withIndex("by_invoice", (q) => q.eq("invoiceId", template._id))
        .collect();

      const newId = await ctx.db.insert("invoices", {
        orgId: template.orgId,
        customerName: template.customerName,
        customerEmail: template.customerEmail,
        description: template.description,
        totalAmount: template.totalAmount,
        status: "draft",
        isRecurring: false,
        startDate: now,
        parentInvoiceId: template._id,
        createdBy: "system:cron",
        createdAt: now,
      });

      for (const line of lines) {
        await ctx.db.insert("invoiceLines", {
          invoiceId: newId,
          orgId: template.orgId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: line.amount,
        });
      }

      await ctx.db.patch(template._id, {
        lastGeneratedAt: now,
        nextGenerationDate: computeNextDate(
          template.nextGenerationDate,
          template.frequency,
        ),
      });
    }

    console.log(`[cron] generateDueRecurring: processed ${active.length} templates`);
  },
});
