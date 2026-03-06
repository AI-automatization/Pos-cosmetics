# ─── Stage 1: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace manifests + .npmrc (shamefully-hoist=true for predictable node_modules)
COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install all deps (dev + prod) for building
RUN pnpm install --frozen-lockfile --filter api...

# Copy source
COPY apps/api/ ./apps/api/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

# Generate Prisma client (with shamefully-hoist goes to /app/node_modules/.prisma)
RUN pnpm --filter api exec prisma generate

# Build NestJS app
RUN pnpm --filter api build

# Create self-contained production bundle (no symlinks, no devDeps)
RUN pnpm deploy --filter api --prod /deploy

# Copy build artifacts and generated Prisma client into /deploy
RUN cp -r /app/apps/api/dist /deploy/dist && \
    cp -r /app/apps/api/prisma /deploy/prisma && \
    cp -r /app/node_modules/.prisma /deploy/node_modules/.prisma

# ─── Stage 2: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy self-contained bundle from builder
COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /deploy/dist ./dist
COPY --from=builder /deploy/prisma ./prisma

# Non-root user (security)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health/live || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
