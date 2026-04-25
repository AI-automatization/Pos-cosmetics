# ─── Stage 1: builder ─────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/super-admin/package.json ./apps/super-admin/

RUN pnpm install --no-frozen-lockfile --filter super-admin...

COPY apps/super-admin/ ./apps/super-admin/

# Ensure public dir exists (Next.js standalone requires it)
RUN mkdir -p ./apps/super-admin/public

ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter super-admin build

# ─── Stage 2: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/apps/super-admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/super-admin/.next/static ./apps/super-admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/super-admin/public ./apps/super-admin/public

USER nextjs
EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3002/login || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/super-admin/server.js"]
