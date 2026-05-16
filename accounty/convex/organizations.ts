import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { requireOrgMember } from "./lib/withAuth";

export const upsertFromClerk = internalMutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
        imageUrl: args.imageUrl,
      });
    } else {
      await ctx.db.insert("organizations", {
        clerkOrgId: args.clerkOrgId,
        name: args.name,
        slug: args.slug,
        imageUrl: args.imageUrl,
        plan: "free_org",
      });
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId),
      )
      .unique();

    if (org) {
      await ctx.db.delete(org._id);
    }
  },
});

export const getCurrentOrg = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const orgId = (identity as Record<string, unknown>).org_id as
      | string
      | undefined;
    if (!orgId) return null;
    return await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", orgId))
      .unique();
  },
});
