# ==============================================================================
# SENSORIUM - Multi-Stage Sovereign Production Container (Linux Alpine / Node 22)
# ==============================================================================

# Stage 1: Build Dependencies & Asset Compilation
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native bindings if required
RUN apk add --no-cache python3 make g++

# Copy package descriptors first to leverage layer caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy complete project source
COPY . .

# Compile Frontend (Vite) and Backend (esbuild / TypeScript)
RUN npm run build

# Stage 2: Production Distroless / Lightweight Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime utilities & CA certificates for secure TLS
RUN apk add --no-cache curl ca-certificates dumb-init

# Create non-root user for Zero-Trust container security
RUN addgroup -S -g 1001 sensorium && \
    adduser -S -u 1001 -G sensorium sensorium

# Copy node_modules and built bundles
COPY --from=builder --chown=sensorium:sensorium /app/node_modules ./node_modules
COPY --from=builder --chown=sensorium:sensorium /app/dist ./dist
COPY --from=builder --chown=sensorium:sensorium /app/prisma ./prisma
COPY --from=builder --chown=sensorium:sensorium /app/package.json ./package.json
COPY --from=builder --chown=sensorium:sensorium /app/public ./public

# Expose HTTP, WebSocket & Metrics port
EXPOSE 3000

# Switch to unprivileged user
USER sensorium

# Healthcheck for container orchestrators (Kubernetes / Docker Swarm)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.cjs"]
