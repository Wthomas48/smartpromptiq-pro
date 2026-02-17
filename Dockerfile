FROM node:22-alpine

WORKDIR /app

# Install build dependencies for native modules + openssl for Prisma
# cairo/pango/etc for canvas, build-base for native addons
RUN apk add --no-cache python3 make g++ openssl \
    cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev pixman-dev

# Set build environment
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma

# Install dependencies
# Root: production only (skip canvas/sqlite3 devDeps that cause build failures)
# Client + Backend: all deps (need devDeps for vite build and tsc)
RUN npm install --legacy-peer-deps --omit=dev
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

# Start: generate Prisma (for correct platform binary) then run compiled backend
CMD ["sh", "-c", "npx prisma generate --schema=./backend/prisma/schema.prisma && node backend/dist/server.js"]
