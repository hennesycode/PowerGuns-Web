FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN pnpm exec prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV CI=true

# OpenSSL necesario para Prisma en runtime
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN corepack enable && pnpm --version

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# node_modules completo para que Prisma (adapter, engine, driver) funcione en runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Prisma schema, migraciones y config para migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

COPY <<'EOF' start.sh
#!/bin/sh
node node_modules/prisma/build/index.js migrate deploy 2>&1 || echo "Migraciones ya aplicadas o no disponibles"
exec node server.js
EOF
RUN chown nextjs:nodejs start.sh && chmod +x start.sh && chown nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["sh", "/app/start.sh"]
