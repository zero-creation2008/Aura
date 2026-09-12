# ==============================================================================
# AURA Autonomous AI Software Development Platform - Dockerfile
# ==============================================================================
FROM node:20-alpine AS base

WORKDIR /app

# Install system dependencies needed for git and python sandbox runner
RUN apk add --no-cache git python3 make g++ bash

# Copy dependencies manifest
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend and bundled Node server
RUN npm run build

# Expose port 3000
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "dist/server.cjs"]
