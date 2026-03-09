# ─── Stage 1: deps ────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/bot/package.json ./apps/bot/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --filter bot...

# ─── Stage 2: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/bot/package.json ./apps/bot/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --filter bot...

COPY apps/bot/ ./apps/bot/
COPY apps/api/prisma/ ./apps/api/prisma/

# Generate Prisma client (schema apps/api dan)
RUN pnpm --filter bot exec prisma generate --schema=../api/prisma/schema.prisma

RUN pnpm --filter bot build

# ─── Stage 3: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/apps/bot/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN addgroup -g 1001 -S nodejs && adduser -S botuser -u 1001
USER botuser

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
