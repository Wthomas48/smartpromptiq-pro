FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install all dependencies (root and client)
RUN npm ci && cd client && npm ci

# Copy all source files
COPY . .

# Stage-0: Build the client
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.cjs"]