---
date: 2026-04-23
type: meta
tags: [philosophy, knowledge-management, llm-wiki]
---

# The Philosophical Origin of LLM-Maintained Knowledge Bases

## The Problem This Solves

Every creative/technical project has a documentation graveyard. Design notes from six months ago that describe a coordinate system that no longer exists. Optimization plans that were partially implemented. Phase documents that tracked decisions made but not *why* they were made. The problem is not that developers don't value documentation — it's that the cost of *keeping it true* consistently exceeds the cost of just reading the code directly.

For 3D projects like NUWRRRLD, this is especially acute. The scene has 100+ interdependent components. When you change the depth layer ranges, it affects parallax, Z-fighting risk, which layer components can be placed in, and the /add-environment-layer command. That cascade of effects is exactly the kind of knowledge that documentation should capture — and exactly the kind of knowledge that standard documentation loses within weeks.

Andrej Karpathy identified the underlying asymmetry: humans abandon knowledge bases when the maintenance burden exceeds the perceived value. Updating cross-references requires more discipline than the query rewards.

LLMs invert this. They are tireless, consistent, and extraordinarily good at the specific work that makes documentation rot: cross-referencing, noticing contradictions across files, updating stale claims, surfacing what changed. The insight is that an LLM is not just a question-answering system — it is a *bookkeeper* that also answers questions.

## The Three-Layer Architecture

The pattern separates concerns across three layers with different ownership and different rates of change:

```
raw/         — Immutable. The human drops sources here. The LLM reads, never writes.
wiki/        — LLM-owned. Synthesized, cross-linked, maintained. Never raw copies.
SCHEMA.md    — Co-evolved. The human and LLM negotiate structure together.
```

This separation is load-bearing. If the LLM could write to `raw/`, sources become contaminated with synthesis. If the human wrote directly to `wiki/`, cross-linking invariants would break. The schema is the only shared artifact — it's where the human tells the LLM what the wiki is *for*, and where the LLM can propose structural changes.

## Why Synthesis, Not Storage

The critical rule — the one that makes this work — is that the LLM **never copies source material verbatim**. It synthesizes, integrates, and cross-links.

This is counterintuitive. Most documentation systems are basically quote collections. But verbatim storage creates two failures:

1. **Contradiction blindness**: Two docs can say conflicting things, and a copy-paste wiki stores both without noticing.
2. **No compounding**: Each new source is isolated. The wiki gets longer, not smarter.

Synthesis forces the question: *what does this new source change about what the wiki already knows?* That question is what creates a knowledge base instead of a document dump.

For a 3D project like NUWRRRLD: when you ingest the `OPTIMIZATION_OVERVIEW.md`, a synthesis-based wiki doesn't just add a page for it. It updates `entity-pools.md` with the memory numbers, updates `concept-performance-budget.md` with the target metrics, updates `entity-ships.md` with the note about geometry churn, and updates `decision-resource-pool-pattern.md` with the context for why pooling was chosen. That's the compounding effect.

## The Entity → Concept → Decision Chain

The page type hierarchy encodes a theory of how knowledge compounds:

- **Entities** are the hubs. `entity-ships.md` accumulates everything known about ships — their types, their animation patterns, their memory footprint, the incidents they've been involved in, the decisions that shaped them.
- **Concepts** emerge from patterns across entities. When three entity pages all implement seeded random, the wiki names it `concept-seeded-random.md`, explains why it exists, and records where it's stressed.
- **Decisions** capture the moment a pattern was codified — what was rejected and why. `decision-resource-pool-pattern.md` exists because at some point the project hit 2+ GB of memory and someone decided to centralize geometry creation. That decision should outlive the commit message.

This chain means the wiki distills history, not just records it. A concept page is not a list of entities — it's the *explanation* that lets a new contributor understand why the pattern exists without reading every prior document.

## The Obsidian Graph as Epistemic Map

This wiki is optimized for Obsidian, which renders `[[wikilinks]]` as a visual knowledge graph. The graph view makes the wiki's structure legible at a glance:

- Entity pages should be highly connected (many inbound links from concepts, decisions, architecture pages)
- Concept pages should link to the entities that embody them and the decisions that codified them
- Orphan pages (no connections) are a signal that knowledge hasn't been integrated — run `/wiki lint` to find them

The graph is not decorative. It's a structural integrity check. A well-integrated wiki looks like a web; a poorly integrated one looks like a list of isolated nodes.

## The Log as Epistemic Audit Trail

Every operation appends to `log.md`. This is not a git substitute. It records *why* pages were touched, not just *that* they changed. It answers: "why does entity-ships.md now mention LOD?" — the log shows it was ingested during the optimization planning session on a specific date.

The log also enforces discipline: every ingest should touch multiple pages (3–10 is the heuristic). If a new source only updates one page, the LLM is storing, not integrating.

## What This Pattern Is Not

- **Not RAG**: The wiki is not a retrieval index over raw documents. It is a maintained artifact that grows smarter with each source.
- **Not chatbot memory**: The wiki is readable by humans without an LLM present. A new contributor should be able to read it cold.
- **Not a changelog**: The log records operations. Decisions have their own pages with rationale.
- **Not a replacement for source docs**: `raw/` is permanent. The wiki is interpretation; the sources are evidence.

## Applying This Pattern to 3D / Creative Projects

Standard engineering wikis use entity types like `service`, `API`, `database`. For a 3D project, the entity types are: `scene`, `component-system`, `render-pipeline`, `animation-system`, `asset`.

The concept types shift too. Instead of `async-fanout` or `cache-strategy`, the concepts are: `procedural-generation`, `depth-stratification`, `performance-budget`, `seeded-random`, `resource-pooling`.

What stays the same: the *invariant* that understanding a system means understanding not just what it does, but why it works the way it does, what it has survived, and where its designers are still uncertain.

---

*This document describes the pattern itself. The wiki it governs is the NUWRRRLD 3D project knowledge base at [docs/wiki/](.).*
