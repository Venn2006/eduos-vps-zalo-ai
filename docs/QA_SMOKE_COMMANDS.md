# QA Smoke Commands

Minimal verification commands for developers and reviewers to ensure basic build integrity.

```bash
# Verify branch and files
git status --short --untracked-files=all
git branch --show-current

# Run typescript checks on all workspaces
npm run typecheck

# Build the Next.js app and libraries
npm run build

# Run unit and integration tests
npm run test
```
