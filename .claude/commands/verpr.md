# Vercel Deploy + PR

Verifies the Next.js app builds and deploys successfully to Vercel, then creates a **brand new branch**, commits all changes, and opens a PR.

## Steps

1. Create a new branch directly from the current branch (no need to switch to main first)
2. Stage all changed files (excluding secrets and `.env*`)
3. Run `npm run build` to confirm the Next.js build passes locally
4. If build fails, diagnose and fix the error before continuing
5. Deploy to Vercel preview with `vercel` and confirm status is ● Ready
6. If deployment fails, check logs with `vercel inspect <url> --logs` and fix
7. Commit with a descriptive message
8. Push to remote
9. Create a PR against `main`

## Rules

- Never commit `.env`, `.env.local`, credential files, or files matching secret patterns
- Scan all new/changed files for secrets before staging
- **Never reuse the current working branch — always create a new branch for each PR**
- No need to switch to main before branching — just `git checkout -b` from wherever you are
- Branch naming: `feature/`, `fix/`, or `refactor/` prefix — keep it short and kebab-case
- Commit format: `type(scope): description`
- PR body includes summary of what changed in the 3D scene/UI and a test plan
- **Only create the PR after the Vercel deployment is confirmed ● Ready**
- After deploying, add a PR comment with the new preview URL if updating an existing PR

## Common build errors in this repo

- **Syntax errors in `config/mediaConfig.ts`** — check for unclosed quotes in URL strings inside `links` arrays
- **Three.js / R3F import errors** — ensure imports come from `@react-three/fiber` or `@react-three/drei`, not bare `three`
- **Type errors in context files** — `OrbitControls` ref types need the cast pattern in `CameraContext.tsx`

## Execute

Run these steps now for the current working directory:

```bash
# 1. Create a new branch from wherever you are (no main switch needed)
git checkout -b <feature|fix|refactor>/<short-description>

# 2. Stage relevant files (not secrets)
git add <specific files>

# 4. Build (Next.js — runs from repo root, no subdirectory)
npm run build

# 5. If build fails — fix TypeScript errors, Three.js import issues, mediaConfig syntax, etc., re-stage, rebuild

# 6. Deploy preview (from repo root)
vercel

# 7. Confirm deployment is ● Ready
vercel inspect <deployment-url> --logs

# 8. If deploy fails — fix, re-stage, rebuild, redeploy, confirm before continuing

# 9. Commit
git commit -m "type(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# 10. Push
git push -u origin HEAD

# 11. Create PR
gh pr create --title "..." --body "$(cat <<'EOF'
## Summary
- <bullet points describing scene/UI changes>

## Test plan
- [ ] `npm run build` passes locally
- [ ] Vercel preview deployment is ● Ready
- [ ] 3D scene loads and renders correctly
- [ ] Controls (orbit, zoom, remote panel) work on desktop
- [ ] Controls work on mobile (touch)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Always start from a fresh branch off main. Diagnose and fix all build/deploy failures before creating the PR.
