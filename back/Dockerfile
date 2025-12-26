# report_web/back/Dockerfile

# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files เพื่อ install dependencies ก่อน (ใช้ cache layer)
COPY package*.json ./

# Install dependencies ทั้งหมด (รวม devDependencies เพื่อ build)
RUN npm install

# Copy source code ทั้งหมด
COPY . .

# Build โปรเจกต์ (จะได้ folder dist)
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS production

WORKDIR /app

# ติดตั้ง dependencies ที่จำเป็นสำหรับ OS (ffmpeg สำหรับ fluent-ffmpeg)
RUN apk add --no-cache ffmpeg

# Copy package files อีกครั้ง
COPY package*.json ./

# Install เฉพาะ dependencies สำหรับ production เท่านั้น
RUN npm install --only=production

# Copy built code จาก stage builder
COPY --from=builder /app/dist ./dist

# Expose port (NestJS default 3000)
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]