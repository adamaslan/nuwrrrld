# MCP and Guidance Helper

This skill helps you find and understand MCP (Model Context Protocol) servers and general development guidance for the nuwrrrld project.

## What This Does

This skill provides quick access to:
- MCP server configurations and status
- General development guidelines
- Python development best practices
- Mamba package manager rules
- Project-specific commands and utilities

## Quick Reference

### MCP Servers

**Current Status:**
- Check MCP servers: Run `claude mcp list`
- View config: See `/Users/adamaslan/.claude/config.json`
- Add MCP server: Use `claude mcp add <name>`

**Available MCP Servers for Project:**
- **Figma**: Design collaboration (configured in user settings)
- Other servers can be added as needed for the project

### General Guidance Files

**User-Level Guidelines** (apply to all projects):
- `/Users/adamaslan/.claude/CLAUDE.md` - Python Development Guidelines 2
  - Core principles (Law of Demeter, SRP, Early Returns)
  - Object-oriented design patterns
  - Error handling and safety
  - Type hints and documentation
  - Testing best practices
  - Async programming patterns

- `/Users/adamaslan/.claude/rules/mamba-rules.md` - Mamba Package Manager Rules
  - Mamba-first philosophy (faster than conda)
  - Environment management best practices
  - Using micromamba for CI/CD
  - conda-lock for reproducibility
  - Channel management (prefer conda-forge)

**Project-Level Skills** (nuwrrrld):
Run any of these as `/skill-name`:
- `ship-system-guide` - Architecture and scaling guide
- `ship-optimization` - Advanced optimization techniques
- `ship-examples` - Copy-paste templates for ships
- `add-capital-ship` - Add optimized capital ships
- `export-scene-config` - Export scene configuration
- `add-environment-layer` - Add 3D environment layer
- `add-screen` - Add TV screen to scene
- `scene-audit` - Audit scene for issues
- `cyberpunk-theme` - Apply cyberpunk theme

## How to Use

### Find Development Guidelines
```bash
# Python best practices
cat /Users/adamaslan/.claude/CLAUDE.md

# Mamba/dependency management
cat /Users/adamaslan/.claude/rules/mamba-rules.md

# Project-specific guidance
cd /Users/adamaslan/code/nuwrrrld
ls .claude/commands/
```

### Check MCP Configuration
```bash
# List active MCP servers
claude mcp list

# View your MCP config
cat /Users/adamaslan/.claude/config.json

# Add a new MCP server
claude mcp add <server-name>
```

### Access Project Skills
1. Run a skill: `/ship-system-guide`
2. List available skills: `ls /Users/adamaslan/code/nuwrrrld/.claude/commands/`
3. View skill details: `cat /Users/adamaslan/code/nuwrrrld/.claude/commands/<skill-name>.md`

## Key Principles to Remember

From CLAUDE.md:
- **Single Responsibility**: Each function/class has one purpose
- **Early Returns**: Use guard clauses instead of deep nesting
- **Type Hints**: Always annotate public APIs
- **Dependency Injection**: Pass dependencies, don't create them
- **Immutability**: Prefer frozen dataclasses
- **Async for I/O**: Use asyncio for non-blocking operations
- **Specific Exception Handling**: Catch exact exception types

From Mamba Rules:
- **Always use mamba, not conda** (unless using `conda config`)
- **Use micromamba** for faster package management
- **Install all packages at once** when creating environments
- **Prefer conda-forge** channel for most packages
- **Use conda-lock** for reproducible builds

## Project Structure

```
/Users/adamaslan/code/nuwrrrld/
├── .claude/
│   ├── commands/              # Custom skills and utilities
│   ├── settings.local.json    # Project permissions
│   └── (guidance inherited from ~/.claude/)
├── src/                       # Source code
├── package.json               # Dependencies
└── ...
```

## Common Tasks

### I need guidance on Python code
→ See `/Users/adamaslan/.claude/CLAUDE.md`

### I'm struggling with dependencies
→ See `/Users/adamaslan/.claude/rules/mamba-rules.md`

### I need to optimize the ship system
→ Run `/ship-optimization` or `/ship-system-guide`

### I want to add 3D elements to the scene
→ Run `/add-capital-ship`, `/add-screen`, `/add-environment-layer`

### I need to understand the architecture
→ Run `/ship-system-guide`

## Next Steps

1. Review the principle files (CLAUDE.md, mamba-rules.md)
2. Explore project-specific skills in `.claude/commands/`
3. Use appropriate skills based on your current task
4. Check MCP status with `claude mcp list`

---

**Last Updated**: January 28, 2026
**Scope**: User-level and project-level guidance
