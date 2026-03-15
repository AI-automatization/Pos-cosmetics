# ─── Stage 1: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# .npmrc (shamefully-hoist=true) must be present for consistent hoisting
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install all deps (dev + prod) — needed for prisma generate + nest build
RUN pnpm install --no-frozen-lockfile --filter api...

# Copy source
COPY apps/api/ ./apps/api/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

# Generate Prisma client
RUN pnpm --filter api exec prisma generate

# Build NestJS
RUN pnpm --filter api build

# Create self-contained production bundle at /deploy (no symlinks, no devDeps)
RUN pnpm deploy --filter api --prod --legacy /deploy

# Copy compiled JS + prisma schema into /deploy
RUN cp -r /app/apps/api/dist /deploy/dist && \
    cp -r /app/apps/api/prisma /deploy/prisma

# Copy generated Prisma client — pnpm v10 stores it deep in virtual store, use find
RUN PRISMA_DIR=$(find /app/node_modules -maxdepth 6 -name ".prisma" -type d 2>/dev/null | head -1) && \
    if [ -n "$PRISMA_DIR" ]; then \
      cp -r "$PRISMA_DIR" /deploy/node_modules/.prisma && \
      echo "Prisma client copied from: $PRISMA_DIR"; \
    else \
      echo "WARNING: .prisma not found in node_modules, trying apps/api/node_modules" && \
      PRISMA_DIR2=$(find /app/apps/api/node_modules -maxdepth 6 -name ".prisma" -type d 2>/dev/null | head -1) && \
      [ -n "$PRISMA_DIR2" ] && cp -r "$PRISMA_DIR2" /deploy/node_modules/.prisma || echo "ERROR: .prisma not found anywhere"; \
    fi

# ─── Stage 2: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Self-contained bundle from builder
COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /deploy/dist         ./dist
COPY --from=builder /deploy/prisma       ./prisma

# Prisma CLI for migrations at startup
COPY --from=builder /app/node_modules/.bin/prisma  ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma        ./node_modules/prisma

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 && \
    mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health/live || exit 1

ENTRYPOINT ["dumb-init", "--"]
# Migration failure should NOT block app startup (Railway may run migrations separately)
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy || echo '[startup] Migration skipped'; node dist/main"]
