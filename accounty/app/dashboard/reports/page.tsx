import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;
  const preloadedBilling = await preloadQuery(api.billing.getOrgBilling, {}, { token });
  return <ReportsClient preloadedBilling={preloadedBilling} />;
}
