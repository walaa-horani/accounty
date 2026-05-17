# Chart of Accounts — Parent Account Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add parent account selection to the account form and show hierarchical indentation in the accounts table.

**Architecture:** Extract a pure `buildHierarchy()` helper into `lib/accounts.ts` so it can be tested independently. Modify the form to add a reactive parent select (filtered by selected type, excluding self). Modify the page to pass accounts through `buildHierarchy()` before rendering each type group.

**Tech Stack:** Next.js 16 · Convex · React Hook Form · Zod · Vitest · shadcn/ui

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/accounts.ts` | **Create** | Pure `buildHierarchy()` helper — sorts accounts into parent→child order with depth |
| `src/test/accounts/hierarchy.test.ts` | **Create** | Unit tests for `buildHierarchy()` |
| `components/accounts/account-form.tsx` | **Modify** | Add optional `parentId` select, filtered by type + excluding self |
| `app/dashboard/accounts/page.tsx` | **Modify** | Add `parentId` to `Account` interface, use `buildHierarchy()` for indented rows |

---

## Task 1: Pure hierarchy helper + tests

**Files:**
- Create: `lib/accounts.ts`
- Create: `src/test/accounts/hierarchy.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/test/accounts/hierarchy.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd accounty && pnpm test src/test/accounts/hierarchy.test.ts
```

Expected: `Cannot find module '@/lib/accounts'`

- [ ] **Step 3: Create `lib/accounts.ts`**

```ts
export type AccountRow<T extends { _id: string; number: string; parentId?: string }> = {
  account: T;
  depth: number;
};

export function buildHierarchy<T extends { _id: string; number: string; parentId?: string }>(
  accounts: T[],
): AccountRow<T>[] {
  const byId = new Map(accounts.map((a) => [a._id, a]));
  const childrenOf = new Map<string, T[]>();

  for (const a of accounts) {
    if (a.parentId && byId.has(a.parentId)) {
      const siblings = childrenOf.get(a.parentId) ?? [];
      siblings.push(a);
      childrenOf.set(a.parentId, siblings);
    }
  }

  const roots = accounts
    .filter((a) => !a.parentId || !byId.has(a.parentId))
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

  const result: AccountRow<T>[] = [];

  function walk(node: T, depth: number) {
    result.push({ account: node, depth });
    const children = (childrenOf.get(node._id) ?? []).sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true }),
    );
    for (const child of children) walk(child, depth + 1);
  }

  for (const root of roots) walk(root, 0);
  return result;
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
cd accounty && pnpm test src/test/accounts/hierarchy.test.ts
```

Expected: 5 tests pass

- [ ] **Step 5: Run lint + typecheck**

```bash
cd accounty && pnpm lint
cd accounty && pnpm typecheck
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add accounty/lib/accounts.ts accounty/src/test/accounts/hierarchy.test.ts
git commit -m "feat(accounts): add buildHierarchy helper with tests"
```

---

## Task 2: Add parentId field to the account form

**Files:**
- Modify: `components/accounts/account-form.tsx`

- [ ] **Step 1: Add `parentId` to the Zod schema and Account interface**

In `components/accounts/account-form.tsx`, update the schema and interface:

```ts
// replace the existing accountSchema const
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
  type: z.enum(["asset", "liability", "equity", "income", "expense"], {
    errorMap: () => ({ message: "Please select an account type." }),
  }),
  description: z
    .string()
    .max(250, "Description must be 250 characters or fewer.")
    .optional()
    .or(z.literal("")),
  parentId: z.string().optional(),
});

// replace the Account interface
interface Account {
  _id: Id<"accounts">;
  number: string;
  name: string;
  type: AccountFormValues["type"];
  description?: string;
  parentId?: string;
}
```

- [ ] **Step 2: Add `useQuery` import and accounts query to the component**

Add `useQuery` to the existing convex import, and add a `NONE` sentinel constant above the component:

```ts
// update the existing import line
import { useMutation, useQuery } from "convex/react";

// add below the ACCOUNT_TYPES const
const NONE = "__none__";
```

Inside `AccountForm`, add the query and `watch` call at the top of the component body:

```ts
const accounts = useQuery(api.accounts.list);
const watchedType = watch("type");
```

Also add `watch` to the destructured return of `useForm`:

```ts
const {
  register,
  handleSubmit,
  control,
  reset,
  setError,
  watch,
  formState: { errors, isSubmitting },
} = useForm<AccountFormValues>({ ... });
```

- [ ] **Step 3: Update `reset()` call to include parentId**

In the `useEffect`, update the reset call:

```ts
reset({
  number: editing?.number ?? "",
  name: editing?.name ?? "",
  type: editing?.type ?? "asset",
  description: editing?.description ?? "",
  parentId: editing?.parentId ?? undefined,
});
```

- [ ] **Step 4: Update `onSubmit` to pass parentId**

```ts
async function onSubmit(values: AccountFormValues) {
  try {
    const description = values.description || undefined;
    const parentId = values.parentId
      ? (values.parentId as Id<"accounts">)
      : undefined;
    if (isEditing) {
      await update({ id: editing._id, ...values, description, parentId });
    } else {
      await create({ ...values, description, parentId });
    }
    onClose();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    if (message.toLowerCase().includes("number")) {
      setError("number", { message });
    } else {
      setError("root", { message });
    }
  }
}
```

- [ ] **Step 5: Add the Parent Account select field to the form JSX**

Add this block inside the `<form>` just before the Description field:

```tsx
{/* Parent Account */}
<div className="space-y-1.5">
  <Label htmlFor="parentId">
    Parent Account{" "}
    <span className="text-muted-foreground font-normal">(optional)</span>
  </Label>
  <Controller
    name="parentId"
    control={control}
    render={({ field }) => {
      const options = (accounts ?? []).filter(
        (a) => a.isActive && a.type === watchedType && a._id !== editing?._id,
      );
      return (
        <Select
          value={field.value ?? NONE}
          onValueChange={(v) => field.onChange(v === NONE ? undefined : v)}
        >
          <SelectTrigger id="parentId">
            <SelectValue placeholder="None (top-level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>None (top-level)</SelectItem>
            {options.map((a) => (
              <SelectItem key={a._id} value={a._id}>
                {a.number} — {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }}
  />
</div>
```

- [ ] **Step 6: Run lint + typecheck**

```bash
cd accounty && pnpm lint
cd accounty && pnpm typecheck
```

Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add accounty/components/accounts/account-form.tsx
git commit -m "feat(accounts): add parent account field to account form"
```

---

## Task 3: Show hierarchy in the accounts table

**Files:**
- Modify: `app/dashboard/accounts/page.tsx`

- [ ] **Step 1: Add imports and update the Account interface**

At the top of `app/dashboard/accounts/page.tsx`, add the import:

```ts
import { buildHierarchy } from "@/lib/accounts";
```

Update the `Account` interface:

```ts
interface Account {
  _id: Id<"accounts">;
  number: string;
  name: string;
  type: AccountType;
  normalBalance: "debit" | "credit";
  description?: string;
  isActive: boolean;
  parentId?: string;
}
```

- [ ] **Step 2: Replace flat `rows.map` with hierarchy-aware rendering**

Find the `rows.map((account) => (` block inside `TYPE_ORDER.map` and replace it with:

```tsx
{buildHierarchy(rows).map(({ account, depth }) => (
  <TableRow
    key={account._id}
    className={!account.isActive ? "opacity-50" : ""}
  >
    <TableCell className="font-mono text-sm">
      {account.number}
    </TableCell>
    <TableCell>
      <span
        className="font-medium"
        style={{ paddingLeft: depth * 16 }}
      >
        {depth > 0 && (
          <span className="text-muted-foreground mr-1">↳</span>
        )}
        {account.name}
      </span>
      {!account.isActive && (
        <Badge variant="secondary" className="ml-2 text-xs">
          Inactive
        </Badge>
      )}
    </TableCell>
    <TableCell className="hidden md:table-cell capitalize text-muted-foreground text-sm">
      {account.normalBalance}
    </TableCell>
    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm truncate max-w-xs">
      {account.description ?? "—"}
    </TableCell>
    <TableCell>
      {isEditor && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8" />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(account)}>
              <Pencil className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {account.isActive ? (
              <DropdownMenuItem
                onClick={() => void archive({ id: account._id })}
                className="text-destructive"
              >
                <Archive className="size-4 mr-2" />
                Archive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => void restore({ id: account._id })}
              >
                <RotateCcw className="size-4 mr-2" />
                Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </TableCell>
  </TableRow>
))}
```

- [ ] **Step 3: Run lint + typecheck**

```bash
cd accounty && pnpm lint
cd accounty && pnpm typecheck
```

Expected: no errors

- [ ] **Step 4: Run full test suite**

```bash
cd accounty && pnpm test
```

Expected: all tests pass including the 5 hierarchy tests

- [ ] **Step 5: Commit**

```bash
git add accounty/app/dashboard/accounts/page.tsx
git commit -m "feat(accounts): show parent-child hierarchy in accounts table"
```

---

## Task 4: Push and verify CI

- [ ] **Step 1: Push branch**

```bash
git push
```

- [ ] **Step 2: Verify CI on GitHub**

Go to the Actions tab. All four jobs (TypeScript, Lint, Unit Tests, Build) must be green.

- [ ] **Step 3: Update PLAN.md**

In `docs/PLAN.md`, mark the two remaining Phase 1 items as done:

```markdown
- [x] **Parent account field in form** ← next task
- [x] **Indented hierarchy in table**
```

- [ ] **Step 4: Commit plan update**

```bash
git add accounty/docs/PLAN.md
git commit -m "docs: mark Phase 1 chart-of-accounts complete"
```

- [ ] **Step 5: Push**

```bash
git push
```
