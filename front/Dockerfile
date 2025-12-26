# report_web/front/Dockerfile

# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build React app (จะได้ files ใน folder dist)
RUN npm run build

# --- Serve Stage (Nginx) ---
FROM nginx:alpine

# Copy ไฟล์ที่ build แล้วไปที่ Nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (สร้างไฟล์นี้ตามขั้นตอนถัดไป)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]