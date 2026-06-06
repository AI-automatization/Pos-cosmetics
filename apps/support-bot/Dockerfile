FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/support-bot/package.json ./apps/support-bot/
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/catalog-import/package.json ./packages/catalog-import/

RUN pnpm install --frozen-lockfile --filter support-bot... --filter api

COPY apps/api/prisma/ ./apps/api/prisma/
RUN pnpm --filter api exec prisma generate

COPY apps/support-bot/ ./apps/support-bot/
COPY packages/types/ ./packages/types/
COPY packages/utils/ ./packages/utils/

RUN pnpm --filter support-bot build

RUN mkdir -p /deploy && \
    cp -r /app/apps/support-bot/dist /deploy/dist && \
    cp /app/apps/support-bot/package.json /deploy/package.json

RUN cd /app && pnpm install --prod --filter support-bot --ignore-scripts 2>/dev/null; \
    cp -r /app/node_modules /deploy/node_modules 2>/dev/null; \
    PRISMA_DIR=$(find /app/node_modules -maxdepth 6 -name ".prisma" -type d 2>/dev/null | head -1) && \
    if [ -n "$PRISMA_DIR" ]; then \
      mkdir -p /deploy/node_modules/.prisma && \
      cp -r "$PRISMA_DIR"/* /deploy/node_modules/.prisma/ 2>/dev/null; \
    fi; true

FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /deploy/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S botuser -u 1001
USER botuser

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
