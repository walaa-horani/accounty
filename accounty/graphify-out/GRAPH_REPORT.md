# Graph Report - accounty  (2026-05-16)

## Corpus Check
- 32 files · ~7,561 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 212 nodes · 194 edges · 27 communities (23 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `687dc9c0`
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
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `compilerOptions` - 14 edges
3. `Convex guidelines` - 12 edges
4. `devDependencies` - 11 edges
5. `dependencies` - 8 edges
6. `skills` - 7 edges
7. `Function guidelines` - 7 edges
8. `scripts` - 5 edges
9. `convex` - 5 edges
10. `convex-create-component` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (27 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (22): computedHash, computedHash, skillPath, source, sourceType, computedHash, skillPath, source (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (20): Action guidelines, Authentication guidelines, code:ts (import { cronJobs } from "convex/server";), code:typescript (/// <reference types="vite/client" />), code:block12 (import { query } from "./_generated/server";), code:typescript (export default {), code:tsx (import { ConvexProviderWithAuth, ConvexReactClient } from "c), code:ts (import { query } from "./_generated/server";) (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): dependencies, @clerk/nextjs, @clerk/react, convex, next, react, react-dom, svix (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, allowSyntheticDefaultImports, forceConsistentCasingInFileNames, isolatedModules, jsx, lib, module (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (11): http, primaryEmail, svixId, svixSignature, svixTimestamp, wh, addNumber, listNumbers (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (12): code:typescript (import { httpRouter } from "convex/server";), code:typescript (import { mutation } from "./_generated/server";), code:typescript (import { defineSchema, defineTable } from "convex/server";), code:block4 (export const f = query({), code:ts (import { v } from "convex/values";), Function calling, Function guidelines, Function references (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (11): devDependencies, @convex-dev/eslint-plugin, eslint, eslint-config-next, prettier, tailwindcss, @tailwindcss/postcss, @types/node (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (4): geistMono, geistSans, metadata, convex

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

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (5): computedHash, skillPath, source, sourceType, convex-migration-helper

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (5): computedHash, skillPath, source, sourceType, convex-create-component

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (4): agentSkillsSha, agentsMdSectionHash, claudeMdHash, guidelinesHash

## Knowledge Gaps
- **140 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `skills` connect `Community 0` to `Community 14`, `Community 15`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `Convex guidelines` connect `Community 1` to `Community 6`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `Function guidelines` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._