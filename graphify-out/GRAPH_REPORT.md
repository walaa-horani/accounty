# Graph Report - accounty  (2026-05-17)

## Corpus Check
- 69 files · ~16,366 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 475 nodes · 667 edges · 37 communities (32 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6440f113`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 75 edges
2. `dependencies` - 19 edges
3. `devDependencies` - 18 edges
4. `compilerOptions` - 16 edges
5. `compilerOptions` - 14 edges
6. `Convex guidelines` - 12 edges
7. `Button()` - 9 edges
8. `requireOrgMember()` - 9 edges
9. `scripts` - 8 edges
10. `skills` - 7 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  lib/utils.ts → package.json
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `SheetFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Communities (37 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (32): computedHash, computedHash, skillPath, source, sourceType, computedHash, skillPath, source (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (32): Action guidelines, Authentication guidelines, code:typescript (import { httpRouter } from "convex/server";), code:ts (import { cronJobs } from "convex/server";), code:typescript (/// <reference types="vite/client" />), code:block12 (import { query } from "./_generated/server";), code:typescript (import { mutation } from "./_generated/server";), code:typescript (import { defineSchema, defineTable } from "convex/server";) (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (18): devDependencies, @convex-dev/eslint-plugin, eslint, eslint-config-next, jsdom, prettier, tailwindcss, @tailwindcss/postcss (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (32): accountType, archive, create, list, restore, update, cancelSubscription, getOrgBilling (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (53): useIsMobile(), AppSidebar(), bottomItems, navItems, PLAN_LABELS, cn(), Avatar(), AvatarBadge() (+45 more)

### Community 7 - "Community 7"
Cohesion: 0.26
Nodes (12): data, http, isValidPlanSlug(), PLAN_SLUGS, PlanSlug, primaryEmail, SubStatus, svixId (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (5): geistMono, geistSans, metadata, convex, TooltipProvider()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): code:block1 (npm install), code:block2 (npm create convex@latest -- -t nextjs-clerk), Get started, Join the community, Learn more, Welcome to your Convex + Next.js + Clerk app

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (4): DataModel, Doc, Id, TableNames

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (5): ActionCtx, DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (5): code:ts (// convex/myFunctions.ts), code:ts (const data = useQuery(api.myFunctions.myQueryFunction, {), code:ts (// convex/myFunctions.ts), code:ts (const mutation = useMutation(api.myFunctions.myMutationFunct), Welcome to your Convex functions directory!

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (30): dependencies, @base-ui/react, class-variance-authority, @clerk/backend, @clerk/nextjs, @clerk/react, clsx, convex (+22 more)

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (4): agentSkillsSha, agentsMdSectionHash, claudeMdHash, guidelinesHash

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (3): config, isPublicRoute, signInUrl

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (22): PLAN_LABELS, STATUS_CONFIG, Plan, PLAN_HIERARCHY, PlanGateProps, Plan, PLAN_LABELS, UpgradeBanner() (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (14): AccountForm(), Account, AccountType, TYPE_COLORS, TYPE_LABELS, TYPE_ORDER, DropdownMenu(), DropdownMenuTrigger() (+6 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (20): Account, ACCOUNT_TYPES, AccountFormProps, AccountFormValues, accountSchema, AccountType, Button(), buttonVariants (+12 more)

## Knowledge Gaps
- **214 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+209 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 6` to `Community 32`, `Community 15`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 15` to `Community 6`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _214 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._