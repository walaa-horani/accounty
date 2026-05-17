import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { InvoicesClient } from "@/components/invoices/invoices-client";

export default async function InvoicesPage() {
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;
  const preloaded = await preloadQuery(api.invoices.list, {}, { token });
  return <InvoicesClient preloaded={preloaded} />;
}
