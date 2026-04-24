---
date: 2026-04-23
type: meta
tags: [schema, wiki, conventions]
---

# Wiki Schema — NUWRRRLD

The LLM owns this layer entirely. You (the user) curate sources and ask questions. The LLM writes and maintains every wiki page. For the philosophy behind this pattern, see [[ORIGIN]].

## Three Layers

```
docs/wiki/raw/      — IMMUTABLE source documents. User drops files here. LLM reads, never writes.
docs/wiki/          — LLM-written pages: entities, concepts, decisions, incidents, architecture.
docs/wiki/SCHEMA.md — This file. Co-evolved by user + LLM. Governs all wiki behavior.
```

The layers have different ownership and different rates of change. Raw sources are evidence; wiki pages are interpretation. **Never copy source material verbatim** — always synthesize, integrate, and cross-link.

## Directory Layout

```
docs/wiki/
├── SCHEMA.md                        — This file (conventions + workflow)
├── ORIGIN.md                        — Philosophy: why this pattern exists
├── Welcome.md                       — Home page, status, quick navigation
├── index.md                         — Full content catalog, one line per page
├── log.md                           — Append-only operation record
│
├── overview.md                      — System map, tech stack, data flow, health
│
├── entity-scene.md                  — Canvas, renderer, contexts, postprocessing
├── entity-ships.md                  — 16-ship fleet, types, ShipConfig, animation
├── entity-buildings.md              — 16 cyberpunk buildings, procedural generation
├── entity-screens.md                — 3 TV screens, media config, interaction
├── entity-layers.md                 — 4 depth layers, Z-ranges, parallax
├── entity-pools.md                  — GeometryPool, MaterialPool, PoolContext
├── entity-commands.md               — 12 slash commands, categories, gaps
│
├── concept-procedural-generation.md — Ships + buildings generated from seeds
├── concept-seeded-random.md         — Deterministic PRNG for consistency
├── concept-depth-stratification.md  — Z-based scene organization + parallax
├── concept-cyberpunk-aesthetic.md   — Neon palette, emissive materials, CRT overlay
├── concept-performance-budget.md    — Explicit memory/FPS targets, trade-offs
├── concept-resource-pooling.md      — Shared geometry/material pools
├── concept-command-as-documentation.md — Slash commands as living docs
│
├── architecture-scene-composition.md  — How all components assemble
├── architecture-animation-systems.md  — useFrame, ship/building/particle animation
├── architecture-rendering-pipeline.md — WebGL → RxF → postprocessing stack
│
├── decision-depth-stratification-layers.md — Why 4 explicit Z-ranges
├── decision-seeded-random-generation.md    — Why deterministic PRNG
├── decision-resource-pool-pattern.md       — Why centralized pools
├── decision-portrait-first-design.md       — Why mobile portrait is primary
│
└── raw/                             — Immutable source documents
    ├── (drop source files here)
```

## Page Types & Required Sections

### Entity Pages (`entity-*.md`)
One page per named system component. These are the hubs — everything links to entities.

Required sections:
- **What it is** — one paragraph
- **Key files** — file paths with one-line descriptions
- **Where used** — which other pages reference this entity
- **Known issues** — links to any incident or decision pages triggered by this entity
- **Open questions** — things the wiki doesn't yet know
- **See also** — cross-links

### Concept Pages (`concept-*.md`)
Cross-cutting patterns and design philosophy.

Required sections:
- **The pattern** — what it is and why it exists
- **Where it appears** — which entities implement it
- **Contradictions / tensions** — known places where the pattern is violated or stressed
- **See also**

### Architecture Pages (`architecture-*.md`)
How components compose and interact.

Required sections:
- **What it governs** — scope of this architecture document
- **Component map** — ASCII diagram or bullet hierarchy
- **Data / control flow** — how information moves through this layer
- **Key invariants** — things that must always be true
- **Open questions**
- **See also**

### Decision Pages (`decision-*.md`)
Recorded design choices. The single most important thing a decision page does is explain *why*, not just *what*.

Required sections:
- **Decision** — one sentence
- **Date**
- **Context** — what problem was being solved
- **Alternatives considered** — what was rejected and why
- **Consequences** — what this rules out, what it enables
- **Validated by** — evidence that confirmed (or challenged) this decision
- **See also**

### Incident Pages (`incident-*.md`)
One page per production bug or significant failure.

Required sections:
- **Date & severity**
- **What happened** — factual timeline
- **Root cause**
- **Resolution**
- **Impact on design** — what this revealed, with links to affected entity/concept pages
- **Open items**

## Page Conventions

**Filename**: kebab-case prefix tells the type: `entity-`, `concept-`, `architecture-`, `decision-`, `incident-`

**Frontmatter** (required on every page):
```yaml
---
date: 2026-04-23
type: entity | concept | architecture | decision | incident | overview
tags: [ships, animation, performance]
sources: [raw/PLAN_SUMMARY.md, raw/OPTIMIZATION_OVERVIEW.md]
---
```

**Link style**: `[[wikilinks]]` — Obsidian-compatible, no absolute paths. Use `[[page|display text]]` when the display text should differ from the filename.

**Contradiction notices**:
```
> ⚠️ Contradiction: architecture-scene-composition.md says X; entity-scene.md says Y. Unresolved.
```

**Open question notices**:
```
> ❓ Open question: Is shadow mapping enabled in Scene.tsx? Performance impact unknown.
```

## Secret Policy

Never write real API keys, tokens, URLs, or credentials into wiki pages. Use placeholders: `{vercel-project-url}`, `{api-key}`.

## On Ingest (`/wiki ingest <path>`)

1. **Read source** — extract key facts, decisions, contradictions
2. **Identify pages to create or update**:
   - New component? Create or update `entity-*.md`
   - New pattern? Create or update `concept-*.md`
   - Design choice revealed? Create or update `decision-*.md`
   - Bug/incident? Create `incident-*.md` AND update every entity page it touches
   - Contradiction with existing page? Mark it inline on both pages
3. **Never copy verbatim** — synthesize, integrate, cross-link
4. **Update `index.md`** — add any new pages
5. **Append to `log.md`** — `## [{date}] ingest | {source title} | pages touched: N`

A single source should touch 3–10 pages. If it touches 1, you're not integrating enough.

## On Query (`/wiki query <question>`)

1. Read `index.md` to find relevant pages
2. Read those pages; note open questions and contradictions relevant to the query
3. Synthesize answer with citations: `[[entity-ships#animation]]`
4. If the answer reveals something worth keeping, offer to file it as a new page
5. Append to `log.md`: `## [{date}] query | {question summary}`

## On Lint (`/wiki lint`)

Report:
1. **Orphan pages** — no inbound links (except index/log/schema)
2. **Entity pages missing required sections**
3. **Incident pages not linked from affected entity pages**
4. **Unresolved contradictions** — ⚠️ markers older than 2 ingests
5. **Open questions** — ❓ markers that could be answered by reading the code
6. **Stale claims** — cross-check against current source files

Append findings to `log.md`: `## [{date}] lint | {N issues found}`

## Log Format

```
## [2026-04-23] ingest | PLAN_SUMMARY + OPTIMIZATION_OVERVIEW | pages touched: 8
## [2026-04-23] query | How do ships avoid geometry churn?
## [2026-04-23] lint | 2 orphans, 1 contradiction, 4 open questions
```

Parseable with: `grep "^## \[" log.md | tail -10`
