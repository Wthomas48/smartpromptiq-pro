FROM node:18-alpine

WORKDIR /app

# Copy package.json first
COPY package*.json ./

# Install root dependencies
RUN npm ci

# Copy client package.json
COPY client/package*.json ./client/

# Copy all source files
COPY . .

# Build the client
RUN npm run build

# Expose port
EXPOSE 8080

# Start with simple server
CMD ["node", "server.cjs"]