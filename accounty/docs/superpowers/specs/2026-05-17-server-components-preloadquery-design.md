# Server Components + preloadQuery Refactor

**Date:** 2026-05-17  
**Branch:** feature/journal-entries  
**Status:** Approved — pending implementation plan

## Goal

Convert all dashboard `page.tsx` files from `"use client"` to async Server Components. Data is preloaded server-side via `preloadQuery` (Convex + Clerk), so the first HTML response contains real content. The client component takes over for real-time updates after hydration.

## Scope

4 pages, 4 new client components:

| Server shell | New client component |
|---|---|
| `app/dashboard/page.tsx` | `components/dashboard/dashboard-client.tsx` |
| `app/dashboard/accounts/page.tsx` | `components/accounts/accounts-client.tsx` |
| `app/dashboard/transactions/page.tsx` | `components/journal-entries/transactions-client.tsx` |
| `app/dashboard/transactions/[id]/page.tsx` | `components/journal-entries/transaction-detail-client.tsx` |

## Architecture

### Server shell (every page.tsx)

```tsx
import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { SomeClient } from "@/components/.../some-client";

export default async function Page() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  const preloaded = await preloadQuery(api.someQuery.list, {}, { token });
  return <SomeClient preloaded={preloaded} />;
}
```

- No `"use client"` directive — pure async RSC
- `auth()` from `@clerk/nextjs/server` (not the client hook)
- Token passed to `preloadQuery` so auth-protected queries execute correctly
- Token may be `null` for unauthenticated users; Convex's own `requireAnyOrgMember` guards handle that case — these pages are behind the auth middleware so this won't happen in practice

### [id] page variation

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  const preloaded = await preloadQuery(
    api.journalEntries.get,
    { id: id as Id<"journalEntries"> },
    { token },
  );
  return <TransactionDetailClient preloaded={preloaded} />;
}
```

`id` flows from `params` to `preloadQuery` — `useParams` hook is removed from the client component.

### Client component

```tsx
"use client";

import { usePreloadedQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Props {
  preloaded: Preloaded<typeof api.someQuery.list>;
}

export function SomeClient({ preloaded }: Props) {
  const data = usePreloadedQuery(preloaded);
  // ... all existing state, mutations, useOrganization, JSX unchanged
}
```

Key changes from current code:
- Add `"use client"` directive
- Add `Props` interface with `Preloaded<typeof api.X>` type
- Replace `useQuery(api.X)` → `usePreloadedQuery(props.preloaded)`
- Remove `useQuery` from imports, add `usePreloadedQuery` and `Preloaded`
- Everything else (useState, useMutation, useOrganization, useRouter, JSX) stays exactly as-is

### Dashboard page variation

The dashboard preloads 3 queries:

```tsx
const [preloadedAccounts, preloadedEntries, preloadedBilling] = await Promise.all([
  preloadQuery(api.accounts.list, {}, { token }),
  preloadQuery(api.journalEntries.list, {}, { token }),
  preloadQuery(api.billing.getOrgBilling, {}, { token }),
]);
return (
  <DashboardClient
    preloadedAccounts={preloadedAccounts}
    preloadedEntries={preloadedEntries}
    preloadedBilling={preloadedBilling}
  />
);
```

`Promise.all` fetches all three in parallel.

## Data Flow

```
Browser request
  → Next.js Server
    → auth().getToken({ template: "convex" })   [Clerk JWT]
    → preloadQuery(...)                          [Convex server-side fetch]
    → RSC renders HTML with real data
  → Browser receives full HTML (no loading flash)
    → React hydrates
    → usePreloadedQuery picks up preloaded state
    → Convex WebSocket opens → real-time updates resume
```

## What Does NOT Change

- All `useState`, `useMemo`, `useMutation`, `useOrganization`, `useRouter` logic — untouched
- All JSX — untouched
- `AccountForm`, `JournalEntryForm`, dialogs — untouched
- `TopBar` — stays in each client component (it uses no server-specific APIs)
- Role checks (`isEditor`, `isAdmin` via `useOrganization`) — stay in client
- Convex schema and queries — no changes

## Out of Scope

- `app/dashboard/settings/billing/page.tsx` — already a server component, `PricingTable` is a Clerk client component; no change needed
- Other pages (sign-in, sign-up, onboarding, org-selection) — already server components or auth pages; no change needed
- Query logic, schema, mutations — no changes

## Constraints

- Convex v1.36.1 — `preloadQuery` and `usePreloadedQuery` are available
- `convex/nextjs` exports `preloadQuery`; `convex/react` exports `usePreloadedQuery` and `Preloaded`
- Clerk `convex` JWT template must be configured in Clerk Dashboard (it is — client-side auth already works)
- Next.js 15 `params` is a `Promise` — must be awaited in server components
