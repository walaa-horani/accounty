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
  const raw = identity as Record<string, unknown>;

  // Clerk v2 tokens nest org data under `o: { id, rol }`.
  // Older JWT templates expose flat `org_id` / `org_role` — support both.
  const nested = raw.o as { id?: string; rol?: string } | undefined;
  const orgId = (raw.org_id as string | undefined) ?? nested?.id;
  if (!orgId) throw new Error("No active organization");

  return { identity, orgId };
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: OrgRole[],
) {
  const { identity, orgId } = await requireOrgMember(ctx);
  const raw = identity as Record<string, unknown>;

  const nested = raw.o as { id?: string; rol?: string } | undefined;
  const rawRole = (raw.org_role as string | undefined) ?? nested?.rol;
  // Normalise "admin" → "org:admin" in case the token omits the prefix
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
