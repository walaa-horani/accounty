import { query } from "./_generated/server";
import { requireAnyOrgMember } from "./lib/withAuth";
import { requireProPlan } from "./lib/planGate";

export const trialBalance = query({
  args: {},
  handler: async (ctx) => {
    await requireProPlan(ctx);
    const { orgId } = await requireAnyOrgMember(ctx);

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const lines = await ctx.db
      .query("journalLines")
      .withIndex("by_org", (q) => q.eq("orgId", orgId))
      .collect();

    const totals = new Map<string, { debit: number; credit: number }>();
    for (const line of lines) {
      const cur = totals.get(line.accountId) ?? { debit: 0, credit: 0 };
      totals.set(line.accountId, {
        debit: cur.debit + line.debit,
        credit: cur.credit + line.credit,
      });
    }

    return accounts
      .filter((a) => a.isActive)
      .map((a) => {
        const { debit = 0, credit = 0 } = totals.get(a._id) ?? {};
        return {
          _id: a._id,
          number: a.number,
          name: a.name,
          type: a.type,
          normalBalance: a.normalBalance,
          totalDebit: debit,
          totalCredit: credit,
          balance: a.normalBalance === "debit" ? debit - credit : credit - debit,
        };
      })
      .sort((a, b) => a.number.localeCompare(b.number));
  },
});
