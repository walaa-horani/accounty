import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { InvoiceDetailClient } from "@/components/invoices/invoice-detail-client";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;
  const preloaded = await preloadQuery(
    api.invoices.get,
    { id: id as Id<"invoices"> },
    { token },
  );
  return <InvoiceDetailClient preloaded={preloaded} />;
}
