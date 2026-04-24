---
date: 2026-04-23
type: home
tags: [home, navigation, status]
---

# NUWRRRLD Wiki

LLM-maintained knowledge base for the NUWRRRLD cyberpunk 3D portfolio.

**What this is**: A synthesized, cross-linked wiki — not a document dump. Every page is written by an LLM after reading source docs, integrating new facts into existing pages, noting contradictions, and maintaining cross-references. See [[ORIGIN]] for the philosophy.

---

## Quick Navigation

| What you need | Where to go |
|--------------|------------|
| What the project is | [[overview]] |
| How the scene is built | [[architecture-scene-composition]] |
| How ships work | [[entity-ships]] |
| How screens are configured | [[entity-screens]] |
| Performance / memory budget | [[concept-performance-budget]] |
| All 12 slash commands | [[entity-commands]] |
| Wiki conventions | [[SCHEMA]] |
| Full page catalog | [[index]] |

---

## System Status

| Component | Status | Notes |
|-----------|--------|-------|
| 3 TV Screens | ✅ Working | Hover, tap, side panels |
| 16 Ships (16-ship fleet) | ✅ Working | Procedurally generated, animated |
| 16 Buildings | ✅ Working | Seeded procedural, window patterns |
| 4 Depth Layers | ✅ Working | Foreground / mid / back / opposite |
| Post-processing | ✅ Working | Bloom, grain, vignette, chromatic aberration |
| Resource Pools | ⚠️ In progress | Target: 70% memory reduction |
| Mobile Performance | ⚠️ In progress | Target: 60 FPS, 400–600 MB |
| LOD System | 📋 Planned | Needed for capital ships at distance |

---

## Wiki Operations

```
/wiki ingest <path>   — Read a source file, integrate knowledge into wiki pages
/wiki query <question> — Query the wiki with citations from entity/concept pages  
/wiki lint            — Find orphans, missing sections, stale claims
```

---

## Key Numbers

- **Ships**: 16 total (8 shuttles · 5 transports · 3 freighters)
- **Buildings**: 16 total (5 left · 5 right · 6 background)
- **Screens**: 3 (y=68 · y=40 · y=12)
- **Depth layers**: 4 (foreground −5 to 0 · midground −10 to −20 · background −60 to −100 · opposite +25 to +65)
- **Memory before optimization**: 2+ GB
- **Memory target**: 400–600 MB
- **FPS target**: 60 stable

---

## Stack

Next.js 14 · React 18 · Three.js 0.162 · @react-three/fiber 8 · TypeScript 5 strict · Tailwind CSS · Vercel
