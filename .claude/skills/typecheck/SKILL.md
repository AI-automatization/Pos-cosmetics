---
name: typecheck
description: Run TypeScript type checking on all RAOS apps
disable-model-invocation: true
user-invocable: true
allowed-tools: Bash
---

# TypeScript Type Check

Run `tsc --noEmit` on all apps to catch type errors before push.

## Steps

1. Set PATH: `export PATH="/c/Users/Asus/AppData/Roaming/npm:$PATH"`
2. Run type check for each app:
   ```bash
   cd C:/Users/Asus/Desktop/POS
   pnpm --filter api exec tsc --noEmit
   pnpm --filter web exec tsc --noEmit
   pnpm --filter worker exec tsc --noEmit
   pnpm --filter bot exec tsc --noEmit
   ```
3. Report results per app:

| App | Errors | Status |
|-----|--------|--------|
| api | 0 | pass/fail |
| web | 0 | pass/fail |
| worker | 0 | pass/fail |
| bot | 0 | pass/fail |

4. If errors found — list each with file:line and suggest fix
