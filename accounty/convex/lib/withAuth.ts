import { QueryCtx, MutationCtx } from "../_generated/server";

export type OrgRole = "org:admin" | "org:accountant" | "org:viewer";

export const EDITOR_ROLES: OrgRole[] = ["org:admin", "org:accountant"];
export const ALL_ORG_ROLES: OrgRole[] = [
  "org:admin",
  "org:accountant",
  "org:viewer",
];

// Custom claims from the Clerk JWT template named "convex".
// org_id / org_role come from the template; o.id / o.rol are the Clerk v2
// native fallback present when the template hasn't been configured yet.
interface OrgClaims {
  org_id?: string;
  org_role?: string;
  org_slug?: string;
  o?: { id?: string; rol?: string; slg?: string };
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export async function requireOrgMember(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuth(ctx);
  const claims = identity as typeof identity & OrgClaims;
  const orgId = claims.org_id ?? claims.o?.id;
  if (!orgId) throw new Error("No active organization");
  return { identity, orgId };
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: OrgRole[],
) {
  const { identity, orgId } = await requireOrgMember(ctx);
  const claims = identity as typeof identity & OrgClaims;
  const rawRole = claims.org_role ?? claims.o?.rol;
  // Normalise "admin" → "org:admin" for Clerk v2 native tokens
  const orgRole = rawRole
    ? ((rawRole.startsWith("org:") ? rawRole : `org:${rawRole}`) as OrgRole)
    : undefined;
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
