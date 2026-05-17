"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Plan = "free_org" | "pro" | "business";

const PLAN_LABELS: Record<Plan, string> = {
  free_org: "Free",
  pro: "Pro",
  business: "Business",
};

interface UpgradeBannerProps {
  requiredPlan: Plan;
  currentPlan: Plan;
}

export function UpgradeBanner({ requiredPlan, currentPlan }: UpgradeBannerProps) {
  const router = useRouter();

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
          <Lock className="size-5 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="size-4 text-yellow-500" />
          {PLAN_LABELS[requiredPlan]} Plan Required
        </CardTitle>
        <CardDescription>
          You&apos;re on the{" "}
          <Badge variant="secondary">{PLAN_LABELS[currentPlan]}</Badge> plan.
          Upgrade to{" "}
          <Badge variant="outline">{PLAN_LABELS[requiredPlan]}</Badge> to unlock
          this feature.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button
          onClick={() => router.push("/dashboard/settings/billing")}
          className="gap-2"
        >
          <Sparkles className="size-4" />
          Upgrade to {PLAN_LABELS[requiredPlan]}
        </Button>
      </CardContent>
    </Card>
  );
}
