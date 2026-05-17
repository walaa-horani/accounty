import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { AccountsClient } from "@/components/accounts/accounts-client";

export default async function AccountsPage() {
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;
  const preloaded = await preloadQuery(api.accounts.list, {}, { token });
  return <AccountsClient preloaded={preloaded} />;
}
