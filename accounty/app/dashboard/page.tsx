import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;

  const [preloadedAccounts, preloadedEntries, preloadedBilling] =
    await Promise.all([
      preloadQuery(api.accounts.list, {}, { token }),
      preloadQuery(api.journalEntries.list, {}, { token }),
      preloadQuery(api.billing.getOrgBilling, {}, { token }),
    ]);

  return (
    <DashboardClient
      preloadedAccounts={preloadedAccounts}
      preloadedEntries={preloadedEntries}
      preloadedBilling={preloadedBilling}
    />
  );
}
