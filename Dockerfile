FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Copy client package.json
COPY client/package*.json ./client/

# Install root dependencies
RUN npm ci

# Copy all source files
COPY . .

# Stage-0: Run build
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.cjs"]