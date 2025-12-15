# ====================================================================
# Backend Dockerfile - Report-Robot (NestJS + TypeScript)
#
# IMPORTANT:
# - Multi-stage build for optimal size
# - Stage 1: Build (uses node:18-alpine)
# - Stage 2: Runtime (uses node:18-alpine)
# - Connects to external databases (192.168.100.125, 35.186.159.153)
# - No changes to application code
# ====================================================================

# Stage 1: Build stage
FROM node:18-alpine AS builder

LABEL maintainer="Report-Robot Team"
LABEL description="Backend build stage for Report-Robot"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code (NOT modified from original)
COPY . .

# Build NestJS application
RUN npm run build

# ====================================================================
# Stage 2: Production Runtime stage
# Minimal image with only production dependencies
# ====================================================================
FROM node:18-alpine

LABEL maintainer="Report-Robot Team"
LABEL description="Backend runtime stage for Report-Robot"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy environment file template (optional)
# COPY .env.example .env

# Expose API port 3001 (matched with docker-compose.yml)
EXPOSE 3001

# Health check (ping /api/health endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
# NOTE: TypeORM migrations will run before starting the app
CMD ["node", "dist/main.js"]
