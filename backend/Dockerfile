# Use Node.js Alpine image
FROM node:20-alpine3.16

# Install dependencies required for Prisma
# Using openssl3 instead of openssl1.1 which is deprecated
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"]