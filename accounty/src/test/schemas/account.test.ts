import { describe, it, expect } from "vitest";
import { z } from "zod";

const accountSchema = z.object({
  number: z
    .string()
    .min(1, "Account number is required.")
    .max(20, "Account number must be 20 characters or fewer.")
    .regex(/^\d+$/, "Account number must contain digits only."),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or fewer."),
  type: z.enum(["asset", "liability", "equity", "income", "expense"]),
  description: z.string().max(250).optional().or(z.literal("")),
});

describe("accountSchema", () => {
  it("accepts a valid account", () => {
    const result = accountSchema.safeParse({
      number: "1000",
      name: "Cash",
      type: "asset",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-digit account number", () => {
    const result = accountSchema.safeParse({
      number: "10-A",
      name: "Cash",
      type: "asset",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/digits only/);
  });

  it("rejects empty account number", () => {
    const result = accountSchema.safeParse({
      number: "",
      name: "Cash",
      type: "asset",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = accountSchema.safeParse({
      number: "1000",
      name: "C",
      type: "asset",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/at least 2/);
  });

  it("rejects an invalid account type", () => {
    const result = accountSchema.safeParse({
      number: "1000",
      name: "Cash",
      type: "random",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an optional description", () => {
    const result = accountSchema.safeParse({
      number: "1000",
      name: "Cash",
      type: "asset",
      description: "Main operating account",
    });
    expect(result.success).toBe(true);
  });

  it("rejects description over 250 characters", () => {
    const result = accountSchema.safeParse({
      number: "1000",
      name: "Cash",
      type: "asset",
      description: "x".repeat(251),
    });
    expect(result.success).toBe(false);
  });
});
