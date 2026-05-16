import { QueryCtx, MutationCtx } from "../_generated/server";

export type OrgRole = "org:admin" | "org:accountant" | "org:viewer";

export const EDITOR_ROLES: OrgRole[] = ["org:admin", "org:accountant"];
export const ALL_ORG_ROLES: OrgRole[] = [
  "org:admin",
  "org:accountant",
  "org:viewer",
];

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export async function requireOrgMember(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);
  // Clerk includes org_id in the JWT when the user has an active organization
  const orgId = (identity as Record<string, unknown>).org_id as
    | string
    | undefined;
  if (!orgId) throw new Error("No active organization");
  return { identity, orgId };
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: OrgRole[],
) {
  const { identity, orgId } = await requireOrgMember(ctx);
  const orgRole = (identity as Record<string, unknown>).org_role as
    | OrgRole
    | undefined;
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
