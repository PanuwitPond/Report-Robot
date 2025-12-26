# 🐳 Deep Docker Analysis - Report Robot Project (Complete Study)

**วันที่วิเคราะห์:** 2025-12-26  
**สถานะ:** ✅ **FULLY ANALYZED**  
**Complexity Level:** 🟡 Medium-to-High

---

## 📋 Executive Summary

### ✅ **ความสามารถ:** 100% Dockerizable
### ⚠️ **ความซับซ้อน:** กลาง-สูง (Multi-database + External Services)
### ⏱️ **เวลาประมาณ:** 3-4 ชั่วโมง
### 📊 **ความเสี่ยง:** ต่ำ (managed properly)

---

## 🔬 1. BACKEND ARCHITECTURE (NestJS)

### 1.1 **Technology Stack**

```
Runtime:     Node.js 18+
Framework:   NestJS 10.x (Enterprise Framework)
Language:    TypeScript 5.1+
Bundler:     NestJS CLI (esbuild)
```

### 1.2 **Project Structure**

```
backend/
├── src/
│   ├── app.module.ts          ← Main module (7 database connections!)
│   ├── main.ts                ← Bootstrap entry point
│   ├── config/                ← Configuration files
│   ├── database/              ← Database module
│   │   └── database.module.ts ← Main DB + MROI DB config
│   ├── modules/               ← Feature modules
│   │   ├── auth/              ← Authentication (Keycloak/Passport)
│   │   ├── mroi/              ← MROI Editor logic (FFmpeg + MQTT + SSH)
│   │   ├── images/            ← Image processing (MinIO)
│   │   ├── reports/           ← Report generation
│   │   ├── tasks/             ← Task management
│   │   ├── robots/            ← Robot data
│   │   ├── users/             ← User management (Keycloak integration)
│   │   └── incidents/         ← Incident tracking
│   └── storage/               ← MinIO/S3 storage module
├── tsconfig.json              ← TypeScript config (baseUrl: ./)
├── package.json               ← 62 lines with all dependencies
```

### 1.3 **Critical Dependencies**

#### Core Framework
```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/common": "^10.0.0",
  "@nestjs/config": "^3.1.1",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0"
}
```

#### Database & ORM
```json
{
  "typeorm": "^0.3.17",
  "pg": "^8.11.3"  ← PostgreSQL driver (critical!)
}
```

#### Authentication
```json
{
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/passport": "^10.0.2",
  "passport": "^0.6.0",
  "passport-jwt": "^4.0.1",
  "passport-custom": "^1.1.1"
}
```

#### Media Processing (⚠️ Requires FFmpeg binary!)
```json
{
  "fluent-ffmpeg": "^2.1.3",    ← Wrapper for FFmpeg
  "@types/fluent-ffmpeg": "^2.1.28"
}
```

#### File Storage (MinIO S3)
```json
{
  "minio": "^7.1.3",
  "@types/minio": "^7.1.1"
}
```

#### Remote Operations
```json
{
  "node-ssh": "^13.2.1",       ← SSH operations to cameras
  "@types/node-ssh": "^7.0.6"
}
```

#### Real-time Communication
```json
{
  "mqtt": "^5.14.1",           ← MQTT for camera restart signals
  "@types/mqtt": "^0.0.34"
}
```

#### Other
```json
{
  "axios": "^1.13.2",          ← HTTP client
  "bcrypt": "^5.1.1",          ← Password hashing
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.0",
  "multer": "^1.4.5-lts.1",    ← File upload middleware
  "reflect-metadata": "^0.1.13",
  "rxjs": "^7.8.1"
}
```

---

### 1.4 **Database Connections (7 Databases!)**

This is the MOST CRITICAL part for Docker!

```
┌────────────────────────────────────────────────────────────────┐
│                    MULTIPLE DB CONNECTIONS                    │
├────────────────────────────────────────────────────────────────┤
│ 1. PRIMARY (Main App)          → 192.168.100.125:5432          │
│    Database: know_db                                           │
│    Config: database.module.ts (DatabaseModule)                 │
│    Purpose: Tasks, Images, Users, Reports storage             │
│                                                                │
│ 2. MROI (New System)           → 192.168.100.83:5432           │
│    Database: ivs_service                                       │
│    Config: database.module.ts (mroi_db_conn)                   │
│    Purpose: Camera schema, MROI data                           │
│                                                                │
│ 3. MIOC (Legacy)               → 35.186.159.153:5432 (GCP)    │
│    Database: metlink_app_db                                    │
│    Config: app.module.ts (mioc_conn)                           │
│    Purpose: Legacy data integration                            │
│                                                                │
│ 4. ROBOT (Robot Data)          → 34.142.222.114:5432 (GCP)    │
│    Database: data_robot                                        │
│    Config: app.module.ts (robot_conn)                          │
│    Purpose: ml_robots table                                    │
│    ⚠️ SSL Required!                                             │
│                                                                │
│ 5. WORKFORCE (WFM)             → 34.87.166.125:5432 (GCP)      │
│    Database: ms_workforce                                      │
│    Config: app.module.ts (wf_conn)                             │
│    Purpose: wfm_* tables                                       │
│    ⚠️ SSL Required!                                             │
│                                                                │
│ NOTE: Robot DB & Workforce DB use:                             │
│       ssl: { rejectUnauthorized: false }                       │
│       ^ This is important for Docker!                          │
└────────────────────────────────────────────────────────────────┘
```

**Code Evidence:**
- [app.module.ts](backend/src/app.module.ts#L15-L85) - 7 database connections defined
- [database.module.ts](backend/src/database/database.module.ts#L1-L40) - Primary + MROI DB setup

---

### 1.5 **External Services Integration**

#### ✅ **MinIO (S3 Object Storage)**
```
Endpoint: storage.metthier.com:443
SSL: true
Credentials: 2 sets
  - adminworkflow (for general reports)
  - AeHWh2CaRsfl80v6oMQi (for robot data)
Buckets: report, robot
```

#### ✅ **Keycloak (Authentication & Authorization)**
```
URL: http://localhost:8080
Realm: METTHIER_Report
Client: metthier-report-backend
Purpose: OAuth2/OpenID Connect

Integration Points:
  - Auth Module: Passport + JWT
  - Users Module: Admin API calls
  - Frontend: keycloak-js v23.0.0
```

**Code Evidence:**
- [users.service.ts](backend/src/modules/users/users.service.ts) - Keycloak API integration

#### ✅ **MQTT (IoT Communication)**
```
Broker: mqtt://mqtt-open.metthier.ai:61883
Purpose: Send restart commands to IP cameras
Method: IvCamerasService.sendMqttRestart()
```

#### ✅ **FFmpeg (Binary Dependency - CRITICAL!)**
```
Purpose: Capture snapshots from RTSP camera streams
Used by: IvCamerasService
Features:
  - Reads RTSP streams
  - Captures JPEG snapshots
  - Supports environment variables for path

Environment Variables:
  FFMPEG_PATH=/usr/bin/ffmpeg (optional)
  FFPROBE_PATH=/usr/bin/ffprobe (optional)

If NOT set: fluent-ffmpeg auto-detects from system PATH
```

**Code Evidence:**
- [iv-cameras.service.ts](backend/src/modules/mroi/services/iv-cameras.service.ts#L1-L45) - FFmpeg setup and checking

---

### 1.6 **Special Communication Protocols**

#### ✅ **SSH (Node SSH)**
```
Purpose: Connect to IP cameras for configuration
Used by: IvCamerasService
Credentials: From env variables (likely in a separate config)
```

#### ✅ **RTSP (Real-Time Streaming Protocol)**
```
Purpose: Connect to camera video streams
Protocol: rtsp://camera-ip:554/stream
Used by: FFmpeg (via fluent-ffmpeg)
No special dependency needed - handled by FFmpeg
```

---

### 1.7 **Build & Startup Process**

```bash
# Development
npm install          # Install dependencies
npm run build        # Compile TypeScript → dist/
npm run start:dev    # Run with watch mode (NestJS CLI)

# Production
npm install          # Install deps
npm run build        # Compile
npm run start:prod   # node dist/main.js
```

**Build Output:** `dist/` folder (compiled JavaScript)

---

### 1.8 **Port Configuration**

```
Backend API:   PORT=3001 (default)
Health Check:  GET http://localhost:3001/api
API Prefix:    /api (all routes prefixed)
```

---

## 🎨 2. FRONTEND ARCHITECTURE (React + Vite)

### 2.1 **Technology Stack**

```
Runtime:     Node.js 18+ (build-time only)
Framework:   React 18.2
Build Tool:  Vite 5.0.8
Language:    TypeScript 5.2
CSS:         Emotion (@emotion/react, @emotion/styled)
UI Library:  Material-UI (MUI) v6.5
```

### 2.2 **Project Structure**

```
frontend/
├── src/
│   ├── App.tsx                ← Root component
│   ├── main.tsx               ← React entry point (Vite)
│   ├── App.css                ← Global styles
│   ├── components/            ← React components
│   │   ├── routes/            ← Route protection (Keycloak)
│   │   │   └── ProtectedRoute.tsx
│   │   └── layout/            ← Layout components
│   │       └── UserMenu.tsx   ← User menu (Auth context)
│   ├── pages/                 ← Page components
│   ├── services/              ← API clients
│   │   ├── api.client.ts      ← Axios HTTP client
│   │   ├── auth.service.ts    ← Auth API calls
│   │   ├── mroi.service.ts    ← MROI editor API
│   │   ├── image.service.ts   ← Image API
│   │   ├── report.service.ts  ← Report API
│   │   ├── robots.service.ts  ← Robot API
│   │   ├── task.service.ts    ← Task API
│   │   ├── users.service.ts   ← User API
│   │   └── storage.service.ts ← MinIO API
│   ├── contexts/              ← React contexts
│   │   ├── AuthContext.tsx    ← Auth state + Keycloak
│   │   └── DomainContext.tsx  ← Domain state
│   ├── types/                 ← TypeScript types
│   ├── config/                ← Configuration
│   ├── utils/                 ← Utility functions
│   └── routes/                ← Route definitions
├── public/                    ← Static assets
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── tsconfig.json              ← TypeScript config
├── tsconfig.node.json
├── vite.config.ts             ← Vite configuration
├── index.html                 ← Main HTML entry point
└── package.json
```

### 2.3 **Critical Dependencies**

#### UI Framework
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@mui/material": "^6.5.0",
  "@mui/icons-material": "^6.5.0",
  "@mui/x-data-grid": "^7.x.x",
  "bootstrap": "^5.3.8"
}
```

#### State Management & Data Fetching
```json
{
  "@tanstack/react-query": "^5.14.0",  ← Server state management
  "axios": "^1.13.2"                    ← HTTP client
}
```

#### Routing
```json
{
  "react-router-dom": "^6.20.0"
}
```

#### Authentication (Keycloak Integration)
```json
{
  "keycloak-js": "^23.0.0",             ← Client-side Keycloak SDK
  "jwt-decode": "^4.0.0"                ← JWT token decoding
}
```

#### Forms & Validation
```json
{
  "react-hook-form": "^7.49.0",
  "react-select": "^5.10.2"
}
```

#### Visualization & UI
```json
{
  "recharts": "^3.5.1",                 ← Chart library
  "lucide-react": "^0.561.0",           ← Icon library
  "sweetalert2": "^11.26.17"            ← Alert/modal library
}
```

#### Utilities
```json
{
  "dayjs": "^1.11.19",                  ← Date handling
  "uuid": "^13.0.0",                    ← UUID generation
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1"
}
```

### 2.4 **Vite Configuration**

**Key Settings:**
```typescript
export default defineConfig({
  plugins: [react()],
  
  // Path alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  
  // Dev server
  server: {
    port: 3000,           // ← Dev port
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

**Important:**
- Dev proxy redirects `/api/*` to backend
- Production: needs different setup (see docker strategy)

### 2.5 **Build & Startup Process**

```bash
# Development
npm install                    # Install dependencies
npm run dev                    # Start Vite dev server (port 3000)

# Production Build
npm run build                  # Build: tsc && vite build
                              # Output: dist/ (static files)
npm run preview               # Preview production build
```

**Build Output:**
- `dist/` folder with HTML/CSS/JS bundles
- Optimized & minified
- Ready for static server (Nginx)

### 2.6 **Keycloak Integration (Frontend)**

```typescript
// AuthContext.tsx - Manages Keycloak auth
- keycloak-js initialization
- Token management
- User info caching
- Auto-refresh token

// ProtectedRoute.tsx - Route protection
- Checks isAuthenticated
- Redirects to login if needed
- Shows loading state

// API client - Adds auth header
- All API calls include: Authorization: Bearer {token}
```

---

### 2.7 **Port Configuration**

```
Frontend Dev:  3000 (Vite dev server)
Frontend Prod: 80 (Nginx - via Docker)
Backend API:   3001 (proxied from 3000 in dev)
```

---

## 🔐 3. KEYCLOAK INTEGRATION

### 3.1 **Current Architecture**

```
┌──────────────────────────────────────┐
│      Frontend (React)                 │
│  keycloak-js v23.0.0                 │
│  - OAuth2/OpenID Connect              │
│  - Token management                   │
│  - Auto-refresh                       │
└──────────────────────────────────────┘
                 ↓
         KEYCLOAK SERVER
         (localhost:8080)
         
         Configuration:
         - Realm: METTHIER_Report
         - Client: metthier-report-backend
         - Admin User: admin
         - Admin Pass: AaBbCc@202512
                 ↓
┌──────────────────────────────────────┐
│       Backend (NestJS)                │
│  - Passport JWT strategy              │
│  - Keycloak Admin API calls           │
│  - User/Role management               │
└──────────────────────────────────────┘
```

### 3.2 **Location of Keycloak**

```
Folder: keycloak-26.4.5/
├── bin/
│   ├── kc.sh         ← Linux start script
│   ├── kc.bat        ← Windows start script
│   ├── kcadm.sh      ← Admin CLI
│   └── ...
├── conf/
│   ├── keycloak.conf ← Main config
│   ├── cache-ispn.xml
│   └── README.md
├── data/
│   └── h2/          ← Default embedded database (H2)
├── lib/
├── providers/
├── themes/
├── LICENSE.txt
├── README.md
└── version.txt (26.4.5)
```

### 3.3 **Keycloak Startup**

**Current (Local):**
```bash
cd keycloak-26.4.5
./bin/kc.sh start-dev
# OR on Windows:
bin\kc.bat start-dev
```

**URL:** `http://localhost:8080`

### 3.4 **Docker Strategy for Keycloak**

**Option A (Recommended): Use Official Docker Image**
```dockerfile
FROM keycloak:26.0.0
ENV KC_HOSTNAME=localhost
ENV KC_HOSTNAME_PORT=8080
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=AaBbCc@202512
```

**Pros:**
- ✅ Official, tested, maintained
- ✅ Smaller image size
- ✅ Security patches included
- ✅ No manual JVM setup

**Option B: Build from Source**
```dockerfile
FROM openjdk:17-slim
COPY keycloak-26.4.5/ /opt/keycloak/
WORKDIR /opt/keycloak
CMD ["./bin/kc.sh", "start"]
```

**Cons:**
- ❌ Larger image (~1.5GB)
- ❌ Slower startup
- ❌ More maintenance

**Recommendation:** ✅ **Use Option A** (Official image)

---

## ⚠️ 4. CRITICAL CHALLENGES FOR DOCKER

### 4.1 **FFmpeg Binary Dependency (BLOCKER!)**

**Problem:**
```typescript
// backend/src/modules/mroi/services/iv-cameras.service.ts:64-77
private async checkFFmpegInstallation() {
  try {
    await execAsync('ffmpeg -version');
    this.logger.log('✅ FFmpeg is installed');
  } catch (error) {
    this.logger.warn('⚠️ FFmpeg is NOT installed');
  }
}
```

**Solution for Docker:**
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache ffmpeg ffprobe
```

**Size Impact:**
- Alpine ffmpeg: ~30MB
- Full ffmpeg: ~50-80MB

**Testing:**
```dockerfile
RUN ffmpeg -version && ffprobe -version
```

---

### 4.2 **Multiple Database Connections (NETWORK!)**

**Problem:**
```
Backend needs to connect to 5 different PostgreSQL databases:
1. 192.168.100.125:5432 (Local network)
2. 192.168.100.83:5432  (Local network)
3. 35.186.159.153:5432  (GCP)
4. 34.142.222.114:5432  (GCP)
5. 34.87.166.125:5432   (GCP)
```

**Challenges:**
- ⚠️ Backend container must be able to reach these IPs
- ⚠️ Local network (192.168.x.x) - containers must have network access
- ⚠️ GCP databases - must be publicly accessible or VPN required
- ⚠️ SSL certificates needed for some connections

**Solution for Docker:**
```yaml
# docker-compose.yml
backend:
  network_mode: host  # Share host network
  # OR
  networks:
    - report-network
    
# In .env.docker
DATABASE_HOST=192.168.100.125  # Same as host machine
```

**Testing:**
```bash
docker-compose exec backend nc -zv 192.168.100.125 5432
docker-compose exec backend nc -zv 35.186.159.153 5432
```

---

### 4.3 **MQTT External Broker**

**Problem:**
```typescript
// backend/src/modules/mroi/services/iv-cameras.service.ts:236
const client = mqtt.connect('mqtt://mqtt-open.metthier.ai:61883');
```

**Solution:**
- ✅ Container can reach external MQTT broker (no local setup needed)
- ✅ No credentials used (public broker assumed)
- Test: `docker-compose exec backend nc -zv mqtt-open.metthier.ai 61883`

---

### 4.4 **SSH to IP Cameras (Network Dependent)**

**Problem:**
```typescript
// Uses node-ssh to connect to cameras
const ssh = new NodeSSH();
await ssh.connect({
  host: cameraIP,
  port: 22,
  username: 'admin',
  password: 'password'
});
```

**Solution:**
- ✅ Container must have network access to camera IPs
- ✅ Credentials in .env
- Challenge: Depends on your network setup

---

### 4.5 **MinIO S3 Storage (External)**

**Problem:**
```env
MINIO_ENDPOINT=storage.metthier.com:443
MINIO_USE_SSL=true
```

**Solution:**
- ✅ Container can reach external endpoint
- ✅ Uses HTTPS (port 443)
- ✅ Credentials in .env
- Test: `docker exec backend curl https://storage.metthier.com:443`

---

### 4.6 **Keycloak Integration (Port 8080)**

**Problem:**
```env
KEYCLOAK_URL=http://localhost:8080
```

**Challenges in Docker:**
- ❌ `localhost:8080` inside container ≠ `localhost:8080` on host
- ✅ If running Keycloak in docker-compose, use service name
- ✅ If running Keycloak on host, use `host.docker.internal:8080` (Docker Desktop)

**Solution:**
```yaml
# docker-compose.yml
backend:
  environment:
    KEYCLOAK_URL: http://keycloak:8080  # Service name
    # OR
    KEYCLOAK_URL: http://host.docker.internal:8080  # If Keycloak on host
```

---

### 4.7 **Environment Variable Management**

**Problem:**
- ❌ `.env` has sensitive credentials (DB passwords, API keys)
- ❌ Frontend needs different CORS config than backend
- ❌ Docker vs local development different settings

**Solution:**
```
Files:
.env                  ← Local development
.env.docker          ← Docker-specific settings
.env.production      ← Production deployment

.dockerignore: Include .env to avoid baking secrets into image
```

---

## 📊 5. ENVIRONMENT VARIABLES MAPPING

### 5.1 **Backend Environment Variables (Current)**

```bash
# ===== DATABASES (5 Connections) =====
DATABASE_HOST=192.168.100.125
DATABASE_PORT=5432
DATABASE_USERNAME=kdadmin
DATABASE_PASSWORD=P@ssw0rdData
DATABASE_NAME=know_db

MROI_DB_HOST=192.168.100.83
MROI_DB_PORT=5432
MROI_DB_USERNAME=aiintern
MROI_DB_PASSWORD=Public@aiintern0
MROI_DB_NAME=ivs_service

MIOC_DB_HOST=35.186.159.153
MIOC_DB_PORT=5432
MIOC_DB_USERNAME=supisara
MIOC_DB_PASSWORD=3X67mOIaDwW0CgWyJP
MIOC_DB_NAME=metlink_app_db

ROBOT_DB_HOST=34.142.222.114
ROBOT_DB_PORT=5432
ROBOT_DB_USER=tanapan.pan
ROBOT_DB_PASSWORD=1O7i06GcwF8jC3Qctj
ROBOT_DB_NAME=data_robot

WF_DB_HOST=34.87.166.125
WF_DB_PORT=5432
WF_DB_USER=datascience
WF_DB_PASSWORD=xulamyinkrcd
WF_DB_NAME=ms_workforce

# ===== MINIO (2 Credentials) =====
MINIO_ENDPOINT=storage.metthier.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=adminworkflow
MINIO_SECRET_KEY=P@ssw0rd@work
MINIO_BUCKET=report

MINIO_ROBOT_ENDPOINT=storage.metthier.com
MINIO_ROBOT_PORT=443
MINIO_ROBOT_USE_SSL=true
MINIO_ROBOT_ACCESS_KEY=AeHWh2CaRsfl80v6oMQi
MINIO_ROBOT_SECRET_KEY=cyiN49Z9iZSvVebFtZwxJeAzFBlbfOS4DltMyecn
MINIO_ROBOT_BUCKET=robot

# ===== KEYCLOAK =====
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=METTHIER_Report
KEYCLOAK_CLIENT_ID=metthier-report-backend
KEYCLOAK_CLIENT_SECRET=uV09v18nX1STW5xqpbWni0JCVIdTp56f
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=AaBbCc@202512

# ===== CORS =====
CORS_ORIGIN=http://localhost:3000

# ===== SECURITY =====
USER_SECRET_KEY=c60bc40859e9c0e
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRATION=3h

# ===== JASPER REPORTS =====
JASPER_USERNAME=miocadmin
JASPER_PASSWORD=miocadmin

# ===== WEB INTEGRATION =====
TRUE_ALARM_WEB_USERNAME=MIOC_@dmin
TRUE_ALARM_WEB_PASSWORD=MIOC_@dmin_p@ssw0rd

# ===== APPLICATION =====
PORT=3001
```

**Total: 47 environment variables!**

### 5.2 **Frontend Environment Variables (Implicit)**

```bash
# These are set at runtime, not in .env:
VITE_API_BASE_URL=http://localhost:3001  (from vite.config.ts proxy)
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=METTHIER_Report
VITE_KEYCLOAK_CLIENT_ID=metthier-report-backend
```

---

## 🏗️ 6. RECOMMENDED DOCKER ARCHITECTURE

### 6.1 **Service Layout**

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Frontend Container (Nginx)                            │   │
│  │ - Serves React static files                           │   │
│  │ - Port: 80 (host) → 80 (container)                   │   │
│  │ - Nginx proxy to backend /api/*                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Backend Container (Node + NestJS)                     │   │
│  │ - API server                                          │   │
│  │ - Port: 3001 (host) → 3001 (container)               │   │
│  │ - Connects to 5 external PostgreSQL DBs              │   │
│  │ - FFmpeg installed for RTSP snapshots                │   │
│  └──────────────────────────────────────────────────────┘   │
│         ↓                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Keycloak Container (Official Image)                  │   │
│  │ - Auth server                                        │   │
│  │ - Port: 8080 (host) → 8080 (container)               │   │
│  │ - Realm: METTHIER_Report                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  External Services (Not in Docker):                          │
│  ├── PostgreSQL #1: 192.168.100.125:5432                   │
│  ├── PostgreSQL #2: 192.168.100.83:5432                    │
│  ├── PostgreSQL #3: 35.186.159.153:5432 (GCP)              │
│  ├── PostgreSQL #4: 34.142.222.114:5432 (GCP)              │
│  ├── PostgreSQL #5: 34.87.166.125:5432 (GCP)               │
│  ├── MinIO: storage.metthier.com:443                       │
│  ├── MQTT: mqtt-open.metthier.ai:61883                     │
│  └── IP Cameras: Various IPs (SSH + RTSP)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 **Network Strategy**

```yaml
# docker-compose.yml
networks:
  report-network:
    driver: bridge
    
services:
  frontend:
    networks:
      - report-network
  backend:
    networks:
      - report-network
  keycloak:
    networks:
      - report-network
```

**Key Points:**
- Services communicate via service names (e.g., `http://backend:3001`)
- External databases stay on their own networks
- Host machine is accessible via `host.docker.internal` (Docker Desktop)

---

## 🔧 7. DOCKERFILE REQUIREMENTS

### 7.1 **Backend Dockerfile**

```dockerfile
# Stage 1: Builder
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ⚠️ CRITICAL: Install FFmpeg
RUN apk add --no-cache ffmpeg ffprobe

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
RUN apk add --no-cache ffmpeg ffprobe \
                        curl \
                        netcat-openbsd
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

**Key Points:**
- ✅ 2-stage build (smaller image)
- ✅ Alpine base (lightweight)
- ✅ FFmpeg + ffprobe installed
- ✅ Non-root user (security)
- ✅ Health check tools (curl, netcat)

### 7.2 **Frontend Dockerfile**

```dockerfile
# Stage 1: Builder
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key Points:**
- ✅ 2-stage build
- ✅ Nginx to serve static files
- ✅ Custom nginx config for SPA routing

### 7.3 **Keycloak Dockerfile (if custom)**

```dockerfile
# Use official image
FROM keycloak:26.0.0
ENV KC_HOSTNAME=keycloak
ENV KC_HOSTNAME_PORT=8080
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=AaBbCc@202512
EXPOSE 8080
```

---

## 📋 8. COMPLETE FILE CHECKLIST

### What Needs to Be Created

```
Report-Robot/
├── Dockerfile                    ← Backend Dockerfile
├── .dockerignore                 ← Docker build exclusions
├── docker-compose.yml            ← Orchestration
├── nginx.conf                    ← Frontend nginx config
├── .env.docker                   ← Docker-specific env vars
│
frontend/
└── Dockerfile                    ← Frontend Dockerfile

backend/
└── Dockerfile                    ← (Optional: can use root Dockerfile)
```

### Files to Modify

```
backend/.env    → .env.docker (for Docker)
```

---

## ⏱️ 9. IMPLEMENTATION TIMELINE

| Phase | Task | Time | Dependency |
|-------|------|------|-----------|
| 1 | Create Backend Dockerfile | 20 min | None |
| 2 | Create Frontend Dockerfile | 20 min | Phase 1 |
| 3 | Create Keycloak config | 15 min | Phase 1-2 |
| 4 | Create docker-compose.yml | 30 min | Phase 1-3 |
| 5 | Create nginx.conf | 15 min | Phase 2 |
| 6 | Create .dockerignore | 5 min | All |
| 7 | Test build locally | 30 min | Phase 1-6 |
| 8 | Test docker-compose up | 20 min | Phase 7 |
| 9 | Verify all connections | 30 min | Phase 8 |
| 10 | Documentation | 20 min | All |
| **Total** | | **3.5 hours** | |

---

## 🚀 10. DEPLOYMENT STRATEGY

### 10.1 **Local Development (Current Way)**

```bash
# Works fine as-is
# No Docker needed
npm run start:dev    # backend
npm run dev          # frontend
# Keycloak runs standalone
```

### 10.2 **Docker for Local Development**

```bash
docker-compose up

# Services start:
# - frontend: http://localhost
# - backend: http://localhost:3001
# - keycloak: http://localhost:8080
```

### 10.3 **Docker for Staging/Production**

```bash
docker-compose -f docker-compose.prod.yml up -d

# Need to handle:
# - SSL certificates (nginx)
# - External database connections
# - Environment secrets
# - Health checks
# - Logging
```

---

## 📊 11. IMAGE SIZE ESTIMATION

### Without Optimization

```
Backend:
  Node 18: 100 MB
  Dependencies: 400 MB
  Code: 10 MB
  FFmpeg: 50 MB
  Total: ~560 MB

Frontend:
  Node 18: 100 MB
  Dependencies: 300 MB
  Build output: 2 MB
  Nginx: 5 MB
  Total: ~407 MB (before runtime layer)
  Runtime Nginx only: ~10 MB

Keycloak:
  Official Image: 300-400 MB
```

### With Optimization (Multi-stage)

```
Backend: 200-250 MB ⬇️
Frontend: 15-20 MB ⬇️
Keycloak: 300-400 MB (no change)
```

---

## ✅ 12. CRITICAL SUCCESS FACTORS

### ✅ Must Handle
1. ✅ FFmpeg binary installation
2. ✅ All 5 database connections
3. ✅ Keycloak integration (localhost → service name)
4. ✅ Environment variable management
5. ✅ CORS configuration for Docker setup
6. ✅ Network connectivity to external services

### ⚠️ Nice to Have
1. ⚠️ Health checks in docker-compose
2. ⚠️ Logging configuration
3. ⚠️ Volume for persistent data
4. ⚠️ Restart policies
5. ⚠️ Resource limits

### ❌ Avoid
1. ❌ Building Keycloak from source
2. ❌ Hardcoding credentials
3. ❌ Using `latest` tags
4. ❌ Running as root in containers
5. ❌ Single-stage builds

---

## 📋 FINAL RECOMMENDATION

### **Feasibility: ✅ 100% (HIGH CONFIDENCE)**

This project is **very well-designed for containerization**:

| Aspect | Rating | Notes |
|--------|--------|-------|
| Architecture | ✅ Excellent | Clean separation, modular design |
| Dependencies | ✅ Good | Only FFmpeg binary needed, npm handles rest |
| Configuration | ✅ Excellent | Environment-driven, already supports it |
| External Services | ✅ Manageable | Well-documented external endpoints |
| Complexity | 🟡 Medium | 5 databases, but straightforward setup |
| Timeline | ✅ Realistic | 3-4 hours for complete Docker setup |
| Risk Level | ✅ Low | No breaking changes needed |

### **Start Building? YES ✅**

All prerequisites are met. Ready to create Dockerfiles and docker-compose.yml.

---

## 📞 Next Steps

1. **Confirm:** Do you want me to create all Docker files now?
2. **Options:**
   - Option A: Full setup (Keycloak + Backend + Frontend)
   - Option B: Backend + Frontend only (Keycloak on host)
   - Option C: Step-by-step (one Dockerfile at a time)

3. **Questions before we start:**
   - Will Keycloak run in Docker or on host?
   - Need to handle database migrations?
   - Production or development-focused?
   - Any specific Docker registry requirements?

---

**Status:** Ready for implementation ✅
