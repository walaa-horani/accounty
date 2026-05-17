import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),
  organizations: defineTable({
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    plan: v.union(v.literal("free_org"), v.literal("pro"), v.literal("business")),
    imageUrl: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("past_due"),
        v.literal("canceled"),
        v.literal("ended"),
        v.literal("abandoned"),
        v.literal("incomplete"),
        v.literal("upcoming"),
        v.literal("expired"),
      ),
    ),
  })
    .index("by_clerk_org_id", ["clerkOrgId"])
    .index("by_subscription_id", ["subscriptionId"]),
  accounts: defineTable({
    orgId: v.string(),
    number: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("asset"),
      v.literal("liability"),
      v.literal("equity"),
      v.literal("income"),
      v.literal("expense"),
    ),
    normalBalance: v.union(v.literal("debit"), v.literal("credit")),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("accounts")),
    isActive: v.boolean(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_type", ["orgId", "type"])
    .index("by_org_number", ["orgId", "number"]),
});
