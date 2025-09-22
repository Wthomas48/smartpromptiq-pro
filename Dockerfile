FROM node:18-alpine

WORKDIR /app

# Set build environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/
COPY backend/package*.json ./backend/

# Install dependencies with npm ci for faster, reliable builds
RUN npm ci
RUN cd client && npm ci
RUN cd backend && npm ci

# Copy source code
COPY . .

# Build client application
RUN cd client && timeout 600 npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]