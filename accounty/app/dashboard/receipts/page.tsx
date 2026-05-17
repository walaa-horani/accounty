"use client";

import { TopBar } from "@/components/layout/top-bar";
import { PlanGate } from "@/components/billing/plan-gate";

export default function ReceiptsPage() {
  return (
    <>
      <TopBar title="Receipt Scanner" />
      <main className="flex-1 p-4 md:p-6">
        <PlanGate requiredPlan="business">
          <p className="text-muted-foreground text-sm">Receipt Scanner coming soon.</p>
        </PlanGate>
      </main>
    </>
  );
}
