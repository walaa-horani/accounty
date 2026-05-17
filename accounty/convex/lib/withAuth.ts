import { QueryCtx, MutationCtx } from "../_generated/server";

export type OrgRole = "org:admin" | "org:accountant" | "org:viewer";

export const EDITOR_ROLES: OrgRole[] = ["org:admin", "org:accountant"];
export const ALL_ORG_ROLES: OrgRole[] = [
  "org:admin",
  "org:accountant",
  "org:viewer",
];

// Custom claims added to the Convex JWT template in the Clerk dashboard.
// Must stay in sync with types/globals.d.ts and the JWT template configuration.
interface OrgClaims {
  org_id?: string;
  org_role?: string;
  org_slug?: string;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export async function requireOrgMember(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);
  const { org_id } = identity as typeof identity & OrgClaims;
  if (!org_id) throw new Error("No active organization");
  return { identity, orgId: org_id };
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: OrgRole[],
) {
  const { identity, orgId } = await requireOrgMember(ctx);
  const { org_role } = identity as typeof identity & OrgClaims;
  const orgRole = org_role as OrgRole | undefined;
  if (!orgRole || !allowedRoles.includes(orgRole)) {
    throw new Error("Unauthorized");
  }
  return { identity, orgId, orgRole };
}

export async function requireEditor(ctx: QueryCtx | MutationCtx) {
  return requireRole(ctx, EDITOR_ROLES);
}

export async function requireAnyOrgMember(ctx: QueryCtx | MutationCtx) {
  return requireRole(ctx, ALL_ORG_ROLES);
}
