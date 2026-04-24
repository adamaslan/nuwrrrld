---
date: 2026-04-23
type: concept
tags: [commands, documentation, workflow, living-docs]
sources: [.claude/commands/]
---

# Concept: Command as Documentation

## The Pattern

The 12 slash commands in `.claude/commands/` serve a dual purpose: they are both executable workflows (Claude loads and follows them on invocation) and living documentation (a human can read them to understand the system). A command like `/add-capital-ship` contains a complete `CapitalShip` component template (~212 lines), the geometry pool setup code, the material pool setup code, a performance metrics table, and a DO/DON'T list. This is simultaneously a how-to guide and a code generator.

This collapses the gap between documentation and implementation. The documentation *is* the implementation guide, and the implementation guide *is* what Claude executes.

## Where It Appears

- All 12 files in `.claude/commands/`
- Most commands contain: argument specification, code templates, configuration examples, common mistakes, DO/DON'T lists
- `/ship-system-guide` — pure reference, no code generation
- `/add-capital-ship` — heaviest code template (~212-line component)
- `/scene-audit` — diagnostic checklist, no code generation
- `/lpr` and `/verpr` — workflow scripts, no 3D code

## Why It Works

Commands are loaded by Claude Code at invocation time. They encode domain knowledge that is too specialized for a general-purpose LLM to know without being told: that ships use seeded random, that pools must be set up before components, that depth layers have specific Z-ranges. By putting this knowledge in the command file, any Claude Code session has immediate access to it without needing to re-derive it from the codebase.

The command file also serves as a contract: if the codebase changes, the command should be updated to match. The command is wrong if the code is right; the command is right if the code matches. This is the same maintenance responsibility as documentation, but it is more likely to be maintained because the command is *used* regularly.

## Contradictions / Tensions

**Stale commands**: Commands can drift from the codebase. If `PoolContext` is refactored and `/add-capital-ship` still generates the old pool usage pattern, Claude will generate invalid code on invocation. There is no automated check for command/codebase alignment.

**Commands and wiki are parallel systems**: The wiki (this document) and the commands (`.claude/commands/`) are both documentation systems. They should cross-reference each other but were built independently. The wiki now links to commands (via [[entity-commands]]); the commands should link back to wiki pages. `/mcp-and-guidance` has been updated to do this.

**Commands are not searchable as a corpus**: Each command is a standalone file. There is no cross-command index and no way to ask "which command covers LOD?" without reading all 12. The wiki's [[entity-commands]] page fills this gap.

> ❓ Open question: Should `/scene-audit` update the wiki log when it finds issues? This would close the loop between the diagnostic command and the wiki's knowledge base.

## See Also

- [[entity-commands]] — catalog of all 12 commands with categories and gaps
- [[SCHEMA]] — wiki conventions; commands should reference wiki pages
- [[ORIGIN]] — why this wiki exists; commands predate the wiki and informed its design
