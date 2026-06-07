# ─── Stage 1: builder ─────────────────────────────────────────
# cache-bust: 2026-05-17
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY .npmrc package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile --filter web...

COPY apps/web/ ./apps/web/
COPY packages/types/ ./packages/types/
COPY packages/ui/ ./packages/ui/

# Ensure public dir exists (Next.js standalone requires it)
RUN mkdir -p ./apps/web/public

ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
# Railway injects service env vars as Docker build args when ARG is declared.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# #141: the middleware reads SESSION_SIGNING_SECRET to verify the signed `role_sig`
# cookie that gates /finance, /settings, /realestate. The Edge middleware bundle
# INLINES env at build time, so a runtime-only var is invisible to it (OWNER/ADMIN
# would get redirected to /dashboard). Bake it at build: prefer an injected value,
# otherwise generate a strong random one. The same value is carried to the runner
# (sess.env) so the /api/session route signs with the identical secret. Rotates per
# build → stale cookies self-heal on next load (useCurrentUser → syncSignedRole).
ARG SESSION_SIGNING_SECRET
RUN if [ -z "$SESSION_SIGNING_SECRET" ]; then \
      SESSION_SIGNING_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"); \
    fi; \
    echo "SESSION_SIGNING_SECRET=$SESSION_SIGNING_SECRET" > /tmp/sess.env; \
    cat /tmp/sess.env >> ./apps/web/.env.production

RUN pnpm --filter web build

# ─── Stage 2: runner ──────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
# Same build-time signing secret for the Node runtime (/api/session route).
COPY --from=builder --chown=nextjs:nodejs /tmp/sess.env /app/sess.env

USER nextjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3001}/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
# Load the build-time SESSION_SIGNING_SECRET into the runtime env, then start.
CMD ["sh", "-c", "set -a; . /app/sess.env; set +a; exec node apps/web/server.js"]
