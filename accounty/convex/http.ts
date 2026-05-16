// NOTE: "use node" is not supported for Convex HTTP actions.
// SVIX works in the default Convex runtime.

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";

const PLAN_SLUGS = new Set(["free_org", "pro", "business"]);

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

function isValidPlanSlug(slug: string | undefined | null): slug is PlanSlug {
  return !!slug && PLAN_SLUGS.has(slug);
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
        (e) => e.id === data.primary_email_address_id,
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
    } else if (
      event.type === "subscription.created" ||
      event.type === "subscription.updated" ||
      event.type === "subscription.active" ||
      event.type === "subscription.pastDue"
    ) {
      const data = event.data as {
        id: string;
        status: SubStatus;
        payer: { organization_id?: string };
        items: Array<{ plan?: { slug?: string } | null }>;
      };

      const clerkOrgId = data.payer?.organization_id;
      const planSlug = data.items?.[0]?.plan?.slug;

      if (clerkOrgId && isValidPlanSlug(planSlug)) {
        await ctx.runMutation(internal.billing.syncSubscription, {
          clerkOrgId,
          subscriptionId: data.id,
          planSlug,
          status: data.status,
        });
      }
    } else if (
      event.type === "subscription.ended" ||
      event.type === "subscription.canceled"
    ) {
      const data = event.data as { id: string };
      await ctx.runMutation(internal.billing.cancelSubscription, {
        subscriptionId: data.id,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
