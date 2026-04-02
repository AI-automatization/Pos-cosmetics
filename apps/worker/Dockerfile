# ─── Stage 1: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace manifests
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/worker/package.json ./apps/worker/
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install deps (worker + api for prisma CLI)
RUN pnpm install --frozen-lockfile --filter worker... --filter api

# Copy prisma schema
COPY apps/api/prisma/ ./apps/api/prisma/

# Generate Prisma client
RUN pnpm --filter api exec prisma generate

# Copy source
COPY apps/worker/ ./apps/worker/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

# Build
RUN pnpm --filter worker build

# Self-contained prod bundle
RUN pnpm deploy --filter worker --prod --legacy /deploy
RUN cp -r /app/apps/worker/dist /deploy/dist

# Copy generated Prisma client
RUN PRISMA_DIR=$(find /app/node_modules -maxdepth 6 -name ".prisma" -type d 2>/dev/null | head -1) && \
    if [ -n "$PRISMA_DIR" ]; then cp -r "$PRISMA_DIR" /deploy/node_modules/.prisma; \
    else echo "WARNING: .prisma not found, skipping copy"; fi

# ─── Stage 2: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /deploy/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S worker -u 1001
USER worker

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
