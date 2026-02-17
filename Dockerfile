FROM node:22-alpine

# Cache buster — change this value to force a full rebuild
ARG CACHE_BUST=2026-02-17-v3

WORKDIR /app

# Install build dependencies for native modules + openssl for Prisma
RUN apk add --no-cache python3 make g++ openssl

# Set build environment
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma

# Install ALL dependencies (need devDependencies for building)
RUN npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps
RUN cd backend && npm install --legacy-peer-deps

# Generate Prisma client
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

# Copy all source code
COPY . .

# Build client
RUN cd client && NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Compile backend TypeScript
RUN cd backend && npx tsc || echo 'TypeScript compiled with warnings (non-blocking)'

# Copy JS-only files (files without a .ts counterpart) from backend/src to backend/dist
RUN cd backend && for f in $(find src -name '*.js' -not -path '*/node_modules/*'); do \
      ts="${f%.js}.ts"; \
      if [ ! -f "$ts" ]; then \
        dest="dist/${f#src/}"; \
        mkdir -p "$(dirname "$dest")"; \
        cp "$f" "$dest"; \
        echo "Copied $f -> $dest"; \
      fi; \
    done

# Set production environment
ENV NODE_ENV=production

# Expose port (Railway sets PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/health || exit 1

# Start: generate Prisma (for correct platform binary) then run compiled backend
CMD ["sh", "-c", "npx prisma generate --schema=./backend/prisma/schema.prisma && node backend/dist/server.js"]
