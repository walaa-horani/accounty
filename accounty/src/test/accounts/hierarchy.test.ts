import { describe, it, expect } from "vitest";
import { buildHierarchy } from "@/lib/accounts";

type MinAccount = {
  _id: string;
  number: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  normalBalance: "debit" | "credit";
  isActive: boolean;
  parentId?: string;
};

const a = (override: Partial<MinAccount> & { _id: string }): MinAccount => ({
  number: "1000",
  name: "Account",
  type: "asset",
  normalBalance: "debit",
  isActive: true,
  ...override,
});

describe("buildHierarchy", () => {
  it("returns flat list unchanged when no parentIds exist", () => {
    const accounts = [
      a({ _id: "1", number: "1000" }),
      a({ _id: "2", number: "1100" }),
    ];
    const rows = buildHierarchy(accounts);
    expect(rows).toHaveLength(2);
    expect(rows[0].depth).toBe(0);
    expect(rows[1].depth).toBe(0);
  });

  it("places child immediately after its parent", () => {
    const accounts = [
      a({ _id: "1", number: "1000" }),
      a({ _id: "2", number: "1010", parentId: "1" }),
      a({ _id: "3", number: "1100" }),
    ];
    const rows = buildHierarchy(accounts);
    expect(rows[0].account._id).toBe("1");
    expect(rows[1].account._id).toBe("2");
    expect(rows[1].depth).toBe(1);
    expect(rows[2].account._id).toBe("3");
    expect(rows[2].depth).toBe(0);
  });

  it("sorts roots by account number", () => {
    const accounts = [
      a({ _id: "2", number: "1100" }),
      a({ _id: "1", number: "1000" }),
    ];
    const rows = buildHierarchy(accounts);
    expect(rows[0].account.number).toBe("1000");
    expect(rows[1].account.number).toBe("1100");
  });

  it("sorts siblings by account number", () => {
    const accounts = [
      a({ _id: "1", number: "1000" }),
      a({ _id: "3", number: "1020", parentId: "1" }),
      a({ _id: "2", number: "1010", parentId: "1" }),
    ];
    const rows = buildHierarchy(accounts);
    expect(rows[1].account.number).toBe("1010");
    expect(rows[2].account.number).toBe("1020");
  });

  it("handles orphaned children (parentId not in list) as roots", () => {
    const accounts = [
      a({ _id: "1", number: "1000", parentId: "missing" }),
    ];
    const rows = buildHierarchy(accounts);
    expect(rows).toHaveLength(1);
    expect(rows[0].depth).toBe(0);
  });
});
