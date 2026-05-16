"use client";

import { PricingTable } from "@clerk/nextjs";
import { TopBar } from "@/components/layout/top-bar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  free_org: "Free",
  pro: "Pro",
  business: "Business",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  active: { label: "Active", variant: "default", icon: CheckCircle2 },
  past_due: { label: "Past Due", variant: "destructive", icon: AlertCircle },
  canceled: { label: "Canceled", variant: "secondary", icon: AlertCircle },
  upcoming: { label: "Active", variant: "default", icon: CheckCircle2 },
};

export default function BillingPage() {
  const billing = useQuery(api.billing.getOrgBilling);

  const plan = billing?.plan ?? "free_org";
  const status = billing?.subscriptionStatus;
  const statusConfig = status ? (STATUS_CONFIG[status] ?? STATUS_CONFIG.active) : null;

  return (
    <>
      <TopBar title="Billing" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl">
        {billing && (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your organization&apos;s active subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Badge variant="outline" className="text-base px-3 py-1">
                {PLAN_LABELS[plan] ?? plan}
              </Badge>
              {statusConfig && (
                <Badge variant={statusConfig.variant} className="gap-1">
                  <statusConfig.icon className="size-3" />
                  {statusConfig.label}
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Choose the plan that fits your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PricingTable />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
