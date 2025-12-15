# ====================================================================
# MROI Backend Dockerfile (Express.js + Node.js)
#
# IMPORTANT:
# - Single-stage build (Node.js runs server directly)
# - Node 18 LTS for stability (supports async/await, FFmpeg)
# - Includes FFmpeg for snapshot generation
# - Connects to PostgreSQL mroi_db in Docker
# - Completely isolated from Report-Robot backend
# ====================================================================

FROM node:18-alpine

LABEL maintainer="Report-Robot Team"
LABEL description="MROI Backend server (Express.js)"

# Install system dependencies required by MROI
# - ffmpeg: For RTSP stream handling and snapshot generation
# - python3, py3-pip: For AI/ML processing (if needed)
# - g++, make: For native module compilation
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    g++ \
    make

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source code
COPY . .

# Expose API port 5050 (matched with docker-compose.yml)
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5050/api/schemas || exit 1

# Start the application
# NOTE: Database migrations run before server starts
CMD ["npm", "start"]