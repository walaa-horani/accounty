import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TransactionDetailClient } from "@/components/journal-entries/transaction-detail-client";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;
  const preloaded = await preloadQuery(
    api.journalEntries.get,
    { id: id as Id<"journalEntries"> },
    { token },
  );
  return <TransactionDetailClient id={id} preloaded={preloaded} />;
}
