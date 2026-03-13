# Vercel Deploy + PR

Verifies the Next.js app builds and deploys successfully to Vercel, then creates a **brand new branch**, commits all changes, and opens a PR.

## Steps

1. Checkout a fresh branch off `main` — always start clean, never reuse the current branch
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
- **Always checkout a brand new branch off main — never commit to the current branch or reuse an existing feature branch**
- Branch naming: `feature/`, `fix/`, or `refactor/` prefix — keep it short and kebab-case
- Commit format: `type(scope): description`
- PR body includes summary of what changed in the 3D scene/UI and a test plan
- **Only create the PR after the Vercel deployment is confirmed ● Ready**

## Execute

Run these steps now for the current working directory:

```bash
# 1. Checkout a brand new branch off main
git checkout main
git pull origin main
git checkout -b <feature|fix|refactor>/<short-description>

# 2. Stage relevant files (not secrets)
git add <specific files>

# 3. Build (Next.js — runs from repo root, no subdirectory)
npm run build

# 4. If build fails — fix TypeScript errors, Three.js import issues, etc., re-stage, rebuild

# 5. Deploy preview (from repo root)
vercel

# 6. Confirm deployment is ● Ready
vercel inspect <deployment-url> --logs

# 7. If deploy fails — fix, re-stage, rebuild, redeploy, confirm before continuing

# 8. Commit
git commit -m "type(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# 9. Push
git push -u origin HEAD

# 10. Create PR
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
