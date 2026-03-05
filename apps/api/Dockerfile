# ─── Stage 1: deps ────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install production deps only
RUN pnpm install --frozen-lockfile --filter api...

# ─── Stage 2: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install all deps (including devDependencies for build)
RUN pnpm install --frozen-lockfile --filter api...

# Copy source
COPY apps/api/ ./apps/api/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

# Generate Prisma client
RUN pnpm --filter api exec prisma generate

# Build
RUN pnpm --filter api build

# ─── Stage 3: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only production artifacts
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=deps    /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/prisma ./prisma

# Non-root user (security)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health/live || exit 1

ENTRYPOINT ["dumb-init", "--"]
# Migrations перед стартом (Railway/prod)
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
