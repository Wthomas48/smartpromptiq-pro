# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY backend/package*.json backend/
RUN npm --prefix backend ci
COPY client/package*.json client/
RUN npm --prefix client ci

# ---------- build client ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app /app
COPY . .
RUN npm --prefix client run build

# ---------- runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
# copy app source + built assets + node_modules
COPY --from=build /app /app
EXPOSE 8080
CMD ["node", "backend/simple-server.js"]
