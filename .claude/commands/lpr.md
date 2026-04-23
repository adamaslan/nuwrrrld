# Descriptive PR Creator

Creates a new branch, builds locally, commits all changes, and opens a PR with a detailed description that helps reviewers understand the code — not just what changed, but **why** and **how it works**.

## Steps

1. Run `git diff main...HEAD` and `git status` to inventory all changes
2. Read every changed file to fully understand the modifications
3. Create a new branch directly from the current branch (no need to switch to main first)
4. Stage all changed files (excluding secrets and `.env*`)
5. Run `npm run build` to confirm the Next.js build passes locally
6. If build fails, diagnose and fix before continuing
7. Commit with a descriptive message
8. Push to remote
9. Create a PR against `main` with a rich educational description

## PR Body Format

The PR body should teach the reviewer. Write it as if the reviewer has never touched this part of the codebase. Include:

### Summary
- Bullet list of what changed and **why**

### How it works
- Explain the key logic: data flow, state shape, key functions, side effects
- Call out non-obvious implementation choices (e.g. why a ref instead of state, why world-space vs camera-space)
- If Three.js / R3F / OrbitControls concepts are involved, briefly explain the relevant 3D concepts so a JS-only reviewer can follow

### Files changed
- Table or list: `file path` | what it does | what changed

### Test plan
- Checklist of what to manually verify
- Specific interactions to test (not just "it works")

### Known limitations / follow-ups
- Anything deferred, approximate, or worth revisiting

## Rules

- Never commit `.env`, `.env.local`, credential files, or files matching secret patterns
- Scan all new/changed files for secrets before staging
- **Never reuse the current working branch — always create a new branch for each PR**
- No need to switch to main before branching — just `git checkout -b` from wherever you are
- Branch naming: `feature/`, `fix/`, or `refactor/` prefix — keep it short and kebab-case
- Commit format: `type(scope): description`
- **Read the actual changed code before writing the PR body** — never write generic filler

## Common build errors in this repo

- **Syntax errors in `config/mediaConfig.ts`** — check for unclosed quotes in URL strings inside `links` arrays
- **Three.js / R3F import errors** — ensure imports come from `@react-three/fiber` or `@react-three/drei`, not bare `three`
- **Type errors in context files** — `OrbitControls` ref types need the cast pattern in `CameraContext.tsx`

## Execute

Run these steps now for the current working directory:

```bash
# 1. Understand what changed
git diff main...HEAD --stat
git status

# 2. Read changed files (do this before writing PR body)

# 3. Create a new branch
git checkout -b <feature|fix|refactor>/<short-description>

# 4. Stage relevant files (not secrets)
git add <specific files>

# 5. Build
npm run build

# 6. If build fails — fix TypeScript errors, Three.js import issues, mediaConfig syntax, etc., re-stage, rebuild

# 7. Commit
git commit -m "type(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# 8. Push
git push -u origin HEAD

# 9. Create PR with educational body
gh pr create --title "..." --body "$(cat <<'EOF'
## Summary
- <what changed and why>

## How it works
<explain the key logic, data flow, and non-obvious decisions>

## Files changed
| File | Role | What changed |
|------|------|--------------|
| `path/to/file` | <what it does> | <what changed> |

## Test plan
- [ ] `npm run build` passes locally
- [ ] 3D scene loads and renders correctly
- [ ] <specific interaction to test>
- [ ] <specific interaction to test>
- [ ] Works on mobile (touch events)

## Known limitations / follow-ups
- <anything deferred or approximate>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Always diagnose and fix all build failures before creating the PR. Write the PR body **after** reading the code — the description should reflect real understanding, not a summary of commit messages.
