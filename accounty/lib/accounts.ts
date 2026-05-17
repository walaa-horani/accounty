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
