FROM node:18-alpine

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set build environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/
COPY backend/package*.json ./backend/

# Install dependencies with npm install for compatibility
RUN npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps
RUN cd backend && npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build client application with extended timeout
RUN cd client && npm run build || (echo "Build failed" && exit 1)

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]