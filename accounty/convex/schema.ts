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
  counters: defineTable({
    orgId: v.string(),
    name: v.string(),
    value: v.number(),
  }).index("by_org_name", ["orgId", "name"]),

  journalEntries: defineTable({
    orgId: v.string(),
    reference: v.string(),
    date: v.number(),
    description: v.string(),
    totalAmount: v.number(),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_reference", ["orgId", "reference"]),

  journalLines: defineTable({
    entryId: v.id("journalEntries"),
    orgId: v.string(),
    accountId: v.id("accounts"),
    debit: v.number(),
    credit: v.number(),
  })
    .index("by_entry", ["entryId"])
    .index("by_org", ["orgId"]),

  invoices: defineTable({
    orgId: v.string(),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    description: v.string(),
    totalAmount: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("canceled"),
    ),
    // Recurring configuration
    isRecurring: v.boolean(),
    frequency: v.optional(
      v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("yearly"),
      ),
    ),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    nextGenerationDate: v.optional(v.number()),
    lastGeneratedAt: v.optional(v.number()),
    // Set on generated instances to link back to the recurring template
    parentInvoiceId: v.optional(v.id("invoices")),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_org", ["orgId"])
    .index("by_org_status", ["orgId", "status"])
    .index("by_isRecurring_nextGenerationDate", ["isRecurring", "nextGenerationDate"]),

  invoiceLines: defineTable({
    invoiceId: v.id("invoices"),
    orgId: v.string(),
    description: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    amount: v.number(),
  })
    .index("by_invoice", ["invoiceId"])
    .index("by_org", ["orgId"]),
});
