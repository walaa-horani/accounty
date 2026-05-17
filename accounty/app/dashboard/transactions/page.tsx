import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TransactionsClient } from "@/components/journal-entries/transactions-client";

export default async function TransactionsPage() {
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;
  const preloaded = await preloadQuery(api.journalEntries.list, {}, { token });
  return <TransactionsClient preloaded={preloaded} />;
}
