---
date: 2026-04-23
type: entity
tags: [commands, workflow, claude-code, documentation]
sources: [.claude/commands/]
---

# Entity: Commands

## What It Is

NUWRRRLD has 12 custom Claude Code slash commands stored as Markdown files in `.claude/commands/`. These commands encode project-specific domain knowledge — ship size tiers, material pool patterns, scene depth conventions — in a format that is both human-readable and machine-executable. Each command is a specialized guide that Claude loads on invocation, giving it the context needed to complete a specific task correctly.

## Command Registry

| Command | File | Category | What it does |
|---------|------|----------|-------------|
| `/ship-system-guide` | ship-system-guide.md | Ships | Architecture reference: ShipConfig interface, size tiers 1x–9x, type characteristics |
| `/ship-optimization` | ship-optimization.md | Ships | Memory reduction: material pooling, geometry pooling, InstancedMesh, LOD, React.memo |
| `/ship-examples` | ship-examples.md | Ships | Copy-paste templates: 2x corvette, 5x battlecruiser, 9x capital with pooling, animation patterns |
| `/add-capital-ship` | add-capital-ship.md | Ships | Add optimized 9x capital ship with geometry pool, material pool, CapitalShip component (~212 lines) |
| `/add-screen` | add-screen.md | Scene | Add TV screen: industrial back-panel design, config format, position/size args |
| `/add-environment-layer` | add-environment-layer.md | Scene | Add depth layer: foreground/midground/background/custom, density, material presets |
| `/cyberpunk-theme` | cyberpunk-theme.md | Scene | Apply color theme: neon/noir/vapor/matrix/sunset/custom, 5 palettes × 8 colors each |
| `/scene-audit` | scene-audit.md | Scene | Audit scene: performance (geometry/textures/lights), visual quality, responsive layout |
| `/export-scene-config` | export-scene-config.md | Config | Export SceneConfig to JSON/YAML/TypeScript; 100+ properties schema |
| `/mcp-and-guidance` | mcp-and-guidance.md | Guidance | MCP server status, project skills list, key principles, wiki reference |
| `/lpr` | lpr.md | Workflow | PR creator: new branch, npm build, commit, PR with educational description |
| `/verpr` | verpr.md | Workflow | Vercel deploy + PR: branch, build, Vercel preview, commit, push, PR |

## Command Categories

**Ship system (4)**: The most documentation-heavy commands. `/ship-system-guide` is the primary reference; `/ship-optimization` and `/add-capital-ship` encode the pool architecture in executable form.

**Scene building (4)**: Additive operations — each adds a new element type to the scene. `/scene-audit` is the only diagnostic command.

**Config/export (1)**: `/export-scene-config` is the only command that reads scene state out rather than writing it.

**Workflow (2)**: `/lpr` and `/verpr` are CI/CD helpers, not 3D-specific.

**Guidance (1)**: `/mcp-and-guidance` is the meta-command — it explains the others and links to the wiki.

## Known Issues & Gaps

> ❓ Open question: There is no `/add-building` command. Adding buildings requires reading `CityBuildings.tsx` and `BuildingBlueprint.ts` directly — there is no equivalent to `/add-capital-ship` for the building system.

> ❓ Open question: There is no `/add-atmosphere` command for Rain, FogLayers, or NeonGridLines. New atmospheric elements require reading `Environment.tsx` directly.

> ❓ Open question: Commands can become stale if the codebase evolves. Is there a process for keeping command templates in sync with current component patterns (e.g., pool usage patterns)?

## Where Used

- [[concept-command-as-documentation]] — design principle: commands as living docs
- [[SCHEMA]] — commands are updated when wiki is updated (mcp-and-guidance links to wiki)

## See Also

- [[concept-command-as-documentation]] — why commands serve dual purpose
- [[entity-ships]] — ship commands encode ShipConfig and pooling patterns
- [[entity-scene]] — scene commands encode layer and depth conventions
- [[architecture-scene-composition]] — commands like /add-screen depend on this architecture
