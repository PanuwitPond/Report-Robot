# ====================================================================
# Frontend Dockerfile - Report-Robot (React 18 + TypeScript + Vite)
# 
# IMPORTANT:
# - Multi-stage build to reduce image size
# - Stage 1: Build (uses node:18-alpine)
# - Stage 2: Production (uses nginx:alpine)
# - No changes to source code, only containerization
# ====================================================================

# Stage 1: Build stage
FROM node:18-alpine AS builder

LABEL maintainer="Report-Robot Team"
LABEL description="Frontend build stage for Report-Robot"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code (NOT modified from original)
COPY . .

# Build the application using Vite
RUN npm run build

# ====================================================================
# Stage 2: Production stage
# Serves static files with Nginx
# ====================================================================
FROM nginx:alpine

LABEL maintainer="Report-Robot Team"
LABEL description="Frontend production stage for Report-Robot"

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000 (matched with docker-compose.yml)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
