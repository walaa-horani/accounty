# Graph Report - accounty  (2026-05-16)

## Corpus Check
- 59 files · ~13,334 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 401 nodes · 566 edges · 30 communities (27 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aeeb3dce`
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 71 edges
2. `compilerOptions` - 16 edges
3. `dependencies` - 15 edges
4. `compilerOptions` - 14 edges
5. `Convex guidelines` - 12 edges
6. `devDependencies` - 11 edges
7. `requireOrgMember()` - 9 edges
8. `skills` - 7 edges
9. `Function guidelines` - 7 edges
10. `tailwind` - 6 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  lib/utils.ts → package.json
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `Avatar()` --calls--> `cn()`  [EXTRACTED]
  components/ui/avatar.tsx → lib/utils.ts
- `AvatarImage()` --calls--> `cn()`  [EXTRACTED]
  components/ui/avatar.tsx → lib/utils.ts

## Communities (30 total, 3 thin omitted)

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
Cohesion: 0.06
Nodes (34): dependencies, @base-ui/react, class-variance-authority, @clerk/nextjs, @clerk/react, clsx, convex, lucide-react (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (26): cancelSubscription, getOrgBilling, planValues, statusValues, syncSubscription, addNumber, listNumbers, myAction (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (63): useIsMobile(), AppSidebar(), bottomItems, navItems, PLAN_LABELS, cn(), Avatar(), AvatarBadge() (+55 more)

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
Cohesion: 0.12
Nodes (5): Plan, PLAN_HIERARCHY, PlanGateProps, UpgradeBanner(), components

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (4): agentSkillsSha, agentsMdSectionHash, claudeMdHash, guidelinesHash

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (3): config, isPublicRoute, signInUrl

### Community 29 - "Community 29"
Cohesion: 0.15
Nodes (17): PLAN_LABELS, STATUS_CONFIG, Plan, PLAN_LABELS, UpgradeBannerProps, stats, TopBar(), TopBarProps (+9 more)

## Knowledge Gaps
- **181 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+176 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 6` to `Community 3`, `Community 29`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 3` to `Community 6`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _181 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._