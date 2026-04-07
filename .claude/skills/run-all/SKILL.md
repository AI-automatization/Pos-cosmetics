---
name: run-all
description: Start all RAOS apps (Docker + API + Web + Worker + Bot)
disable-model-invocation: true
user-invocable: true
allowed-tools: Bash, Read
---

# Run All RAOS Apps

Start the full RAOS development stack in order.

## Steps

1. Set PATH for pnpm: `export PATH="/c/Users/Asus/AppData/Roaming/npm:$PATH"`
2. Start Docker infrastructure:
   ```bash
   cd C:/Users/Asus/Desktop/POS && docker compose up -d
   ```
3. Wait for Docker health checks to pass (postgres, redis, minio)
4. Start each app in background:
   ```bash
   pnpm --filter api dev    # NestJS → :3003
   pnpm --filter web dev    # Next.js → :3001
   pnpm --filter worker dev # BullMQ workers
   pnpm --filter bot dev    # Telegram bot (fails without BOT_TOKEN — OK)
   ```
5. Wait 15 seconds, then check each app's output for errors
6. Report status table:

| App | Port | Status |
|-----|------|--------|
| API | 3003 | ? |
| Web | 3001 | ? |
| Worker | — | ? |
| Bot | — | ? |

## Known issues
- pnpm not in PATH for background tasks — always prepend PATH export
- Prisma DLL lock — if API fails with EPERM, kill node processes first then `npx prisma generate`
- Worker needs `.env` with `REDIS_PORT=6380`
- Bot needs `BOT_TOKEN` env — skip if missing
