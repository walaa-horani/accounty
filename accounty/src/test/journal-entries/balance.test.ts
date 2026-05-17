import { describe, it, expect } from "vitest";
import { calcBalance, formatCurrency } from "@/lib/journal-entries";

describe("calcBalance", () => {
  it("returns balanced for equal debits and credits", () => {
    const result = calcBalance([
      { debit: 1000, credit: 0 },
      { debit: 0, credit: 1000 },
    ]);
    expect(result.isBalanced).toBe(true);
    expect(result.totalDebit).toBe(1000);
    expect(result.totalCredit).toBe(1000);
    expect(result.difference).toBe(0);
  });

  it("returns unbalanced when debits exceed credits", () => {
    const result = calcBalance([
      { debit: 500, credit: 0 },
      { debit: 0, credit: 200 },
    ]);
    expect(result.isBalanced).toBe(false);
    expect(result.difference).toBe(300);
  });

  it("returns balanced for empty lines (0 = 0)", () => {
    const result = calcBalance([]);
    expect(result.isBalanced).toBe(true);
    expect(result.totalDebit).toBe(0);
    expect(result.totalCredit).toBe(0);
  });

  it("sums multiple debit and credit lines correctly", () => {
    const result = calcBalance([
      { debit: 600, credit: 0 },
      { debit: 400, credit: 0 },
      { debit: 0, credit: 700 },
      { debit: 0, credit: 300 },
    ]);
    expect(result.isBalanced).toBe(true);
    expect(result.totalDebit).toBe(1000);
    expect(result.totalCredit).toBe(1000);
  });

  it("uses Math.abs so difference is always non-negative", () => {
    const result = calcBalance([
      { debit: 0, credit: 800 },
      { debit: 500, credit: 0 },
    ]);
    expect(result.difference).toBe(300);
    expect(result.difference).toBeGreaterThanOrEqual(0);
  });
});

describe("formatCurrency", () => {
  it("formats a whole number with two decimal places", () => {
    expect(formatCurrency(1200)).toBe("$1,200.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats a decimal amount", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });
});
