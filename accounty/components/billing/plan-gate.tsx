"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UpgradeBanner } from "./upgrade-banner";

type Plan = "free_org" | "pro" | "business";

const PLAN_HIERARCHY: Record<Plan, number> = {
  free_org: 0,
  pro: 1,
  business: 2,
};

interface PlanGateProps {
  requiredPlan: Plan;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PlanGate({ requiredPlan, children, fallback }: PlanGateProps) {
  const billing = useQuery(api.billing.getOrgBilling);

  if (billing === undefined) return null;

  const currentPlan = billing?.plan ?? "free_org";
  const hasAccess =
    PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan];

  if (!hasAccess) {
    return (
      fallback ?? (
        <UpgradeBanner
          requiredPlan={requiredPlan}
          currentPlan={currentPlan}
        />
      )
    );
  }

  return <>{children}</>;
}
