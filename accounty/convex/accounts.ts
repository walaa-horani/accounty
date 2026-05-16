import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAnyOrgMember, requireEditor } from "./lib/withAuth";

const accountType = v.union(
  v.literal("asset"),
  v.literal("liability"),
  v.literal("equity"),
  v.literal("income"),
  v.literal("expense"),
);

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const orgId = (identity as Record<string, unknown>).org_id as string | undefined;
    if (!orgId) return null;

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    return accounts;
  },
});

export const create = mutation({
  args: {
    number: v.string(),
    name: v.string(),
    type: accountType,
    description: v.optional(v.string()),
    parentId: v.optional(v.id("accounts")),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireEditor(ctx);

    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_org_number", (q) =>
        q.eq("orgId", orgId).eq("number", args.number),
      )
      .unique();

    if (existing) throw new Error("Account number already exists.");

    const normalBalance: "debit" | "credit" =
      args.type === "asset" || args.type === "expense" ? "debit" : "credit";

    return await ctx.db.insert("accounts", {
      orgId,
      number: args.number,
      name: args.name,
      type: args.type,
      normalBalance,
      description: args.description,
      parentId: args.parentId,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("accounts"),
    number: v.string(),
    name: v.string(),
    type: accountType,
    description: v.optional(v.string()),
    parentId: v.optional(v.id("accounts")),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireEditor(ctx);
    const account = await ctx.db.get(args.id);
    if (!account || account.orgId !== orgId) throw new Error("Not found.");

    const duplicate = await ctx.db
      .query("accounts")
      .withIndex("by_org_number", (q) =>
        q.eq("orgId", orgId).eq("number", args.number),
      )
      .unique();

    if (duplicate && duplicate._id !== args.id)
      throw new Error("Account number already exists.");

    const normalBalance: "debit" | "credit" =
      args.type === "asset" || args.type === "expense" ? "debit" : "credit";

    await ctx.db.patch(args.id, {
      number: args.number,
      name: args.name,
      type: args.type,
      normalBalance,
      description: args.description,
      parentId: args.parentId,
    });
  },
});

export const archive = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const { orgId } = await requireEditor(ctx);
    const account = await ctx.db.get(args.id);
    if (!account || account.orgId !== orgId) throw new Error("Not found.");
    await ctx.db.patch(args.id, { isActive: false });
  },
});

export const restore = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const { orgId } = await requireEditor(ctx);
    const account = await ctx.db.get(args.id);
    if (!account || account.orgId !== orgId) throw new Error("Not found.");
    await ctx.db.patch(args.id, { isActive: true });
  },
});
