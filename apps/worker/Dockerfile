# ─── Stage 1: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/worker/package.json ./apps/worker/
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

RUN pnpm install --frozen-lockfile --filter worker... --filter api

COPY apps/api/prisma/ ./apps/api/prisma/
RUN node_modules/.bin/prisma generate --schema=/app/apps/api/prisma/schema.prisma

COPY apps/worker/ ./apps/worker/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

RUN pnpm --filter worker build

# Self-contained deploy bundle
RUN pnpm deploy --filter worker --prod --legacy /deploy
RUN cp -r /app/apps/worker/dist /deploy/dist

# Copy .prisma generated client
RUN PRISMA_DIR=$(find /app/node_modules -maxdepth 6 -name ".prisma" -type d 2>/dev/null | head -1) && \
    if [ -n "$PRISMA_DIR" ]; then cp -r "$PRISMA_DIR" /deploy/node_modules/.prisma; fi

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
