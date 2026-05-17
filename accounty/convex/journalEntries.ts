import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireEditor,
  requireAnyOrgMember,
  requireRole,
} from "./lib/withAuth";
import { getOrgPlan } from "./lib/planGate";

const TRANSACTION_LIMITS: Partial<Record<string, number>> = {
  free_org: 1,
  pro: 3,
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireAnyOrgMember(ctx);
    return await ctx.db
      .query("journalEntries")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .order("desc")
      .take(100); // pagination deferred to Phase 3 — cap at 100 for MVP
  },
});

export const get = query({
  args: { id: v.id("journalEntries") },
  handler: async (ctx, args) => {
    const { orgId } = await requireAnyOrgMember(ctx);
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.orgId !== orgId) return null;

    const lines = await ctx.db
      .query("journalLines")
      .withIndex("by_entry", (q) => q.eq("entryId", args.id))
      .collect();

    const linesWithAccounts = await Promise.all(
      lines.map(async (line) => {
        const account = await ctx.db.get(line.accountId);
        return {
          ...line,
          accountNumber: account?.number ?? "",
          accountName: account?.name ?? "",
        };
      }),
    );

    return { ...entry, lines: linesWithAccounts };
  },
});

export const create = mutation({
  args: {
    date: v.number(),
    description: v.string(),
    lines: v.array(
      v.object({
        accountId: v.id("accounts"),
        debit: v.number(),
        credit: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { orgId, identity } = await requireEditor(ctx);

    const plan = await getOrgPlan(ctx);
    const limit = TRANSACTION_LIMITS[plan ?? "free_org"];
    if (limit !== undefined) {
      const existing = await ctx.db
        .query("journalEntries")
        .withIndex("by_org", (q) => q.eq("orgId", orgId))
        .collect();
      if (existing.length >= limit) {
        throw new Error(
          `Your ${plan === "pro" ? "Pro" : "Free"} plan allows up to ${limit} transaction${limit === 1 ? "" : "s"}. Upgrade to create more.`,
        );
      }
    }

    if (args.lines.length < 2) throw new Error("At least 2 lines required.");
    const totalDebit = args.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = args.lines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001)
      throw new Error("Debits must equal credits.");
    if (totalDebit === 0) throw new Error("Entry amount cannot be zero.");

    const counter = await ctx.db
      .query("counters")
      .withIndex("by_org_name", (q) =>
        q.eq("orgId", orgId).eq("name", "journalEntry"),
      )
      .unique();

    let nextNum: number;
    if (counter) {
      nextNum = counter.value + 1;
      await ctx.db.patch(counter._id, { value: nextNum });
    } else {
      nextNum = 1;
      await ctx.db.insert("counters", {
        orgId,
        name: "journalEntry",
        value: 1,
      });
    }

    const reference = `JE-${String(nextNum).padStart(4, "0")}`;

    const entryId = await ctx.db.insert("journalEntries", {
      orgId,
      reference,
      date: args.date,
      description: args.description,
      totalAmount: totalDebit,
      createdBy: identity.subject,
      createdAt: Date.now(),
    });

    for (const line of args.lines) {
      await ctx.db.insert("journalLines", {
        entryId,
        orgId,
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
      });
    }

    return entryId;
  },
});

export const remove = mutation({
  args: { id: v.id("journalEntries") },
  handler: async (ctx, args) => {
    const { orgId } = await requireRole(ctx, ["org:admin"]);
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.orgId !== orgId) throw new Error("Not found.");

    const lines = await ctx.db
      .query("journalLines")
      .withIndex("by_entry", (q) => q.eq("entryId", args.id))
      .collect();
    for (const line of lines) await ctx.db.delete(line._id);
    await ctx.db.delete(args.id);
  },
});
