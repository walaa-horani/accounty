import { QueryCtx, MutationCtx } from "../_generated/server";
import { requireOrgMember } from "./withAuth";

export type Plan = "free_org" | "pro" | "business";

export async function getOrgPlan(
  ctx: QueryCtx | MutationCtx,
): Promise<Plan | null> {
  const { orgId } = await requireOrgMember(ctx);
  const org = await ctx.db
    .query("organizations")
    .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", orgId))
    .unique();
  return (org?.plan as Plan) ?? null;
}

export async function requirePlan(
  ctx: QueryCtx | MutationCtx,
  requiredPlan: Plan,
) {
  const plan = await getOrgPlan(ctx);
  const hierarchy: Plan[] = ["free_org", "pro", "business"];
  const currentIdx = hierarchy.indexOf(plan ?? "free_org");
  const requiredIdx = hierarchy.indexOf(requiredPlan);

  if (currentIdx < requiredIdx) {
    throw new Error(
      `This feature requires the ${requiredPlan === "pro" ? "Pro" : "Business"} plan.`,
    );
  }
  return plan;
}

export async function requireBusinessPlan(ctx: QueryCtx | MutationCtx) {
  return requirePlan(ctx, "business");
}

export async function requireProPlan(ctx: QueryCtx | MutationCtx) {
  return requirePlan(ctx, "pro");
}
