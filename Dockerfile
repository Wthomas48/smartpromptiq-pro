FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Stage-0: Install dependencies and build
RUN npm ci && npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.cjs"]