import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { requireAnyOrgMember } from "./lib/withAuth";

const planValues = v.union(
  v.literal("free_org"),
  v.literal("pro"),
  v.literal("business"),
);

const PLAN_PRIORITY = {
  free_org: 0,
  pro: 1,
  business: 2,
} as const;

const statusValues = v.union(
  v.literal("active"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("ended"),
  v.literal("abandoned"),
  v.literal("incomplete"),
  v.literal("upcoming"),
  v.literal("expired"),
);

export const syncSubscription = internalMutation({
  args: {
    clerkOrgId: v.string(),
    subscriptionId: v.string(),
    planSlug: planValues,
    status: statusValues,
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) =>
        q.eq("clerkOrgId", args.clerkOrgId),
      )
      .unique();

    if (!org) return;

    // Guard against stale lower-tier subscription events overwriting a
    // higher-tier plan. When an org is upgraded from free_org to pro, Clerk
    // may continue firing subscription.updated for the old free_org sub.
    // Only accept the downgrade if it's for the same subscriptionId currently
    // on file (i.e. an in-place plan change), not a stale sibling sub.
    const currentPriority = PLAN_PRIORITY[org.plan];
    const incomingPriority = PLAN_PRIORITY[args.planSlug];
    const isDifferentSub =
      !!org.subscriptionId && org.subscriptionId !== args.subscriptionId;
    if (isDifferentSub && incomingPriority < currentPriority) {
      console.log(
        "[syncSubscription] ignoring stale lower-tier sub",
        args.subscriptionId,
        "current plan:",
        org.plan,
        "incoming plan:",
        args.planSlug,
      );
      return;
    }

    await ctx.db.patch(org._id, {
      plan: args.planSlug,
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
    });
  },
});

export const cancelSubscription = internalMutation({
  args: { subscriptionId: v.string() },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_subscription_id", (q) =>
        q.eq("subscriptionId", args.subscriptionId),
      )
      .unique();

    if (org) {
      await ctx.db.patch(org._id, {
        plan: "free_org",
        subscriptionStatus: "canceled",
      });
    }
  },
});

export const getOrgBilling = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireAnyOrgMember(ctx);
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", orgId))
      .unique();

    if (!org) return null;

    return {
      plan: org.plan,
      subscriptionStatus: org.subscriptionStatus ?? null,
      isActive:
        !org.subscriptionStatus ||
        org.subscriptionStatus === "active" ||
        org.subscriptionStatus === "upcoming",
      isPro: org.plan === "pro" || org.plan === "business",
      isBusiness: org.plan === "business",
    };
  },
});
