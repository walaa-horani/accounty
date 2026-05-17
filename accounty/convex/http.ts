// NOTE: "use node" is not supported for Convex HTTP actions.
// SVIX works in the default Convex runtime.

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

type PlanSlug = "free_org" | "pro" | "business";
type SubStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "ended"
  | "abandoned"
  | "incomplete"
  | "upcoming"
  | "expired";

// Maps Clerk plan slugs → internal plan values.
// Add entries here if Clerk uses different slug naming.
const PLAN_SLUG_MAP: Record<string, PlanSlug> = {
  free_org: "free_org",
  pro: "pro",
  "pro-plan": "pro",
  business: "business",
  "business-plan": "business",
};

// Higher number = higher tier. Used to pick the "winning" plan when a
// Clerk subscription contains multiple items (e.g. free_org + pro).
const PLAN_PRIORITY: Record<PlanSlug, number> = {
  free_org: 0,
  pro: 1,
  business: 2,
};

function mapPlanSlug(slug: string | undefined | null): PlanSlug | undefined {
  if (!slug) return undefined;
  return PLAN_SLUG_MAP[slug];
}

function pickBestPlanSlug(
  items: Array<{ plan?: { slug?: string } | null }> | undefined,
): PlanSlug | undefined {
  let best: PlanSlug | undefined;
  let bestRank = -1;
  for (const item of items ?? []) {
    const slug = mapPlanSlug(item.plan?.slug);
    if (slug && PLAN_PRIORITY[slug] > bestRank) {
      best = slug;
      bestRank = PLAN_PRIORITY[slug];
    }
  }
  return best;
}

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await req.text();

    const wh = new Webhook(webhookSecret);
    let event: WebhookEvent;
    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    // ── User events ──────────────────────────────────────────────────────────
    if (event.type === "user.created" || event.type === "user.updated") {
      const { data } = event;
      const primaryEmail = data.email_addresses.find(
        (e: { id: string; email_address: string }) =>
          e.id === data.primary_email_address_id,
      );
      await ctx.runMutation(internal.users.upsertFromClerk, {
        clerkId: data.id,
        email: primaryEmail?.email_address ?? "",
        name:
          [data.first_name, data.last_name].filter(Boolean).join(" ") ||
          undefined,
        imageUrl: data.image_url || undefined,
      });
    } else if (event.type === "user.deleted") {
      const { data } = event;
      if (data.id) {
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkId: data.id,
        });
      }

      // ── Organization events ────────────────────────────────────────────────
    } else if (
      event.type === "organization.created" ||
      event.type === "organization.updated"
    ) {
      const { data } = event;
      await ctx.runMutation(internal.organizations.upsertFromClerk, {
        clerkOrgId: data.id,
        name: data.name,
        slug: data.slug || undefined,
        imageUrl: data.image_url || undefined,
      });
    } else if (event.type === "organization.deleted") {
      const { data } = event;
      if (data.id) {
        await ctx.runMutation(internal.organizations.deleteFromClerk, {
          clerkOrgId: data.id,
        });
      }

      // ── Billing subscription events ────────────────────────────────────────
      // Clerk fires subscription.updated with status "canceled"/"ended" — no
      // separate canceled/ended event types exist in the WebhookEvent union.
    } else if (
      event.type === "subscription.created" ||
      event.type === "subscription.updated" ||
      event.type === "subscription.active" ||
      event.type === "subscription.pastDue"
    ) {
      const data = event.data as {
        id: string;
        status: SubStatus;
        payer?: { id?: string; type?: string; organization_id?: string };
        items: Array<{ plan?: { slug?: string } | null }>;
      };

      console.log("[billing webhook] event type:", event.type);
      console.log("[billing webhook] subscriptionId:", data.id);
      console.log("[billing webhook] payer:", JSON.stringify(data.payer));
      console.log("[billing webhook] items.length:", data.items?.length);
      console.log(
        "[billing webhook] item slugs:",
        JSON.stringify(data.items?.map((it) => it.plan?.slug ?? null)),
      );
      console.log("[billing webhook] items:", JSON.stringify(data.items));
      console.log("[billing webhook] status:", data.status);

      // Clerk v2 billing uses payer.id when payer.type === "org"
      const clerkOrgId =
        data.payer?.organization_id ??
        (data.payer?.type === "org" ? data.payer?.id : undefined);

      const terminalStatuses: SubStatus[] = ["canceled", "ended", "expired", "abandoned"];

      if (terminalStatuses.includes(data.status)) {
        await ctx.runMutation(internal.billing.cancelSubscription, {
          subscriptionId: data.id,
        });
      } else {
        const planSlug = pickBestPlanSlug(data.items);
        console.log(
          "[billing webhook] clerkOrgId:",
          clerkOrgId,
          "→ planSlug:",
          planSlug,
        );
        if (clerkOrgId && planSlug) {
          await ctx.runMutation(internal.billing.syncSubscription, {
            clerkOrgId,
            subscriptionId: data.id,
            planSlug,
            status: data.status,
          });
        } else {
          console.log(
            "[billing webhook] skipped — clerkOrgId or planSlug missing/invalid",
          );
        }
      }
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
