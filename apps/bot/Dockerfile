# ─── Stage 1: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace manifests
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/bot/package.json ./apps/bot/
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install deps (bot + api for prisma CLI)
RUN pnpm install --frozen-lockfile --filter bot... --filter api

# Copy prisma schema
COPY apps/api/prisma/ ./apps/api/prisma/

# Generate Prisma client
RUN pnpm --filter api exec prisma generate

# Copy source
COPY apps/bot/ ./apps/bot/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

# Build
RUN pnpm --filter bot build

# Self-contained prod bundle
RUN pnpm deploy --filter bot --prod --legacy /deploy
RUN cp -r /app/apps/bot/dist /deploy/dist

# Copy generated Prisma client
RUN PRISMA_DIR=$(find /app/node_modules -maxdepth 5 -name ".prisma" -type d 2>/dev/null | head -1) && \
    [ -n "$PRISMA_DIR" ] && cp -r "$PRISMA_DIR" /deploy/node_modules/.prisma || \
    echo "WARNING: .prisma not found, skipping copy"

# ─── Stage 2: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S botuser -u 1001
USER botuser

COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /deploy/dist ./dist

CMD ["dumb-init", "node", "dist/main.js"]
