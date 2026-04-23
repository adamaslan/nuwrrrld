# Vercel Deploy + PR

Verifies the Next.js app builds and deploys successfully to Vercel, then creates a **brand new branch**, commits all changes, and opens a PR.

## Steps

1. Inventory changes: `git diff main...HEAD --stat` + `git status`
2. Scan all staged/changed files for secrets — stop if any are found
3. Create a new branch directly from the current branch (no need to switch to main first)
4. Stage all changed files (excluding secrets and `.env*`)
5. Run `npm run build` — fix all errors before continuing
6. Commit with a descriptive message
7. Push to remote
8. Deploy to Vercel preview with `vercel --yes` and confirm status is ● Ready
9. If deployment fails, check logs with `vercel inspect <url> --logs`, fix, rebuild, recommit, redeploy
10. Create a PR against `main` — only after deployment is confirmed ● Ready

## Rules

- Never commit `.env`, `.env.local`, credential files, or files matching secret patterns
- Scan every new/changed file for secrets before staging — `git diff HEAD` is the minimum check
- **Never reuse the current working branch — always create a new branch for each PR**
- No need to switch to main before branching — just `git checkout -b` from wherever you are
- Branch naming: `feature/`, `fix/`, or `refactor/` prefix — keep it short and kebab-case
- Commit format: `type(scope): description`
- **Commit happens BEFORE Vercel deploy** — Vercel deploys the committed tree
- **Only create the PR after the Vercel deployment is confirmed ● Ready**
- After deploying, include the preview URL in the PR body

## Common build errors in this repo

- **Syntax errors in `config/mediaConfig.ts`** — check for unclosed quotes in URL strings inside `links` arrays; trailing commas after last array item
- **Three.js / R3F import errors** — ensure `useFrame`, `useThree` come from `@react-three/fiber`; mesh/material types from `three`; helpers from `@react-three/drei`
- **Type errors in context files** — `OrbitControls` ref types need the cast pattern in `CameraContext.tsx`
- **Missing `'use client'` directive** — every new component that uses hooks or `useFrame` needs `'use client'` as its first line
- **Ref callback type mismatch** — when storing refs in arrays via callback (`ref={(el) => ...}`), cast: `el as THREE.Mesh` or `el as THREE.Group`
- **`useRef` array not pre-sized** — initialise with `useRef<T[]>(Array.from({ length: count }, () => defaultVal))` to avoid index-out-of-bounds during first frame
- **Geometry/material not disposed** — new components should not create `new THREE.Material()` / `new THREE.Geometry()` at render time; use `useMemo` or the pool system

## Execute

Run these steps now for the current working directory:

```bash
# 1. Inventory changes
git diff main...HEAD --stat
git status

# 2. Check for secrets in new/changed files (manual scan + grep)
git diff HEAD -- '*.ts' '*.tsx' '*.js' | grep -iE "(api_key|secret|password|token|private_key)" && echo "STOP: secrets found" || echo "clean"

# 3. Create a new branch from wherever you are (no main switch needed)
git checkout -b <feature|fix|refactor>/<short-description>

# 4. Stage relevant files (not secrets, not .env*)
git add <specific files>

# 5. Build (Next.js — runs from repo root, no subdirectory needed)
npm run build

# 5a. If build fails — fix TypeScript errors, Three.js import issues, mediaConfig syntax,
#     missing 'use client', bad ref types, etc. Re-stage changed files, then rebuild.
#     Repeat until build is clean before continuing.

# 6. Commit
git commit -m "$(cat <<'EOF'
type(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# 7. Push
git push -u origin HEAD

# 8. Deploy preview (from repo root, --yes skips interactive prompts)
vercel --yes

# 9. Confirm deployment is ● Ready — capture the URL from vercel output
vercel inspect <deployment-url> --logs

# 9a. If deploy fails — fix, re-stage, rebuild (step 5), recommit, repush, redeploy.
#     Do NOT create the PR until status is ● Ready.

# 10. Create PR (include preview URL in body)
gh pr create --title "..." --body "$(cat <<'EOF'
## Summary
- <bullet points describing scene/UI changes and why>

## Preview
<Vercel preview URL>

## Test plan
- [ ] `npm run build` passes locally
- [ ] Vercel preview deployment is ● Ready
- [ ] 3D scene loads without console errors
- [ ] New/changed elements render correctly in the scene
- [ ] Controls (orbit, zoom, remote panel) work on desktop
- [ ] Controls work on mobile (touch)
- [ ] No regressions on existing screens / ships / buildings

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Diagnose and fix **all** build and deploy failures before creating the PR. If a fix requires editing source files, re-stage those files before rebuilding.
