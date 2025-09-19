FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies and build
RUN npm ci && npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.cjs"]