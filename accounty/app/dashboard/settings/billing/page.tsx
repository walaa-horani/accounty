"use client";

import { PricingTable } from "@clerk/nextjs";
import { TopBar } from "@/components/layout/top-bar";

export default function BillingPage() {
  return (
    <>
      <TopBar title="Billing" />
      <main className="flex-1 p-4 md:p-6 max-w-4xl">
        <PricingTable for="organization" />
      </main>
    </>
  );
}
