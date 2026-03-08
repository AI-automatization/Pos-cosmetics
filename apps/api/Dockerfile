# ─── Stage 1: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
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

# Generate Prisma client (shamefully-hoist puts it in /app/node_modules/.prisma)
RUN pnpm --filter api exec prisma generate

# Build NestJS app
RUN pnpm --filter api build

# ─── Stage 2: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 && \
    mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Hoisted node_modules (includes Prisma client + CLI via shamefully-hoist)
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Workspace packages — needed so pnpm symlinks in node_modules resolve correctly
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

# Built NestJS app
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist

# Prisma schema + migrations (used by `prisma migrate deploy` at startup)
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma

USER nestjs
EXPOSE 3000

COPY apps/api/start.sh ./start.sh

CMD ["sh", "start.sh"]
