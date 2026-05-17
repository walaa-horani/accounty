export type LineBalance = { debit: number; credit: number };

export type BalanceResult = {
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
};

export function calcBalance(lines: LineBalance[]): BalanceResult {
  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  return { totalDebit, totalCredit, difference, isBalanced: difference === 0 };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
