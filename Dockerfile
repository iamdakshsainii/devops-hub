# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lock files and prisma schema first for caching
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies - including devDependencies for the build stage later
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build time (Next.js needs some for static generation)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Re-run prisma generate if needed (some files might be in .gitignore)
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential files for standalone mode
COPY --from=builder /app/public ./public

# Set permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Leverages output: 'standalone' to significantly reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
CMD ["node", "server.js"]
